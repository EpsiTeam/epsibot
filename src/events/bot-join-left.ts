import { Guild } from "discord.js";
import { CommandManager } from "../command/manager/CommandManager.js";

export async function botInvited(
	commandManager: CommandManager,
	guild: Guild
) {
	if (!guild.me) {
		console.error(`Epsibot has been invited to guild ${guild.name} [${guild.id}], but guild.me is not defined`);
		return;
	}
	if (!guild.me.permissions.has("ADMINISTRATOR")) {
		console.error(`Epsibot has been invited to guild ${guild.name} [${guild.id}] without admin permissions, leaving guild`);
		try {
			return guild.leave();
		} catch (err) {
			console.error(`Failed to leave guild ${guild.name} [${guild.id}]: ${err.stack}`);
			return;
		}
	}

	console.log(`Epsibot invited to new guild ${guild.name} [${guild.id}], registerings commands on it`);
	try {
		return commandManager.registerCommands([guild]);
	} catch (err) {
		console.error(`Failed to register commands: ${err.stack}`);
		return;
	}
}

export async function botRemoved(guild: Guild) {
	console.log(`Epsibot removed from guild ${guild.name} [${guild.id}]`);

	/* Not cleaning DB, in case Epsibot is reinvited after */
	// await Promise.all([
	// 	getRepository(ChannelLog).delete({
	// 		guildId: guild.id
	// 	}),
	// 	getRepository(CustomCommand).delete({
	// 		guildId: guild.id
	// 	}),
	// 	getRepository(AutoRole).delete({
	// 		guildId: guild.id
	// 	}),
	// 	getRepository(IgnoredChannel).delete({
	// 		guildId: guild.id
	// 	})
	// ]);
}
