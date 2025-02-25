# Commands
<!-- commands -->
* [`shopify app build`](#shopify-app-build)
* [`shopify app config link`](#shopify-app-config-link)
* [`shopify app config use [CONFIG]`](#shopify-app-config-use-config)
* [`shopify app deploy`](#shopify-app-deploy)
* [`shopify app dev`](#shopify-app-dev)
* [`shopify app env pull`](#shopify-app-env-pull)
* [`shopify app env show`](#shopify-app-env-show)
* [`shopify app function build`](#shopify-app-function-build)
* [`shopify app function run`](#shopify-app-function-run)
* [`shopify app function schema`](#shopify-app-function-schema)
* [`shopify app function typegen`](#shopify-app-function-typegen)
* [`shopify app generate extension [FILE]`](#shopify-app-generate-extension-file)
* [`shopify app import-extensions`](#shopify-app-import-extensions)
* [`shopify app info`](#shopify-app-info)
* [`shopify app init`](#shopify-app-init)
* [`shopify app:release --version <version>`](#shopify-apprelease---version-version)
* [`shopify app versions list [FILE]`](#shopify-app-versions-list-file)
* [`shopify app webhook trigger`](#shopify-app-webhook-trigger)
* [`shopify auth logout`](#shopify-auth-logout)
* [`shopify commands`](#shopify-commands)
* [`shopify config autocorrect off`](#shopify-config-autocorrect-off)
* [`shopify config autocorrect on`](#shopify-config-autocorrect-on)
* [`shopify config autocorrect status`](#shopify-config-autocorrect-status)
* [`shopify help [COMMAND]`](#shopify-help-command)
* [`shopify hydrogen init`](#shopify-hydrogen-init)
* [`shopify plugins:install PLUGIN...`](#shopify-pluginsinstall-plugin)
* [`shopify plugins:inspect PLUGIN...`](#shopify-pluginsinspect-plugin)
* [`shopify plugins:install PLUGIN...`](#shopify-pluginsinstall-plugin-1)
* [`shopify plugins:link PLUGIN`](#shopify-pluginslink-plugin)
* [`shopify plugins:uninstall PLUGIN...`](#shopify-pluginsuninstall-plugin)
* [`shopify plugins reset`](#shopify-plugins-reset)
* [`shopify plugins:uninstall PLUGIN...`](#shopify-pluginsuninstall-plugin-1)
* [`shopify plugins:uninstall PLUGIN...`](#shopify-pluginsuninstall-plugin-2)
* [`shopify plugins update`](#shopify-plugins-update)
* [`shopify search [QUERY]`](#shopify-search-query)
* [`shopify theme check`](#shopify-theme-check)
* [`shopify theme:console`](#shopify-themeconsole)
* [`shopify theme delete`](#shopify-theme-delete)
* [`shopify theme dev`](#shopify-theme-dev)
* [`shopify theme info`](#shopify-theme-info)
* [`shopify theme:init [name]`](#shopify-themeinit-name)
* [`shopify theme language-server`](#shopify-theme-language-server)
* [`shopify theme list`](#shopify-theme-list)
* [`shopify theme open`](#shopify-theme-open)
* [`shopify theme package`](#shopify-theme-package)
* [`shopify theme publish`](#shopify-theme-publish)
* [`shopify theme pull`](#shopify-theme-pull)
* [`shopify theme:push`](#shopify-themepush)
* [`shopify theme rename`](#shopify-theme-rename)
* [`shopify theme share`](#shopify-theme-share)
* [`shopify upgrade`](#shopify-upgrade)
* [`shopify version`](#shopify-version)

## `shopify app build`

Build the app, including extensions.

```
USAGE
  $ shopify app build [--client-id <value> | -c <value>] [--no-color] [--path <value>]
    [--skip-dependencies-installation] [--verbose]

FLAGS
  -c, --config=<value>                  The name of the app configuration.
      --client-id=<value>               Application's Client ID that will be exposed at build time.
      --no-color                        Disable color output.
      --path=<value>                    The path to your app directory.
      --skip-dependencies-installation  Skips the installation of dependencies. Deprecated, use workspaces instead.
      --verbose                         Increase the verbosity of the logs.

DESCRIPTION
  Build the app, including extensions.

  This command executes the build script specified in the element's TOML file. You can specify a custom script in the
  file. To learn about configuration files in Shopify apps, refer to "App configuration"
  (https://shopify.dev/docs/apps/tools/cli/configuration).

  If you're building a "theme app extension" (https://shopify.dev/docs/apps/online-store/theme-app-extensions), then
  running the `build` command runs "Theme Check" (https://shopify.dev/docs/themes/tools/theme-check) against your
  extension to ensure that it's valid.
```

## `shopify app config link`

Fetch your app configuration from the Partner Dashboard.

```
USAGE
  $ shopify app config link [--client-id <value>] [-c <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>     The name of the app configuration.
      --client-id=<value>  The Client ID of your app.
      --no-color           Disable color output.
      --path=<value>       The path to your app directory.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  Fetch your app configuration from the Partner Dashboard.

  Pulls app configuration from the Partner Dashboard and creates or overwrites a configuration file. You can create a
  new app with this command to start with a default configuration file.

  For more information on the format of the created TOML configuration file, refer to the "App configuration"
  (https://shopify.dev/docs/apps/tools/cli/configuration) page.
```

## `shopify app config use [CONFIG]`

Activate an app configuration.

```
USAGE
  $ shopify app config use [CONFIG] [--no-color] [--path <value>] [--reset] [--verbose]

ARGUMENTS
  CONFIG  The name of the app configuration. Can be 'shopify.app.staging.toml' or simply 'staging'.

FLAGS
  --no-color      Disable color output.
  --path=<value>  The path to your app directory.
  --reset         Reset current configuration.
  --verbose       Increase the verbosity of the logs.

DESCRIPTION
  Activate an app configuration.

  Sets default configuration when you run app-related CLI commands. If you omit the `config-name` parameter, then you'll
  be prompted to choose from the configuration files in your project.
```

## `shopify app deploy`

Deploy your Shopify app.

```
USAGE
  $ shopify app deploy [--client-id <value> | -c <value>] [-f] [--message <value>] [--no-color] [--no-release]
    [--path <value>] [--reset | ] [--source-control-url <value>] [--verbose] [--version <value>]

FLAGS
  -c, --config=<value>              The name of the app configuration.
  -f, --force                       Deploy without asking for confirmation.
      --client-id=<value>           The Client ID of your app.
      --message=<value>             Optional message that will be associated with this version. This is for internal use
                                    only and won't be available externally.
      --no-color                    Disable color output.
      --no-release                  Creates a version but doesn't release it - it's not made available to merchants.
      --path=<value>                The path to your app directory.
      --reset                       Reset all your settings.
      --source-control-url=<value>  URL associated with the new app version.
      --verbose                     Increase the verbosity of the logs.
      --version=<value>             Optional version tag that will be associated with this app version. If not provided,
                                    an auto-generated identifier will be generated for this app version.

DESCRIPTION
  Deploy your Shopify app.

  "Builds the app" (https://shopify.dev/docs/api/shopify-cli/app/app-build), then deploys your app configuration and
  extensions.

  This command creates an app version, which is a snapshot of your app configuration and all extensions, including the
  app extensions that you manage in the Partner Dashboard. This version is then released to users.

  This command doesn't deploy your "web app" (https://shopify.dev/docs/apps/tools/cli/structure#web-components). You
  need to "deploy your web app" (https://shopify.dev/docs/apps/deployment/web) to your own hosting solution.
```

## `shopify app dev`

Run the app.

```
USAGE
  $ shopify app dev [--checkout-cart-url <value>] [--client-id <value> | -c <value>] [--no-color]
    [--no-update] [--notify <value>] [--path <value>] [--reset | ] [--skip-dependencies-installation] [-s <value>]
    [--subscription-product-url <value>] [-t <value>] [--theme-app-extension-port <value>] [--tunnel-url <value> |  | ]
    [--verbose]

FLAGS
  -c, --config=<value>                    The name of the app configuration.
  -s, --store=<value>                     Store URL. Must be an existing development or Shopify Plus sandbox store.
  -t, --theme=<value>                     Theme ID or name of the theme app extension host theme.
      --checkout-cart-url=<value>         Resource URL for checkout UI extension. Format:
                                          "/cart/{productVariantID}:{productQuantity}"
      --client-id=<value>                 The Client ID of your app.
      --no-color                          Disable color output.
      --no-update                         Skips the Partners Dashboard URL update step.
      --notify=<value>                    The file path or URL. The file path is to a file that you want updated on
                                          idle. The URL path is where you want a webhook posted to report on file
                                          changes.
      --path=<value>                      The path to your app directory.
      --reset                             Reset all your settings.
      --skip-dependencies-installation    Skips the installation of dependencies. Deprecated, use workspaces instead.
      --subscription-product-url=<value>  Resource URL for subscription UI extension. Format: "/products/{productId}"
      --theme-app-extension-port=<value>  Local port of the theme app extension development server.
      --tunnel-url=<value>                Use a custom tunnel, it must be running before executing dev. Format:
                                          "https://my-tunnel-url:port".
      --verbose                           Increase the verbosity of the logs.

DESCRIPTION
  Run the app.

  "Builds the app" (https://shopify.dev/docs/api/shopify-cli/app/app-build) and lets you preview it on a "development
  store" (https://shopify.dev/docs/apps/tools/development-stores) or "Plus sandbox store"
  (https://help.shopify.com/partners/dashboard/managing-stores/plus-sandbox-store).

  To preview your app on a development store or Plus sandbox store, Shopify CLI walks you through the following steps.
  If you've run `dev` before, then your settings are saved and some of these steps are skipped. You can reset these
  configurations using `dev --reset` to go through all of them again:

  - Associating your project with an app associated with your Partner account or organization, or creating a new app.
  - Selecting a development store or Plus sandbox store to use for testing. If you have only one store, then it's
  selected automatically.
  - Installing your app on the store using the provided install link.
  - Creating a tunnel between your local environment and the store using Cloudflare.

  You can use your own tunneling software instead, by passing your tunnel URL with the `--tunnel-url` flag.
  - Updating the app URLs that are set in the Partner Dashboard.

  To avoid overwriting any URLs that are already set, select the No, never option. If you select this option, then
  you're provided with URLs that you can manually add in the Partner Dashboard so you can preview your app.

  - Enabling development store preview for extensions.
  - Serving "GraphiQL for the Admin API"
  (https://shopify.dev/docs/apps/tools/graphiql-admin-api#use-a-local-graphiql-instance) using your app's credentials
  and access scopes.
  - Building and serving your app and app extensions.

  If you're using the PHP or Ruby app template, then you need to complete the following steps before you can preview
  your app for the first time:

  - PHP: "Set up your Laravel app" (https://github.com/Shopify/shopify-app-template-php#setting-up-your-laravel-app)
  - Ruby: "Set up your Rails app" (https://github.com/Shopify/shopify-app-template-ruby#setting-up-your-rails-app)

  > Caution: To use a development store or Plus sandbox store with Shopify CLI, you need to be the store owner, or have
  a "staff account" (https://help.shopify.com/manual/your-account/staff-accounts) on the store. Staff accounts are
  created automatically the first time you access a development store with your Partner staff account through the
  Partner Dashboard.
```

## `shopify app env pull`

Pull app and extensions environment variables.

```
USAGE
  $ shopify app env pull [-c <value>] [--env-file <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>    The name of the app configuration.
      --env-file=<value>  Specify an environment file to update if the update flag is set
      --no-color          Disable color output.
      --path=<value>      The path to your app directory.
      --verbose           Increase the verbosity of the logs.

DESCRIPTION
  Pull app and extensions environment variables.

  Creates or updates an `.env` files that contains app and app extension environment variables.

  When an existing `.env` file is updated, changes to the variables are displayed in the terminal output. Existing
  variables and commented variables are preserved.
```

## `shopify app env show`

Display app and extensions environment variables.

```
USAGE
  $ shopify app env show [-c <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>  The name of the app configuration.
      --no-color        Disable color output.
      --path=<value>    The path to your app directory.
      --verbose         Increase the verbosity of the logs.

DESCRIPTION
  Display app and extensions environment variables.

  Displays environment variables that can be used to deploy apps and app extensions.
```

## `shopify app function build`

Compile a function to wasm.

```
USAGE
  $ shopify app function build [-c <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>  The name of the app configuration.
      --no-color        Disable color output.
      --path=<value>    The path to your function directory.
      --verbose         Increase the verbosity of the logs.

DESCRIPTION
  Compile a function to wasm.

  Compiles the function in your current directory to WebAssembly (Wasm) for testing purposes.
```

## `shopify app function run`

Run a function locally for testing.

```
USAGE
  $ shopify app function run [-c <value>] [-e <value>] [-i <value>] [-j] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>  The name of the app configuration.
  -e, --export=<value>  [default: _start] Name of the wasm export to invoke.
  -i, --input=<value>   The input JSON to pass to the function. If omitted, standard input is used.
  -j, --json            Log the run result as a JSON object.
      --no-color        Disable color output.
      --path=<value>    The path to your function directory.
      --verbose         Increase the verbosity of the logs.

DESCRIPTION
  Run a function locally for testing.

  Runs the function from your current directory for "testing purposes"
  (https://shopify.dev/docs/apps/functions/testing-and-debugging). To learn how you can monitor and debug functions when
  errors occur, refer to "Shopify Functions error handling" (https://shopify.dev/docs/api/functions/errors).
```

## `shopify app function schema`

Fetch the latest GraphQL schema for a function.

```
USAGE
  $ shopify app function schema [--client-id <value> | -c <value>] [--no-color] [--path <value>] [--stdout] [--verbose]

FLAGS
  -c, --config=<value>     The name of the app configuration.
      --client-id=<value>  The Client ID to fetch the schema with.
      --no-color           Disable color output.
      --path=<value>       The path to your function directory.
      --stdout             Output the schema to stdout instead of writing to a file.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  Fetch the latest GraphQL schema for a function.

  Generates the latest "GraphQL schema" (https://shopify.dev/docs/apps/functions/input-output#graphql-schema) for a
  function in your app. Run this command from the function directory.

  This command uses the API type and version of your function, as defined in your extension TOML file, to generate the
  latest GraphQL schema. The schema is written to the `schema.graphql` file.
```

## `shopify app function typegen`

Generate GraphQL types for a JavaScript function.

```
USAGE
  $ shopify app function typegen [-c <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>  The name of the app configuration.
      --no-color        Disable color output.
      --path=<value>    The path to your function directory.
      --verbose         Increase the verbosity of the logs.

DESCRIPTION
  Generate GraphQL types for a JavaScript function.

  Creates GraphQL types based on your "input query" (https://shopify.dev/docs/apps/functions/input-output#input) for a
  function written in JavaScript.
```

## `shopify app generate extension [FILE]`

Generate a new app Extension.

```
USAGE
  $ shopify app generate extension [FILE] [--client-id <value> | -c <value>] [--flavor
    vanilla-js|react|typescript|typescript-react|wasm|rust] [-n <value>] [--no-color] [--path <value>] [--reset | ] [-t
    <value>] [-t <value>] [--verbose]

FLAGS
  -c, --config=<value>     The name of the app configuration.
  -n, --name=<value>       name of your Extension
  -t, --template=<value>   Extension template
  -t, --type=<value>       Deprecated. Please use --template
      --client-id=<value>  The Client ID of your app.
      --flavor=<option>    Choose a starting template for your extension, where applicable
                           <options: vanilla-js|react|typescript|typescript-react|wasm|rust>
      --no-color           Disable color output.
      --path=<value>       The path to your app directory.
      --reset              Reset all your settings.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  Generate a new app Extension.

  Generates a new "app extension" (https://shopify.dev/docs/apps/app-extensions). For a list of app extensions that you
  can generate using this command, refer to "Supported extensions"
  (https://shopify.dev/docs/apps/structure/app-extensions/list).

  Each new app extension is created in a folder under `extensions/`. To learn more about the extensions file structure,
  refer to "App structure" (https://shopify.dev/docs/apps/tools/cli/structure) and the documentation for your extension.


EXAMPLES
  $ shopify app generate extension
```

## `shopify app import-extensions`

Import dashboard-managed extensions into your app.

```
USAGE
  $ shopify app import-extensions [--client-id <value> | -c <value>] [--no-color] [--path <value>] [--verbose]

FLAGS
  -c, --config=<value>     The name of the app configuration.
      --client-id=<value>  The Client ID of your app.
      --no-color           Disable color output.
      --path=<value>       The path to your app directory.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  Import dashboard-managed extensions into your app.
```

## `shopify app info`

Print basic information about your app and extensions.

```
USAGE
  $ shopify app info [-c <value>] [--json] [--no-color] [--path <value>] [--verbose] [--web-env]

FLAGS
  -c, --config=<value>  The name of the app configuration.
      --json            format output as JSON
      --no-color        Disable color output.
      --path=<value>    The path to your app directory.
      --verbose         Increase the verbosity of the logs.
      --web-env         Outputs environment variables necessary for running and deploying web/.

DESCRIPTION
  Print basic information about your app and extensions.

  The information returned includes the following:

  - The app and development store or Plus sandbox store that's used when you run the "dev"
  (https://shopify.dev/docs/api/shopify-cli/app/app-dev) command. You can reset these configurations using "`dev
  --reset`" (https://shopify.dev/docs/api/shopify-cli/app/app-dev#flags-propertydetail-reset).
  - The "structure" (https://shopify.dev/docs/apps/tools/cli/structure) of your app project.
  - The "access scopes" (https://shopify.dev/docs/api/usage) your app has requested.
  - System information, including the package manager and version of Shopify CLI used in the project.
```

## `shopify app init`

Create a new app project

```
USAGE
  $ shopify app init [--flavor <value>] [-n <value>] [--no-color] [-d npm|yarn|pnpm|bun] [-p <value>]
    [--template <value>] [--verbose]

FLAGS
  -d, --package-manager=<option>  <options: npm|yarn|pnpm|bun>
  -n, --name=<value>
  -p, --path=<value>              [default: .]
      --flavor=<value>            Which flavor of the given template to use.
      --no-color                  Disable color output.
      --template=<value>          The app template. Accepts one of the following:
                                  - <remix|none>
                                  - Any GitHub repo with optional branch and subpath, e.g.,
                                  https://github.com/Shopify/<repository>/[subpath]#[branch]
      --verbose                   Increase the verbosity of the logs.
```

## `shopify app:release --version <version>`

Release an app version.

```
USAGE
  $ shopify app release --version <version>

FLAGS
  -c, --config=<value>     The name of the app configuration.
  -f, --force              Release without asking for confirmation.
      --client-id=<value>  The Client ID of your app.
      --no-color           Disable color output.
      --path=<value>       The path to your app directory.
      --reset              Reset all your settings.
      --verbose            Increase the verbosity of the logs.
      --version=<value>    (required) The name of the app version to release.

DESCRIPTION
  Release an app version.

  Releases an existing app version. Pass the name of the version that you want to release using the `--version` flag.
```

## `shopify app versions list [FILE]`

List deployed versions of your app.

```
USAGE
  $ shopify app versions list [FILE] [--client-id <value> | -c <value>] [--json] [--no-color] [--path <value>]
    [--verbose]

FLAGS
  -c, --config=<value>     The name of the app configuration.
      --client-id=<value>  The Client ID to fetch versions for.
      --json               Output the versions list as JSON.
      --no-color           Disable color output.
      --path=<value>       The path to your app directory.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  List deployed versions of your app.

  Lists the deployed app versions. An app version is a snapshot of your app extensions.

EXAMPLES
  $ shopify app versions list
```

## `shopify app webhook trigger`

Trigger delivery of a sample webhook topic payload to a designated address.

```
USAGE
  $ shopify app webhook trigger [--address <value>] [--api-version <value>] [--client-id <value> | -c <value>]
    [--client-secret <value>] [--delivery-method http|google-pub-sub|event-bridge] [--help] [--path <value>]
    [--shared-secret <value>] [--topic <value>]

FLAGS
  -c, --config=<value>
      The name of the app configuration.

  --address=<value>
      The URL where the webhook payload should be sent.
      You will need a different address type for each delivery-method:
      · For remote HTTP testing, use a URL that starts with https://
      · For local HTTP testing, use http://localhost:{port}/{url-path}
      · For Google Pub/Sub, use pubsub://{project-id}:{topic-id}
      · For Amazon EventBridge, use an Amazon Resource Name (ARN) starting with arn:aws:events:

  --api-version=<value>
      The API Version of the webhook topic.

  --client-id=<value>
      The Client ID of your app.

  --client-secret=<value>
      Your app's client secret. This secret allows us to return the X-Shopify-Hmac-SHA256 header that lets you validate
      the origin of the response that you receive.

  --delivery-method=<option>
      Method chosen to deliver the topic payload. If not passed, it's inferred from the address.
      <options: http|google-pub-sub|event-bridge>

  --help
      This help. When you run the trigger command the CLI will prompt you for any information that isn't passed using
      flags.

  --path=<value>
      The path to your app directory.

  --shared-secret=<value>
      Deprecated. Please use client-secret.

  --topic=<value>
      The requested webhook topic.

DESCRIPTION
  Trigger delivery of a sample webhook topic payload to a designated address.


  Triggers the delivery of a sample Admin API event topic payload to a designated address.

  You should use this command to experiment with webhooks, to initially test your webhook configuration, or for unit
  testing. However, to test your webhook configuration from end to end, you should always trigger webhooks by performing
  the related action in Shopify.

  Because most webhook deliveries use remote endpoints, you can trigger the command from any directory where you can use
  Shopify CLI, and send the webhook to any of the supported endpoint types. For example, you can run the command from
  your app's local directory, but send the webhook to a staging environment endpoint.

  To learn more about using webhooks in a Shopify app, refer to "Webhooks overview"
  (https://shopify.dev/docs/apps/webhooks).

  ### Limitations

  - Webhooks triggered using this method always have the same payload, so they can't be used to test scenarios that
  differ based on the payload contents.
  - Webhooks triggered using this method aren't retried when they fail.
  - Trigger requests are rate-limited using the "Partner API rate limit"
  (https://shopify.dev/docs/api/partner#rate_limits).
  - You can't use this method to validate your API webhook subscriptions.
```

## `shopify auth logout`

Logs you out of the Shopify account or Partner account and store.

```
USAGE
  $ shopify auth logout

DESCRIPTION
  Logs you out of the Shopify account or Partner account and store.
```

## `shopify commands`

list all the commands

```
USAGE
  $ shopify commands [--columns <value> | -x] [--deprecated] [--filter <value>] [-h] [--hidden] [--json]
    [--no-header | [--csv | --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [--tree]

FLAGS
  -h, --help             Show CLI help.
  -x, --extended         show extra columns
      --columns=<value>  only show provided columns (comma-separated)
      --csv              output is csv format [alias: --output=csv]
      --deprecated       show deprecated commands
      --filter=<value>   filter property by partial string matching, ex: name=foo
      --hidden           show hidden commands
      --no-header        hide table header from output
      --no-truncate      do not truncate output to fit screen
      --output=<option>  output in a more machine friendly format
                         <options: csv|json|yaml>
      --sort=<value>     property to sort by (prepend '-' for descending)
      --tree             show tree of commands

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  list all the commands
```

## `shopify config autocorrect off`

Disable autocorrect. Off by default.

```
USAGE
  $ shopify config autocorrect off

DESCRIPTION
  Disable autocorrect. Off by default.

  Disable autocorrect. Off by default.

  When autocorrection is enabled, Shopify CLI automatically runs a corrected version of your command if a correction is
  available.

  When autocorrection is disabled, you need to confirm that you want to run corrections for mistyped commands.
```

## `shopify config autocorrect on`

Enable autocorrect. Off by default.

```
USAGE
  $ shopify config autocorrect on

DESCRIPTION
  Enable autocorrect. Off by default.

  Enable autocorrect. Off by default.

  When autocorrection is enabled, Shopify CLI automatically runs a corrected version of your command if a correction is
  available.

  When autocorrection is disabled, you need to confirm that you want to run corrections for mistyped commands.
```

## `shopify config autocorrect status`

Check whether autocorrect is enabled or disabled. On by default.

```
USAGE
  $ shopify config autocorrect status

DESCRIPTION
  Check whether autocorrect is enabled or disabled. On by default.

  Check whether autocorrect is enabled or disabled. On by default.

  When autocorrection is enabled, Shopify CLI automatically runs a corrected version of your command if a correction is
  available.

  When autocorrection is disabled, you need to confirm that you want to run corrections for mistyped commands.
```

## `shopify help [COMMAND]`

Display help for Shopify CLI

```
USAGE
  $ shopify help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for Shopify CLI
```

## `shopify hydrogen init`

Create a new hydrogen project

```
USAGE
  $ shopify hydrogen init
```

## `shopify plugins:install PLUGIN...`

```
USAGE
  $ shopify plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

ALIASES
  $ shopify plugins add

EXAMPLES
  $ shopify plugins add myplugin 

  $ shopify plugins add https://github.com/someuser/someplugin

  $ shopify plugins add someuser/someplugin
```

## `shopify plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ shopify plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ shopify plugins inspect myplugin
```

## `shopify plugins:install PLUGIN...`

```
USAGE
  $ shopify plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

ALIASES
  $ shopify plugins add

EXAMPLES
  $ shopify plugins install myplugin 

  $ shopify plugins install https://github.com/someuser/someplugin

  $ shopify plugins install someuser/someplugin
```

## `shopify plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ shopify plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ shopify plugins link myplugin
```

## `shopify plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ shopify plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ shopify plugins unlink
  $ shopify plugins remove

EXAMPLES
  $ shopify plugins remove myplugin
```

## `shopify plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ shopify plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

## `shopify plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ shopify plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ shopify plugins unlink
  $ shopify plugins remove

EXAMPLES
  $ shopify plugins uninstall myplugin
```

## `shopify plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ shopify plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ shopify plugins unlink
  $ shopify plugins remove

EXAMPLES
  $ shopify plugins unlink myplugin
```

## `shopify plugins update`

Update installed plugins.

```
USAGE
  $ shopify plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `shopify search [QUERY]`

Starts a search on shopify.dev.

```
USAGE
  $ shopify search [QUERY]

DESCRIPTION
  Starts a search on shopify.dev.

EXAMPLES
  # open the search modal on Shopify.dev
      shopify search
      # search for a term on Shopify.dev
      shopify search <query>
      # search for a phrase on Shopify.dev
      shopify search "<a search query separated by spaces>"
```

## `shopify theme check`

Validate the theme.

```
USAGE
  $ shopify theme check [-a] [-C <value>] [-e <value>] [--fail-level crash|error|suggestion|style|warning|info]
    [--init] [--list] [--no-color] [-o text|json] [--path <value>] [--print] [--verbose] [-v]

FLAGS
  -C, --config=<value>       Use the config provided, overriding .theme-check.yml if present
                             Supports all theme-check: config values, e.g., theme-check:theme-app-extension,
                             theme-check:recommended, theme-check:all
                             For backwards compatibility, :theme_app_extension is also supported
  -a, --auto-correct         Automatically fix offenses
  -e, --environment=<value>  The environment to apply to the current command.
  -o, --output=<option>      [default: text] The output format to use
                             <options: text|json>
  -v, --version              Print Theme Check version
      --fail-level=<option>  [default: error] Minimum severity for exit with error code
                             <options: crash|error|suggestion|style|warning|info>
      --init                 Generate a .theme-check.yml file
      --list                 List enabled checks
      --no-color             Disable color output.
      --path=<value>         The path to your theme directory.
      --print                Output active config to STDOUT
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Validate the theme.

  Calls and runs "Theme Check" (https://shopify.dev/docs/themes/tools/theme-check) to analyze your theme code for errors
  and to ensure that it follows theme and Liquid best practices. "Learn more about the checks that Theme Check runs."
  (https://shopify.dev/docs/themes/tools/theme-check/checks)
```

## `shopify theme:console`

Shopify Liquid REPL (read-eval-print loop) tool

```
USAGE
  $ shopify theme console
  $ shopify theme console --url /products/classic-leather-jacket

FLAGS
  -e, --environment=<value>  The environment to apply to the current command.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --port=<value>         [default: 9293] Local port to serve authentication service.
      --url=<value>          [default: /] The url to be used as context
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Shopify Liquid REPL (read-eval-print loop) tool

  Starts the Shopify Liquid REPL (read-eval-print loop) tool. This tool provides an interactive terminal interface for
  evaluating Liquid code and exploring Liquid objects, filters, and tags using real store data.

  You can also provide context to the console using a URL, as some Liquid objects are context-specific
```

## `shopify theme delete`

Delete remote themes from the connected store. This command can't be undone.

```
USAGE
  $ shopify theme delete [-d] [-e <value>] [-f] [--no-color] [--password <value>] [-a] [-s <value>] [-t <value>]
    [--verbose]

FLAGS
  -a, --show-all             Include others development themes in theme list.
  -d, --development          Delete your development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -f, --force                Skip confirmation.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>...     Theme ID or name of the remote theme.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Delete remote themes from the connected store. This command can't be undone.

  Deletes a theme from your store.

  You can specify multiple themes by ID. If no theme is specified, then you're prompted to select the theme that you
  want to delete from the list of themes in your store.

  You're asked to confirm that you want to delete the specified themes before they are deleted. You can skip this
  confirmation using the `--force` flag.
```

## `shopify theme dev`

Uploads the current theme as a development theme to the connected store, then prints theme editor and preview URLs to your terminal. While running, changes will push to the store in real time.

```
USAGE
  $ shopify theme dev [-e <value>] [--host <value>] [-x <value>] [--live-reload hot-reload|full-page|off]
    [--no-color] [-n] [--notify <value>] [-o <value>] [--open] [--password <value>] [--path <value>] [--poll] [--port
    <value>] [-s <value>] [-t <value>] [--theme-editor-sync] [--verbose]

FLAGS
  -e, --environment=<value>
      The environment to apply to the current command.

  -n, --nodelete
      Runs the dev command without deleting local files.

  -o, --only=<value>...
      Hot reload only files that match the specified pattern.

  -s, --store=<value>
      Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL (johns-apparel.myshopify.com,
      https://johns-apparel.myshopify.com).

  -t, --theme=<value>
      Theme ID or name of the remote theme.

  -x, --ignore=<value>...
      Skip hot reloading any files that match the specified pattern.

  --host=<value>
      Set which network interface the web server listens on. The default value is 127.0.0.1.

  --live-reload=<option>
      [default: hot-reload] The live reload mode switches the server behavior when a file is modified:
      - hot-reload Hot reloads local changes to CSS and sections (default)
      - full-page  Always refreshes the entire page
      - off        Deactivate live reload
      <options: hot-reload|full-page|off>

  --no-color
      Disable color output.

  --notify=<value>
      The file path or URL. The file path is to a file that you want updated on idle. The URL path is where you want a
      webhook posted to report on file changes.

  --open
      Automatically launch the theme preview in your default web browser.

  --password=<value>
      Password generated from the Theme Access app.

  --path=<value>
      The path to your theme directory.

  --poll
      Force polling to detect file changes.

  --port=<value>
      Local port to serve theme preview from.

  --theme-editor-sync
      Synchronize Theme Editor updates in the local theme files.

  --verbose
      Increase the verbosity of the logs.

DESCRIPTION
  Uploads the current theme as a development theme to the connected store, then prints theme editor and preview URLs to
  your terminal. While running, changes will push to the store in real time.


  Uploads the current theme as the specified theme, or a "development theme"
  (https://shopify.dev/docs/themes/tools/cli#development-themes), to a store so you can preview it.

  This command returns the following information:

  - A link to your development theme at http://127.0.0.1:9292. This URL can hot reload local changes to CSS and
  sections, or refresh the entire page when a file changes, enabling you to preview changes in real time using the
  store's data.

  You can specify a different network interface and port using `--host` and `--port`.

  - A link to the "editor" (https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.

  - A "preview link"
  (https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can
  share with other developers.

  If you already have a development theme for your current environment, then this command replaces the development theme
  with your local theme. You can override this using the `--theme-editor-sync` flag.

  > Note: You can't preview checkout customizations using http://127.0.0.1:9292.

  Development themes are deleted when you run `shopify auth logout`. If you need a preview link that can be used after
  you log out, then you should "share" (https://shopify.dev/docs/api/shopify-cli/theme/theme-share) your theme or "push"
  (https://shopify.dev/docs/api/shopify-cli/theme/theme-push) to an unpublished theme on your store.

  You can run this command only in a directory that matches the "default Shopify theme folder structure"
  (https://shopify.dev/docs/themes/tools/cli#directory-structure).
```

## `shopify theme info`

Displays information about your theme environment, including your current store. Can also retrieve information about a specific theme.

```
USAGE
  $ shopify theme info [-d] [-e <value>] [--json] [--no-color] [--password <value>] [-s <value>] [-t <value>]
    [--verbose]

FLAGS
  -d, --development          Retrieve info from your development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
      --json                 Output the theme info as JSON.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Displays information about your theme environment, including your current store. Can also retrieve information about a
  specific theme.
```

## `shopify theme:init [name]`

Clones a Git repository to use as a starting point for building a new theme.

```
USAGE
  $ shopify theme init [name]

ARGUMENTS
  NAME  Name of the new theme

FLAGS
  -l, --latest             Downloads the latest release of the `clone-url`
  -u, --clone-url=<value>  [default: https://github.com/Shopify/dawn.git] The Git URL to clone from. Defaults to
                           Shopify's example theme, Dawn: https://github.com/Shopify/dawn.git
      --no-color           Disable color output.
      --path=<value>       The path to your theme directory.
      --verbose            Increase the verbosity of the logs.

DESCRIPTION
  Clones a Git repository to use as a starting point for building a new theme.

  Clones a Git repository to your local machine to use as the starting point for building a theme.

  If no Git repository is specified, then this command creates a copy of "Dawn" (https://github.com/Shopify/dawn),
  Shopify's example theme, with the specified name in the current folder. If no name is provided, then you're prompted
  to enter one.

  > Caution: If you're building a theme for the Shopify Theme Store, then you can use Dawn as a starting point. However,
  the theme that you submit needs to be "substantively different from Dawn"
  (https://shopify.dev/docs/themes/store/requirements#uniqueness) so that it provides added value for users. Learn about
  the "ways that you can use Dawn" (https://shopify.dev/docs/themes/tools/dawn#ways-to-use-dawn).
```

## `shopify theme language-server`

Start a Language Server Protocol server.

```
USAGE
  $ shopify theme language-server [--no-color] [--verbose]

FLAGS
  --no-color  Disable color output.
  --verbose   Increase the verbosity of the logs.

DESCRIPTION
  Start a Language Server Protocol server.

  Starts the "Language Server" (https://shopify.dev/docs/themes/tools/cli/language-server).
```

## `shopify theme list`

Lists the themes in your store, along with their IDs and statuses.

```
USAGE
  $ shopify theme list [-e <value>] [--id <value>] [--json] [--name <value>] [--no-color] [--password <value>]
    [--role live|unpublished|development] [-s <value>] [--verbose]

FLAGS
  -e, --environment=<value>  The environment to apply to the current command.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
      --id=<value>           Only list theme with the given ID.
      --json                 Output the theme list as JSON.
      --name=<value>         Only list themes that contain the given name.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --role=<option>        Only list themes with the given role.
                             <options: live|unpublished|development>
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Lists the themes in your store, along with their IDs and statuses.
```

## `shopify theme open`

Opens the preview of your remote theme.

```
USAGE
  $ shopify theme open [-d] [-E] [-e <value>] [-l] [--no-color] [--password <value>] [-s <value>] [-t <value>]
    [--verbose]

FLAGS
  -E, --editor               Open the theme editor for the specified theme in the browser.
  -d, --development          Open your development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -l, --live                 Open your live (published) theme.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Opens the preview of your remote theme.

  Returns links that let you preview the specified theme. The following links are returned:

  - A link to the "editor" (https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A "preview link"
  (https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can
  share with other developers.

  If you don't specify a theme, then you're prompted to select the theme to open from the list of the themes in your
  store.
```

## `shopify theme package`

Package your theme into a .zip file, ready to upload to the Online Store.

```
USAGE
  $ shopify theme package [--no-color] [--path <value>] [--verbose]

FLAGS
  --no-color      Disable color output.
  --path=<value>  The path to your theme directory.
  --verbose       Increase the verbosity of the logs.

DESCRIPTION
  Package your theme into a .zip file, ready to upload to the Online Store.

  Packages your local theme files into a ZIP file that can be uploaded to Shopify.

  Only folders that match the "default Shopify theme folder structure"
  (https://shopify.dev/docs/themes/tools/cli#directory-structure) are included in the package.

  The ZIP file uses the name `theme_name-theme_version.zip`, based on parameters in your "settings_schema.json"
  (https://shopify.dev/docs/themes/architecture/config/settings-schema-json) file.
```

## `shopify theme publish`

Set a remote theme as the live theme.

```
USAGE
  $ shopify theme publish [-e <value>] [-f] [--no-color] [--password <value>] [-s <value>] [-t <value>] [--verbose]

FLAGS
  -e, --environment=<value>  The environment to apply to the current command.
  -f, --force                Skip confirmation.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Set a remote theme as the live theme.

  Publishes an unpublished theme from your theme library.

  If no theme ID is specified, then you're prompted to select the theme that you want to publish from the list of themes
  in your store.

  You can run this command only in a directory that matches the "default Shopify theme folder structure"
  (https://shopify.dev/docs/themes/tools/cli#directory-structure).

  If you want to publish your local theme, then you need to run `shopify theme push` first. You're asked to confirm that
  you want to publish the specified theme. You can skip this confirmation using the `--force` flag.
```

## `shopify theme pull`

Download your remote theme files locally.

```
USAGE
  $ shopify theme pull [-d] [-e <value>] [-x <value>] [-l] [--no-color] [-n] [-o <value>] [--password <value>]
    [--path <value>] [-s <value>] [-t <value>] [--verbose]

FLAGS
  -d, --development          Pull theme files from your remote development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -l, --live                 Pull theme files from your remote live theme.
  -n, --nodelete             Runs the pull command without deleting local files.
  -o, --only=<value>...      Download only the specified files (Multiple flags allowed).
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
  -x, --ignore=<value>...    Skip downloading the specified files (Multiple flags allowed).
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --path=<value>         The path to your theme directory.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Download your remote theme files locally.

  Retrieves theme files from Shopify.

  If no theme is specified, then you're prompted to select the theme to pull from the list of the themes in your store.
```

## `shopify theme:push`

Uploads your local theme files to the connected store, overwriting the remote version if specified.

```
USAGE
  $ shopify theme push
  $ shopify theme push --unpublished --json

FLAGS
  -a, --allow-live           Allow push to a live theme.
  -d, --development          Push theme files from your remote development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -j, --json                 Output JSON instead of a UI.
  -l, --live                 Push theme files from your remote live theme.
  -n, --nodelete             Runs the push command without deleting local files.
  -o, --only=<value>...      Download only the specified files (Multiple flags allowed).
  -p, --publish              Publish as the live theme after uploading.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
  -u, --unpublished          Create a new unpublished theme and push to it.
  -x, --ignore=<value>...    Skip downloading the specified files (Multiple flags allowed).
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --path=<value>         The path to your theme directory.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Uploads your local theme files to the connected store, overwriting the remote version if specified.

  Uploads your local theme files to Shopify, overwriting the remote version if specified.

  If no theme is specified, then you're prompted to select the theme to overwrite from the list of the themes in your
  store.

  You can run this command only in a directory that matches the "default Shopify theme folder structure"
  (https://shopify.dev/docs/themes/tools/cli#directory-structure).

  This command returns the following information:

  - A link to the "editor" (https://shopify.dev/docs/themes/tools/online-editor) for the theme in the Shopify admin.
  - A "preview link"
  (https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can
  share with others.

  If you use the `--json` flag, then theme information is returned in JSON format, which can be used as a
  machine-readable input for scripts or continuous integration.

  Sample output:

  ```json
  {
  "theme": {
  "id": 108267175958,
  "name": "MyTheme",
  "role": "unpublished",
  "shop": "mystore.myshopify.com",
  "editor_url": "https://mystore.myshopify.com/admin/themes/108267175958/editor",
  "preview_url": "https://mystore.myshopify.com/?preview_theme_id=108267175958"
  }
  }
  ```
```

## `shopify theme rename`

Renames an existing theme.

```
USAGE
  $ shopify theme rename [-d] [-e <value>] [-l] [-n <value>] [--no-color] [--password <value>] [-s <value>] [-t
    <value>] [--verbose]

FLAGS
  -d, --development          Rename your development theme.
  -e, --environment=<value>  The environment to apply to the current command.
  -l, --live                 Rename your remote live theme.
  -n, --name=<value>         The new name for the theme.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
  -t, --theme=<value>        Theme ID or name of the remote theme.
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Renames an existing theme.

  Renames a theme in your store.

  If no theme is specified, then you're prompted to select the theme that you want to rename from the list of themes in
  your store.
```

## `shopify theme share`

Creates a shareable, unpublished, and new theme on your theme library with a randomized name.

```
USAGE
  $ shopify theme share [-e <value>] [--no-color] [--password <value>] [--path <value>] [-s <value>] [--verbose]

FLAGS
  -e, --environment=<value>  The environment to apply to the current command.
  -s, --store=<value>        Store URL. It can be the store prefix (johns-apparel) or the full myshopify.com URL
                             (johns-apparel.myshopify.com, https://johns-apparel.myshopify.com).
      --no-color             Disable color output.
      --password=<value>     Password generated from the Theme Access app.
      --path=<value>         The path to your theme directory.
      --verbose              Increase the verbosity of the logs.

DESCRIPTION
  Creates a shareable, unpublished, and new theme on your theme library with a randomized name.

  Uploads your theme as a new, unpublished theme in your theme library. The theme is given a randomized name.

  This command returns a "preview link"
  (https://help.shopify.com/manual/online-store/themes/adding-themes#share-a-theme-preview-with-others) that you can
  share with others.
```

## `shopify upgrade`

Shows details on how to upgrade Shopify CLI.

```
USAGE
  $ shopify upgrade

DESCRIPTION
  Shows details on how to upgrade Shopify CLI.

  Shows details on how to upgrade Shopify CLI.
```

## `shopify version`

Shopify CLI version currently installed.

```
USAGE
  $ shopify version

DESCRIPTION
  Shopify CLI version currently installed.
```
<!-- commandsstop -->
