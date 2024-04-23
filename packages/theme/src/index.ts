import CheckCommand from './cli/commands/theme/check.js'
import ConsoleCommand from './cli/commands/theme/console.js'
import DeleteCommand from './cli/commands/theme/delete.js'
import Dev from './cli/commands/theme/dev.js'
import ThemeInfo from './cli/commands/theme/info.js'
import Init from './cli/commands/theme/init.js'
import LanguageServer from './cli/commands/theme/language-server.js'
import ListCommnd from './cli/commands/theme/list.js'
import Open from './cli/commands/theme/open.js'
import Package from './cli/commands/theme/package.js'
import Publish from './cli/commands/theme/publish.js'
import Pull from './cli/commands/theme/pull.js'
import Push from './cli/commands/theme/push.js'
import Rename from './cli/commands/theme/rename.js'
import Serve from './cli/commands/theme/serve.js'
import Share from './cli/commands/theme/share.js'
import CheckPattern from './cli/commands/theme/check-pattern.js'

const COMMANDS = {
  'theme:init': Init,
  'theme:check': CheckCommand,
  'theme:console': ConsoleCommand,
  'theme:delete': DeleteCommand,
  'theme:dev': Dev,
  'theme:info': ThemeInfo,
  'theme:language-server': LanguageServer,
  'theme:list': ListCommnd,
  'theme:open': Open,
  'theme:package': Package,
  'theme:publish': Publish,
  'theme:pull': Pull,
  'theme:push': Push,
  'theme:rename': Rename,
  'theme:serve': Serve,
  'theme:share': Share,
  'theme:check-pattern': CheckPattern,
}

export default COMMANDS
