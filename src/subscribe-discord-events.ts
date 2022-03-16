import { Client } from "discord.js";
import { interactionCreate } from "./events/interaction.js";
import { memberJoined, memberLeft } from "./events/member.js";
import { ready } from "./events/ready.js";

export function subscribeDiscordEvents(client: Client): void {
	client.once("ready", async (client) => {
		const commandManager = await ready(client);

		client.on("interactionCreate", async (interaction) => {
			await interactionCreate(commandManager, interaction);
		});
		client.on("guildMemberAdd", async member => {
			await memberJoined(member);
		});
		client.on("guildMemberRemove", async member => {
			await memberLeft(member);
		});

		console.log("Epsibot fully ready");
	});
}
