# frozen_string_literal: true

require "stringio"
require "time"
require "cgi"
require "net/http"

require_relative "header_hash"
require_relative "proxy_param_builder"

module ShopifyCLI
  module Theme
    class DevServer
      HOP_BY_HOP_HEADERS = [
        "connection",
        "keep-alive",
        "proxy-authenticate",
        "proxy-authorization",
        "te",
        "trailer",
        "transfer-encoding",
        "upgrade",
        "content-security-policy",
        "content-length",
      ]

      class Proxy
        SESSION_COOKIE_NAME = "_shopify_essential"
        SESSION_COOKIE_REGEXP = /#{SESSION_COOKIE_NAME}=([^;]*)(;|$)/
        SESSION_COOKIE_MAX_AGE = 60 * 60 * 23 # 1 day - leeway of 1h
        IGNORED_ENDPOINTS = %w[
          shopify/monorail
          mini-profiler-resources
          web-pixels-manager
          wpm
        ]

        def initialize(ctx, theme, param_builder, cache_cleaned = false)
          @ctx = ctx
          @theme = theme
          @param_builder = param_builder
          @cache_cleaned = cache_cleaned

          @core_endpoints = Set.new
          @secure_session_id = nil
          @last_session_cookie_refresh = nil
        end

        def call(env)
          return [204, {}, []] if IGNORED_ENDPOINTS.any? { |endpoint| env["PATH_INFO"].include?(endpoint) }

          headers = extract_http_request_headers(env)
          is_chrome = headers["User-Agent"] =~ /[Cc]hrome/
          headers["Host"] = shop
          headers["Cookie"] = add_session_cookie(headers["Cookie"])
          headers["Accept-Encoding"] = "none"
          headers["User-Agent"] = "Shopify CLI"
          query = URI.decode_www_form(env["QUERY_STRING"])
          replace_templates = build_replacement_param(env)

          response = set_preview_theme_id(env, query, headers)
          return serve_response(response, env) if response

          response = if replace_templates.any?
            # Pass to SFR the recently modified templates in `replace_templates` or
            # `replace_extension_templates` body param
            headers["Authorization"] = "Bearer #{bearer_token}"
            form_data = URI.decode_www_form(env["rack.input"].read).to_h
            request(
              "POST", env["PATH_INFO"],
              headers: headers,
              query: query,
              form_data: form_data.merge(replace_templates).merge(_method: env["REQUEST_METHOD"])
            )
          else
            request(
              env["REQUEST_METHOD"], env["PATH_INFO"],
              headers: headers,
              query: query,
              body_stream: (env["rack.input"] if has_body?(headers))
            )
          end

          headers = get_response_headers(response, env)
          headers = modify_headers(headers) unless is_chrome

          unless headers["x-storefront-renderer-rendered"]
            @core_endpoints << env["PATH_INFO"]
          end

          serve_response(response, env, headers)
        end

        def secure_session_id
          if secure_session_id_expired?
            @ctx.debug("Refreshing preview _shopify_essential cookie")
            response = request("HEAD", "/", query: [[:preview_theme_id, theme_id]])
            @secure_session_id = extract_shopify_essential_from_response_headers(response)
            @last_session_cookie_refresh = Time.now
          end

          @secure_session_id
        end

        private

        def serve_response(response, env, headers = get_response_headers(response, env))
          body = patch_body(env, response.body)
          body = [body] unless body.respond_to?(:each)
          [response.code, headers, body]
        end

        def set_preview_theme_id(env, query, headers)
          if env["PATH_INFO"].start_with?("/password")
            @cache_cleaned = false
            return
          end

          return if @cache_cleaned

          @cache_cleaned = true

          query = query.dup
          query << ["preview_theme_id", theme_id]

          request(
            env["REQUEST_METHOD"], env["PATH_INFO"],
            headers: headers,
            query: query,
            body_stream: (env["rack.input"] if has_body?(headers))
          )
        end

        def patch_body(env, body)
          return [""] unless body

          # Patch custom font asset urls
          body = body.gsub(
            %r{(url\((["']))?(http:|https:)?//#{shop}(?!/cdn/fonts)(/.*?\.(woff2?|eot|ttf))(\?[^'"\)]*)?(\2\))?\s*}
          ) do |_|
            match = Regexp.last_match
            "#{match[1]}http://#{host(env)}#{match[4]}#{match[6]}#{match[7]} "
          end

          # Patch data-base-url attributes
          body = body.gsub(%r{(data-base-url=(["']))(http:|https:)?//#{shop}(.*?)(\2)}) do |_|
            match = Regexp.last_match
            "#{match[1]}http://#{host(env)}#{match[4]}#{match[5]}"
          end

          body
        end

        def host(env)
          env["HTTP_HOST"]
        end

        def has_body?(headers)
          headers["Content-Length"] || headers["Transfer-Encoding"]
        end

        def bearer_token
          Environment.storefront_renderer_auth_token ||
            ShopifyCLI::DB.get(:storefront_renderer_production_exchange_token) ||
            raise(KeyError, "storefront_renderer_production_exchange_token missing")
        end

        def extract_http_request_headers(env)
          headers = HeaderHash.new

          env.each do |name, value|
            next if value.nil?

            if /^HTTP_[A-Z0-9_]+$/.match?(name) || name == "CONTENT_TYPE" || name == "CONTENT_LENGTH"
              headers[reconstruct_header_name(name)] = value
            end
          end

          x_forwarded_for = (headers["X-Forwarded-For"].to_s.split(/, +/) << env["REMOTE_ADDR"]).join(", ")
          headers["X-Forwarded-For"] = x_forwarded_for

          headers
        end

        def normalize_headers(headers)
          mapped = headers.map do |k, v|
            [k, v.is_a?(Array) ? v.join("\n") : v]
          end
          HeaderHash.new(Hash[mapped])
        end

        def reconstruct_header_name(name)
          name.sub(/^HTTP_/, "").gsub("_", "-")
        end

        def add_session_cookie(cookie_header)
          cookie_header = if cookie_header
            cookie_header.dup
          else
            +""
          end

          expected_session_cookie = "#{SESSION_COOKIE_NAME}=#{secure_session_id}"

          unless cookie_header.include?(expected_session_cookie)
            if cookie_header.include?(SESSION_COOKIE_NAME)
              cookie_header.sub!(SESSION_COOKIE_REGEXP, expected_session_cookie)
            else
              cookie_header << "; " unless cookie_header.empty?
              cookie_header << expected_session_cookie
            end
          end

          cookie_header
        end

        def secure_session_id_expired?
          return true unless @secure_session_id && @last_session_cookie_refresh

          Time.now - @last_session_cookie_refresh >= SESSION_COOKIE_MAX_AGE
        end

        def extract_shopify_essential_from_response_headers(headers)
          return unless headers["set-cookie"]

          headers["set-cookie"][SESSION_COOKIE_REGEXP, 1]
        end

        def get_response_headers(response, env)
          response_headers = normalize_headers(
            response.respond_to?(:headers) ? response.headers : response.to_hash,
          )
          # According to https://tools.ietf.org/html/draft-ietf-httpbis-p1-messaging-14#section-7.1.3.1Acc
          # should remove hop-by-hop header fields
          # (Taken from Rack::Proxy)
          response_headers.reject! { |k| HOP_BY_HOP_HEADERS.include?(k.downcase) }

          if response_headers["location"]&.include?("myshopify.com") ||
            response_headers["location"]&.include?("spin.dev")
            response_headers["location"].gsub!(%r{(https://#{shop})}, "http://#{host(env)}")
          end

          new_session_id = extract_shopify_essential_from_response_headers(response_headers)
          if new_session_id
            @ctx.debug("New _shopify_essential cookie from response")
            @secure_session_id = new_session_id
            @last_session_cookie_refresh = Time.now
          end

          response_headers
        end

        def request(method, path, headers: nil, query: [], form_data: nil, body_stream: nil)
          uri = URI.join("https://#{shop}", path)

          if proxy_via_theme_access_app?(path)
            headers = headers ? headers.slice("ACCEPT", "CONTENT-TYPE", "CONTENT-LENGTH", "Cookie") : {}
            headers.merge!({
              "X-Shopify-Access-Token" => Environment.admin_auth_token,
              "X-Shopify-Shop" => shop,
            })
            uri = URI.join("https://#{ShopifyCLI::Constants::ThemeKitAccess::BASE_URL}", "cli/sfr#{path}")
          end

          uri.query = URI.encode_www_form(query + [[:_fd, 0], [:pb, 0]])

          @ctx.debug("Proxying #{method} #{uri}")

          Net::HTTP.start(uri.host, 443, use_ssl: true) do |http|
            req_class = Net::HTTP.const_get(method.capitalize)
            req = req_class.new(uri)
            req.initialize_http_header(headers) if headers
            req.set_form_data(form_data) if form_data
            req.body_stream = body_stream if body_stream
            response = http.request(req)
            @ctx.debug("`-> #{response.code} request_id: #{response["x-request-id"]}")
            response
          end
        end

        def shop
          @shop ||= @theme.shop
        end

        def theme_id
          @theme_id ||= @theme.id
        end

        def build_replacement_param(env)
          @param_builder
            .with_core_endpoints(@core_endpoints)
            .with_rack_env(env)
            .build
        end

        def proxy_via_theme_access_app?(path)
          return false unless Environment.theme_access_password?
          return false if path == "/localization"
          return false if path.start_with?("/cart/")

          true
        end

        def modify_headers(headers)
          if headers["set-cookie"]&.include?("storefront_digest")
            headers["set-cookie"] = modify_set_cookie_header_for_safari(headers["set-cookie"])
          end

          headers
        end

        def modify_set_cookie_header_for_safari(set_cookie_header)
          set_cookie_header.gsub("secure;", "secure: false;")
        end
      end
    end
  end
end
