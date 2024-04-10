// This is an autogenerated file. Don't edit this file manually.
export interface hydrogenpreview {
  /**
   * The path to the directory of the Hydrogen storefront. Defaults to the current directory where the command is run.
   */
  '--path <value>'?: string

  /**
   * The port to run the server on. Defaults to 3000.
   */
  '--port <value>'?: string

  /**
   * Runs the app in a Node.js sandbox instead of an Oxygen worker.
   */
  '--legacy-runtime'?: ''

  /**
   * Specifies the environment to pull variables from using its Git branch name.
   */
  '-e, --env-branch <value>'?: string

  /**
   * The port where the inspector is available. Defaults to 9229.
   */
  '--inspector-port <value>'?: string

  /**
   * Enables inspector connections to the server with a debugger such as Visual Studio Code or Chrome DevTools.
   */
  '--debug'?: ''
}
