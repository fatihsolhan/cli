# frozen_string_literal: true

require "test_helper"
require "shopify_cli/theme/dev_server/proxy"
require "shopify_cli/theme/development_theme"
require "rack/mock"
require "timecop"

module ShopifyCLI
  module Theme
    class DevServer
      class ProxyTest < Minitest::Test
        SECURE_SESSION_ID = "deadbeef"

        def setup
          super

          ShopifyCLI::DB.stubs(:exists?).with(:shop).returns(true)
          ShopifyCLI::DB
            .stubs(:get)
            .with(:development_theme_id)
            .returns("123456789")
          stub_shop

          root = ShopifyCLI::ROOT + "/test/fixtures/theme"

          @theme = DevelopmentTheme.new(@ctx, root: root)
          @syncer = stub(pending_updates: [])
          @ctx = TestHelpers::FakeContext.new(root: root)

          param_builder = ProxyParamBuilder
            .new
            .with_theme(@theme)
            .with_syncer(@syncer)

          @proxy = Proxy.new(@ctx, @theme, param_builder, true)
        end

        def test_get_is_proxied_to_online_store
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              body: nil,
              headers: default_proxy_headers,
            )
            .to_return(status: 200)

          stub_session_id_request

          request.get("/")
        end

        def test_monorail_requests_are_ignored
          path = "/cli/sfr/.well-known/shopify/monorail/unstable/produce_batch?_fd=0&pb=0"
          stub_session_id_request

          request.post(path)

          assert_requested(:post,
            "https://dev-theme-server-store.myshopify.com#{path}",
            times: 0)
        end

        def test_miniprofiler_requests_are_ignored
          path = "cli/sfr/mini-profiler-resources/includes.js"
          stub_session_id_request

          request.get(path)

          assert_requested(:get,
            "https://dev-theme-server-store.myshopify.com#{path}",
            times: 0)
        end

        def test_webpixels_requests_are_ignored
          path = "cli/sfr/web-pixels-manager@0.0.225@487839awab38cc13pfd6bd3d2m9a3137/sandbox/?_fd=0&pb=0"
          stub_session_id_request

          request.get(path)

          assert_requested(:get,
            "https://dev-theme-server-store.myshopify.com#{path}",
            times: 0)
        end

        def test_new_webpixels_requests_are_ignored
          path = "cli/sfr/wpm@0.0.264@24271aa3w5f39399apdce3a888m968cefc2/sandbox/worker.modern.js"
          stub_session_id_request

          request.get(path)

          assert_requested(
            :get,
            "https://dev-theme-server-store.myshopify.com#{path}",
            times: 0
          )
        end

        def test_get_is_proxied_to_theme_access_api_when_password_is_provided
          store = "dev-theme-server-store.myshopify.com"

          Environment.stubs(:theme_access_password?).returns(true)
          Environment.stubs(:store).returns(store)
          stub_request(:head, "https://theme-kit-access.shopifyapps.com/cli/sfr/?_fd=0&pb=0&preview_theme_id=123456789")
            .with(headers: { "X-Shopify-Shop" => store })
            .to_return(
              status: 200,
              headers: { "Set-Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}" },
            )
          stub_request(:get, "https://theme-kit-access.shopifyapps.com/cli/sfr/?_fd=0&pb=0")
            .with(
              headers: {
                "Content-Length" => "0",
                "Cookie" => "_shopify_essential=deadbeef",
                "X-Shopify-Shop" => store,
              },
            )
            .to_return(status: 200, body: "", headers: {})

          request.get("/")

          assert_requested(:get, "https://theme-kit-access.shopifyapps.com/cli/sfr/?_fd=0&pb=0")
        end

        def test_request_is_not_proxied_to_theme_access_api_if_it_cant_respond
          store = "dev-theme-server-store.myshopify.com"

          Environment.stubs(:theme_access_password?).returns(true)
          Environment.stubs(:store).returns(store)

          stub_request(:head, "https://theme-kit-access.shopifyapps.com/cli/sfr/?_fd=0&pb=0&preview_theme_id=123456789")
            .with(headers: { "X-Shopify-Shop" => store })
            .to_return(status: 200, body: "", headers: {})
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/localization?_fd=0&pb=0")
            .with(headers: { "Host" => store })
            .to_return(status: 200, body: "", headers: {})

          request.post("/localization")

          assert_requested(:post, "https://dev-theme-server-store.myshopify.com/localization?_fd=0&pb=0")
        end

        def test_refreshes_session_cookie_on_expiry
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              body: nil,
              headers: default_proxy_headers,
            )
            .to_return(status: 200)
            .times(2)

          stub_session_id_request
          request.get("/")

          # Should refresh the session cookie after 1 day
          Timecop.freeze(DateTime.now + 1) do # rubocop:disable Style/DateTime
            request.get("/")
          end

          assert_requested(:head,
            "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0&preview_theme_id=123456789",
            times: 2)
        end

        def test_update_session_cookie_when_returned_from_backend
          stub_session_id_request
          new_shopify_essential = "#{SECURE_SESSION_ID}2"

          # POST response returning a new session cookie (Set-Cookie)
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/account/login?_fd=0&pb=0")
            .with(
              headers: {
                "Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}",
              },
            )
            .to_return(
              status: 200,
              body: "",
              headers: {
                "Set-Cookie" => "_shopify_essential=#{new_shopify_essential}",
              },
            )

          # GET / passing the new session cookie
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              headers: {
                "Cookie" => "_shopify_essential=#{new_shopify_essential}",
              },
            )
            .to_return(status: 200)

          request.post("/account/login")
          request.get("/")
        end

        def test_form_data_is_proxied_to_online_store
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/password?_fd=0&pb=0")
            .with(
              body: {
                "form_type" => "storefront_password",
                "password" => "notapassword",
              },
              headers: default_proxy_headers.merge(
                "Content-Type" => "application/x-www-form-urlencoded",
              ),
            )
            .to_return(status: 200)

          stub_session_id_request

          request.post("/password", params: {
            "form_type" => "storefront_password",
            "password" => "notapassword",
          })
        end

        def test_multipart_is_proxied_to_online_store
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/cart/add?_fd=0&pb=0")
            .with(
              headers: default_proxy_headers.merge(
                "Content-Length" => "272",
                "Content-Type" => "multipart/form-data; boundary=AaB03x",
              ),
            )
            .to_return(status: 200)

          stub_session_id_request

          file = ShopifyCLI::ROOT + "/test/fixtures/theme/assets/theme.css"

          request.post("/cart/add", params: {
            "form_type" => "product",
            "quantity" => 1,
            "file" => Rack::Multipart::UploadedFile.new(file), # To force multipart
          })
        end

        def test_query_parameters_with_two_values
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0&value=A&value=B")
            .with(headers: default_proxy_headers)
            .to_return(status: 200, body: "", headers: {})

          stub_session_id_request

          URI.expects(:encode_www_form)
            .with([[:preview_theme_id, "123456789"], [:_fd, 0], [:pb, 0]])
            .returns("_fd=0&pb=0&preview_theme_id=123456789")

          URI.expects(:encode_www_form)
            .with([["value", "A"], ["value", "B"], [:_fd, 0], [:pb, 0]])
            .returns("_fd=0&pb=0&value=A&value=B")

          request.get("/?value=A&value=B")
        end

        def test_storefront_redirect_headers_are_rewritten
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(headers: default_proxy_headers)
            .to_return(status: 302, headers: {
              "Location" => "https://dev-theme-server-store.myshopify.com/password",
            })
          @proxy.stubs(:host).returns("127.0.0.1:8282")

          stub_session_id_request
          response = request.get("/")

          assert_equal("http://127.0.0.1:8282/password", response.headers["Location"])
        end

        def test_storefront_with_spin_redirect_headers_are_rewritten
          stub_shop("eu.spin.dev")
          stub_request(:get, "https://dev-theme-server-store.eu.spin.dev/?_fd=0&pb=0")
            .with(headers: default_proxy_headers("eu.spin.dev"))
            .to_return(status: 302, headers: {
              "Location" => "https://dev-theme-server-store.eu.spin.dev/password",
            })
          @proxy.stubs(:host).returns("127.0.0.1:8282")

          stub_session_id_request("eu.spin.dev")
          response = request.get("/")

          assert_equal("http://127.0.0.1:8282/password", response.headers["Location"])
        end

        def test_non_storefront_redirect_headers_are_not_rewritten
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(headers: default_proxy_headers)
            .to_return(status: 302, headers: {
              "Location" => "https://some-other-site.com/",
            })

          stub_session_id_request
          response = request.get("/")

          assert_equal("https://some-other-site.com/", response.headers["Location"])
        end

        def test_hop_to_hop_headers_are_removed_from_proxied_response
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(headers: default_proxy_headers)
            .to_return(status: 200, headers: {
              "Connection" => 1,
              "Keep-Alive" => 1,
              "Proxy-Authenticate" => 1,
              "Proxy-Authorization" => 1,
              "te" => 1,
              "Trailer" => 1,
              "Transfer-Encoding" => 1,
              "Upgrade" => 1,
              "content-security-policy" => 1,
            })

          stub_session_id_request
          response = request.get("/")

          assert(response.headers.size.zero?)
          HOP_BY_HOP_HEADERS.each do |header|
            assert(response.headers[header].nil?)
          end
        end

        def test_replaces_shopify_essential_cookie
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              headers: {
                "Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}",
              },
            )

          stub_session_id_request
          request.get("/",
            "HTTP_COOKIE" => "_shopify_essential=a12cef")
        end

        def test_appends_shopify_essential_cookie
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              headers: {
                "Cookie" => "cart_currency=CAD; secure_customer_sig=; _shopify_essential=#{SECURE_SESSION_ID}",
              },
            )

          stub_session_id_request
          request.get("/",
            "HTTP_COOKIE" => "cart_currency=CAD; secure_customer_sig=")
        end

        def test_pass_pending_templates_to_storefront
          ShopifyCLI::DB
            .stubs(:get)
            .with(:shop)
            .returns("dev-theme-server-store.myshopify.com")

          ShopifyCLI::DB
            .stubs(:get)
            .with(:storefront_renderer_production_exchange_token)
            .returns("TOKEN")

          @syncer.expects(:pending_updates).returns([
            @theme["layout/theme.liquid"],
            @theme["assets/theme.css"], # Should not be included in the POST body
          ])

          stub_request(:post, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              body: {
                "_method" => "GET",
                "replace_templates" => {
                  "layout/theme.liquid" => @theme["layout/theme.liquid"].read,
                },
              },
              headers: {
                "Accept-Encoding" => "none",
                "Authorization" => "Bearer TOKEN",
                "Content-Type" => "application/x-www-form-urlencoded",
                "Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}",
                "Host" => "dev-theme-server-store.myshopify.com",
                "X-Forwarded-For" => "",
                "User-Agent" => "Shopify CLI",
              },
            )
            .to_return(status: 200, body: "PROXY RESPONSE")

          stub_session_id_request
          response = request.get("/")

          assert_equal("PROXY RESPONSE", response.body)
        end

        def test_patching_store_urls
          ShopifyCLI::DB
            .stubs(:get)
            .with(:storefront_renderer_production_exchange_token)
            .returns("TOKEN")

          @syncer.stubs(:pending_updates).returns([@theme["layout/theme.liquid"]])
          @proxy.stubs(:host).returns("127.0.0.1:9292")

          stub_request(:post, "https://dev-theme-server-store.myshopify.com/?_fd=0&pb=0")
            .with(
              body: {
                "_method" => "GET",
                "replace_templates" => {
                  "layout/theme.liquid" => @theme["layout/theme.liquid"].read,
                },
              },
              headers: { "User-Agent" => "Shopify CLI" },
            )
            .to_return(status: 200, body: <<-PROXY_RESPONSE)
              <html>
                <body>
                  <style>
                    @font-face {
                      font-family: Futura;
                      font-weight: 400;
                      font-style: normal;
                      font-display: swap;
                      src: url("//dev-theme-server-store.myshopify.com/cdn/fonts/futura/futura_n4.df36ce3d9db534a4d7947f4aa825495ed740e410.woff2?h1=cHVyZS10aGVtZS5hY2NvdW50Lm15c2hvcGlmeS5jb20&h2=dGhlLWlsZXMubXlzaG9waWZ5LmNvbQ&hmac=ba757f560100470edc74855959801fe8c5c1cf4a6c4beff66bd0d4fcd762d57d") format("woff2"),
                           url("//dev-theme-server-store.myshopify.com/cdn/fonts/futura/futura_n4.6bce24beb4ba1ff4ddeb20f7cd6e2fa513a3d6ec.woff?h1=cHVyZS10aGVtZS5hY2NvdW50Lm15c2hvcGlmeS5jb20&h2=dGhlLWlsZXMubXlzaG9waWZ5LmNvbQ&hmac=2b05dd14532961ae90768ed4b64d3af8ab212b4dff90907df1e95f1268b61f26") format("woff");
                    }
                    @font-face {
                      font-family: "My Cool Font";
                      src: url("//dev-theme-server-store.myshopify.com/cdn/shop/t/6/assets/my-cool-font.woff2?v=32980254144382797261691268313") format("woff2"),
                           url("//dev-theme-server-store.myshopify.com/cdn/shop/t/6/assets/my-cool-font.woff?v=177194758756042663431691268313") format("woff");
                    }
                  </style>

                  <h1>My dev-theme-server-store.myshopify.com store!</h1>

                  <a data-base-url="http://dev-theme-server-store.myshopify.com/link">1</a>
                  <a data-attr-2="https://dev-theme-server-store.myshopify.com/link">2</a>
                  <a data-attr-3="//dev-theme-server-store.myshopify.com/link">3</a>
                  <a data-attr-4='//dev-theme-server-store.myshopify.com/li"nk'>4</a>

                  <a href="http://dev-theme-server-store.myshopify.com/link">5</a>
                  <a href="https://dev-theme-server-store.myshopify.com/link">6</a>
                  <a href="//dev-theme-server-store.myshopify.com/link">7</a>
                </body>
              </html>
            PROXY_RESPONSE

          stub_session_id_request
          response = request.get("/")

          assert_equal(<<-EXPECTED_RESPONSE, response.body)
              <html>
                <body>
                  <style>
                    @font-face {
                      font-family: Futura;
                      font-weight: 400;
                      font-style: normal;
                      font-display: swap;
                      src: url("//dev-theme-server-store.myshopify.com/cdn/fonts/futura/futura_n4.df36ce3d9db534a4d7947f4aa825495ed740e410.woff2?h1=cHVyZS10aGVtZS5hY2NvdW50Lm15c2hvcGlmeS5jb20&h2=dGhlLWlsZXMubXlzaG9waWZ5LmNvbQ&hmac=ba757f560100470edc74855959801fe8c5c1cf4a6c4beff66bd0d4fcd762d57d") format("woff2"),
                           url("//dev-theme-server-store.myshopify.com/cdn/fonts/futura/futura_n4.6bce24beb4ba1ff4ddeb20f7cd6e2fa513a3d6ec.woff?h1=cHVyZS10aGVtZS5hY2NvdW50Lm15c2hvcGlmeS5jb20&h2=dGhlLWlsZXMubXlzaG9waWZ5LmNvbQ&hmac=2b05dd14532961ae90768ed4b64d3af8ab212b4dff90907df1e95f1268b61f26") format("woff");
                    }
                    @font-face {
                      font-family: "My Cool Font";
                      src: url("http://127.0.0.1:9292/cdn/shop/t/6/assets/my-cool-font.woff2?v=32980254144382797261691268313") format("woff2"),
                           url("http://127.0.0.1:9292/cdn/shop/t/6/assets/my-cool-font.woff?v=177194758756042663431691268313") format("woff");
                    }
                  </style>

                  <h1>My dev-theme-server-store.myshopify.com store!</h1>

                  <a data-base-url="http://127.0.0.1:9292/link">1</a>
                  <a data-attr-2="https://dev-theme-server-store.myshopify.com/link">2</a>
                  <a data-attr-3="//dev-theme-server-store.myshopify.com/link">3</a>
                  <a data-attr-4='//dev-theme-server-store.myshopify.com/li"nk'>4</a>

                  <a href="http://dev-theme-server-store.myshopify.com/link">5</a>
                  <a href="https://dev-theme-server-store.myshopify.com/link">6</a>
                  <a href="//dev-theme-server-store.myshopify.com/link">7</a>
                </body>
              </html>
          EXPECTED_RESPONSE
        end

        def test_do_not_pass_pending_files_to_core
          ShopifyCLI::DB
            .stubs(:get)
            .with(:shop)
            .returns("dev-theme-server-store.myshopify.com")

          ShopifyCLI::DB
            .stubs(:get)
            .with(:storefront_renderer_production_exchange_token)
            .returns("TOKEN")

          # First request marks the endpoint as being served by Core
          stub_request(:get, "https://dev-theme-server-store.myshopify.com/on-core?_fd=0&pb=0")
            .to_return(status: 200, headers: {
              # Doesn't have the x-storefront-renderer-rendered header
            }).times(2)

          stub_session_id_request
          request.get("/on-core")

          # Introduce pending files, but should not hit the POST endpoint
          @syncer.stubs(:pending_updates).returns([
            @theme["layout/theme.liquid"],
          ])
          request.get("/on-core")
        end

        def test_requires_exchange_token
          ShopifyCLI::DB
            .stubs(:get)
            .with(:storefront_renderer_production_exchange_token)
            .returns(nil)

          @syncer.expects(:pending_updates).returns([
            @theme["layout/theme.liquid"],
          ])

          stub_session_id_request
          assert_raises(KeyError) do
            request.get("/")
          end
        end

        def test_bearer_token_from_environment
          Environment.stubs(:storefront_renderer_auth_token).returns("TOKEN_A")
          ShopifyCLI::DB.stubs(:get).with(:storefront_renderer_production_exchange_token).returns("TOKEN_B")

          assert_equal("TOKEN_A", @proxy.send(:bearer_token))
        end

        def test_bearer_token_from_db
          Environment.stubs(:storefront_renderer_auth_token).returns(nil)
          ShopifyCLI::DB.stubs(:get).with(:storefront_renderer_production_exchange_token).returns("TOKEN_B")

          assert_equal("TOKEN_B", @proxy.send(:bearer_token))
        end

        def test_bearer_token_error
          Environment.stubs(:storefront_renderer_auth_token).returns(nil)
          ShopifyCLI::DB.stubs(:get).with(:storefront_renderer_production_exchange_token).returns(nil)

          error = assert_raises(KeyError) { @proxy.send(:bearer_token) }

          assert_equal("storefront_renderer_production_exchange_token missing", error.message)
        end

        def test_modifies_set_cookie_headers
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/password?_fd=0&pb=0")
            .with(
              body: {
                "form_type" => "storefront_password",
                "password" => "notapassword",
              },
            )
            .to_return(status: 302, headers: {
              "set-cookie" => "storefront_digest=123abc; path=/; secure; HttpOnly; SameSite=None",
            })
          stub_session_id_request

          response = request.post("/password", params: {
            "form_type" => "storefront_password",
            "password" => "notapassword",
          })
          assert_equal("storefront_digest=123abc; path=/; secure: false; HttpOnly; SameSite=None",
            response.headers["set-cookie"])
        end

        def test_does_not_modify_set_cookie_headers_on_chrome
          stub_request(:post, "https://dev-theme-server-store.myshopify.com/password?_fd=0&pb=0")
            .with(
              body: {
                "form_type" => "storefront_password",
                "password" => "notapassword",
              },
            )
            .to_return(status: 302, headers: {
              "set-cookie" => "storefront_digest=123abc; path=/; secure; HttpOnly; SameSite=None",
            })
          stub_session_id_request

          response = request.post("/password", {
            params: {
              "form_type" => "storefront_password",
              "password" => "notapassword",
            },
            "HTTP_USER_AGENT" => "Mozilla/1 (Macintosh) AppleWebKit/1 (KHTML, like Gecko) Chrome/1 Safari/1",
          })

          assert_equal("storefront_digest=123abc; path=/; secure; HttpOnly; SameSite=None",
            response.headers["set-cookie"])
        end

        private

        def request
          Rack::MockRequest.new(@proxy)
        end

        def default_proxy_headers(domain = "myshopify.com")
          {
            "Accept-Encoding" => "none",
            "Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}",
            "Host" => "dev-theme-server-store.#{domain}",
            "X-Forwarded-For" => "",
            "User-Agent" => "Shopify CLI",
          }
        end

        def stub_session_id_request(domain = "myshopify.com")
          stub_request(:head, "https://dev-theme-server-store.#{domain}/?_fd=0&pb=0&preview_theme_id=123456789")
            .with(
              headers: {
                "Host" => "dev-theme-server-store.#{domain}",
              },
            )
            .to_return(
              status: 200,
              headers: {
                "Set-Cookie" => "_shopify_essential=#{SECURE_SESSION_ID}",
              },
            )
        end

        def stub_shop(domain = "myshopify.com")
          ShopifyCLI::DB
            .stubs(:get)
            .with(:shop)
            .returns("dev-theme-server-store.#{domain}")
        end
      end
    end
  end
end
