import { Logger } from "./utils/logger/Logger.js";

/**
 * Do some firsthand checks on the process (mainly environment variables)
 * and exit is something is not correctly set
 */
export function checkStartup(): void {
	const environmentVariables = [
		"DISCORD_TOKEN",
		"OWNERS"
	];

	// Checking all environment variables exists
	environmentVariables.map(checkEnv);

	process.env.VERSION = process.env.npm_package_version ?? "unknown";

	Logger.initialize(process.env.PRODUCTION === "false");

	Logger.info(`Epsibot v${process.env.VERSION} starting`);
}

const checkEnv = (variable: string): void => {
	if (!process.env[variable]) {
		throw Error(`No environment variable ${variable} found, make sure you created a .env file at the root of the project containing this variable`);
	}
};
