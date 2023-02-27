import { EnvVariable } from "../util/EnvVariable.js";
import { Logger } from "../util/Logger.js";
import { clearSlashCommands } from "../util/slash-commands.ts/clear-slash-commands.js";

Logger.initialize(!EnvVariable.production);

await clearSlashCommands();

Logger.done("Slash commands cleared");
