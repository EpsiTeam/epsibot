import { EnvVariable } from "../util/EnvVariable.js";
import { Logger } from "../util/Logger.js";
import { registerCommands } from "../util/register-commands.js";

Logger.initialize(!EnvVariable.production);

await registerCommands();

Logger.done("Commands registered to discord");
