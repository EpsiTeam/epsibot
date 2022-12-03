export class EnvVariable {
	static readonly production = process.env.PRODUCTION === "true";
	static readonly applicationId = process.env.APPLICATION_ID ?? "";
	static readonly devGuildId = process.env.DEV_GUILD_ID ?? "";
	static readonly discordToken = process.env.DISCORD_TOKEN ?? "";
	static readonly owners = (process.env.OWNERS ?? "").split(",");
	static readonly version = process.env.npm_package_version ?? "";
}

function showError(env: string) {
	return `Environment variable ${env} not found, make sure you created a .env file at the root of the project containing this variable. Read the README.md for more information`;
}

["PRODUCTION", "APPLICATION_ID", "DISCORD_TOKEN", "OWNERS"].map((env) => {
	if (!process.env[env]) throw new Error(showError(env));
});

if (!EnvVariable.production && EnvVariable.devGuildId === "") {
	throw new Error(showError("DEV_GUILD_ID"));
}

if (!process.env.npm_package_version)
	throw new Error(
		"Environment variable npm_package_version not found, this happens if you use directly node to start this project. Please use npm start"
	);
