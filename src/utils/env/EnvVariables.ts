export class EnvVariables {
	static readonly production = process.env.PRODUCTION === "true";
	static readonly discordToken = process.env.DISCORD_TOKEN as string;
	static readonly owners = (process.env.OWNERS as string).split(",");
	static readonly version = process.env.npm_package_version as string;
}

export function checkEnvironmentVariables() {
	const envVar = "Environment variable ";
	const helpDotEnv = " not found, make sure you created a .env file at the root of the project containing this variable. Read the README.md for more information";
	const showError = (env: string) => envVar + env + helpDotEnv;

	if (!process.env.PRODUCTION) throw Error(showError("PRODUCTION"));
	if (!process.env.DISCORD_TOKEN) throw Error(showError("DISCORD_TOKEN"));
	if (!process.env.OWNERS) throw Error(showError("OWNERS"));
	if (!process.env.npm_package_version) throw Error(`${envVar} npm_package_version not found, this happens if you use directly node to start this project. Please use npm start`);
}
