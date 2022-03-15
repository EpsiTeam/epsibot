export function checkStartup(): void {
	const environmentVariables = [
		"DISCORD_TOKEN",
		"OWNERS"
	];

	// Checking all environment variables exists
	environmentVariables.map(checkEnv);

	process.env.VERSION = process.env.npm_package_version ?? "unknown";

	console.log(`Epsibot v${process.env.VERSION} starting`);
}

const checkEnv = (variable: string): void => {
	if (!process.env[variable]) {
		throw Error(`No environment variable ${variable} found, make sure you created a .env file at the root of the project containing this variable`);
	}
};
