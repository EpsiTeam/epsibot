import { REST } from "discord.js";
import { EnvVariable } from "../EnvVariable.js";

export function getRest() {
	return new REST({ version: "10" }).setToken(EnvVariable.discordToken);
}
