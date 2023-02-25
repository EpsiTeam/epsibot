import { EnvVariable } from "../util/EnvVariable.js";
import { Logger } from "../util/Logger.js";
import { clearSlashCommands } from "../util/register-slash-commands.js";

Logger.initialize(!EnvVariable.production);

await clearSlashCommands();

Logger.done("Slash commands cleared");
