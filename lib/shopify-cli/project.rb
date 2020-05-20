# frozen_string_literal: true
require 'shopify_cli'

module ShopifyCli
  ##
  # ShopifyCli::Project captures the current project that the user is working on.
  # This class can be used to fetch and save project environment as well as the
  # project config `.shopify-cli.yml`.
  #
  class Project
    include SmartProperties

    class << self
      ##
      # will get an instance of the project that the user is currently operating
      # on. This is used for access to project resources.
      #
      # #### Returns
      #
      # * `project` - a Project instance if the user is currently in the project.
      #
      # #### Raises
      #
      # * `ShopifyCli::Abort` - If the cli is not currently in a project directory
      #   then this will be raised with a message implying that the user is not in
      #   a project directory.
      #
      # #### Example
      #
      #   project = ShopifyCli::Project.current
      #
      def current
        at(Dir.pwd)
      end

      ##
      # will return true if the command line is currently within a project
      #
      # #### Returns
      #
      # * `has_project` - boolean, true if there is a current project
      #
      def has_current?
        !directory(Dir.pwd).nil?
      end

      ##
      # will fetch the project type of the current project. This is mostly used
      # for internal project type loading, you should not normally need this.
      #
      # #### Returns
      #
      # * `type` - a symbol of the name of the project type identifier. i.e. [rails, node]
      #   This will be nil if the user is not in a current project.
      #
      # #### Example
      #
      #   type = ShopifyCli::Project.current_app_type
      #
      def current_project_type
        return unless has_current?
        current.config['app_type'].to_sym
      end

      ##
      # writes out the `.shopify-cli.yml` file. You should use this when creating
      # a project type so that the rest of your project type commands will load
      # in this project, in the future.
      #
      # #### Parameters
      #
      # * `ctx` - the current running context of your command
      # * `app_type` - a string or symbol of your app type name
      # * `organization_id` - the id of the organization that the app owned by. Used for metrics
      # * `identifiers` - an optional hash of other app identifiers
      #
      # #### Example
      #
      #   type = ShopifyCli::Project.current_app_type
      #
      def write(ctx, app_type:, organization_id:, **identifiers)
        require 'yaml' # takes 20ms, so deferred as late as possible.
        content = Hash[{ app_type: app_type, organization_id: organization_id.to_i }
          .merge(identifiers)
          .collect { |k, v| [k.to_s, v] }]

        ctx.write('.shopify-cli.yml', YAML.dump(content))
      end

      def project_name
        File.basename(current.directory)
      end

      private

      def directory(dir)
        @dir ||= Hash.new { |h, k| h[k] = __directory(k) }
        @dir[dir]
      end

      def at(dir)
        proj_dir = directory(dir)
        unless proj_dir
          raise(ShopifyCli::Abort, Context.message('core.project.error.not_in_project'))
        end
        @at ||= Hash.new { |h, k| h[k] = new(directory: k) }
        @at[proj_dir]
      end

      def __directory(curr)
        loop do
          return nil if curr == '/'
          file = File.join(curr, '.shopify-cli.yml')
          return curr if File.exist?(file)
          curr = File.dirname(curr)
        end
      end
    end

    property :directory # :nodoc:

    ##
    # will read, parse and return the envfile for the project
    #
    # #### Returns
    #
    # * `env` - An instance of a ShopifyCli::Resources::EnvFile
    #
    # #### Example
    #
    #   ShopifyCli::Project.current.env
    #
    def env
      @env ||= Resources::EnvFile.read(directory)
    end

    ##
    # will read, parse and return the .shopify-cli.yml for the project
    #
    # #### Returns
    #
    # * `config` - A hash of configuration
    #
    # #### Raises
    #
    # * `ShopifyCli::Abort` - If the yml is invalid or poorly formatted
    # * `ShopifyCli::Abort` - If the yml file does not exist
    #
    # #### Example
    #
    #   ShopifyCli::Project.current.config
    #
    def config
      @config ||= begin
        config = load_yaml_file('.shopify-cli.yml')
        unless config.is_a?(Hash)
          raise ShopifyCli::Abort, Context.message('core.project.error.cli_yaml.not_hash')
        end
        config
      end
    end

    private

    def load_yaml_file(relative_path)
      f = File.join(directory, relative_path)
      require 'yaml' # takes 20ms, so deferred as late as possible.
      begin
        YAML.load_file(f)
      rescue Psych::SyntaxError => e
        raise(ShopifyCli::Abort, Context.message('core.project.error.cli_yaml.invalid', relative_path, e.message))
      # rescue Errno::EACCES => e
      # TODO
      #   Dev::Helpers::EaccesHandler.diagnose_and_raise(f, e, mode: :read)
      rescue Errno::ENOENT
        raise ShopifyCli::Abort, Context.message('core.project.error.cli_yaml.not_found', f)
      end
    end
  end
end
