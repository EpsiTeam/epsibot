import { EnvVariable } from "../util/EnvVariable.js";
import { Logger } from "../util/Logger.js";
import { registerSlashCommands } from "../util/slash-commands.ts/register-slash-commands.js";

Logger.initialize(!EnvVariable.production);

await registerSlashCommands();

Logger.done("Slash commands registered to discord");
