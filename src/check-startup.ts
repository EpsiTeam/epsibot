import { checkEnvironmentVariables, EnvVariables } from "./utils/env/EnvVariables.js";
import { Logger } from "./utils/logger/Logger.js";

/**
 * Do some firsthand checks on the process (mainly environment variables)
 * and exit is something is not correctly set
 */
export function checkStartup(): void {
	checkEnvironmentVariables();

	Logger.initialize(!EnvVariables.production);

	Logger.info(`Epsibot v${EnvVariables.version} starting`);
}
