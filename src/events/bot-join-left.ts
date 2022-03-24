import { Guild } from "discord.js";
import { getRepository } from "typeorm";
import { CommandManager } from "../command/manager/CommandManager.js";
import { AutoRole } from "../entity/AutoRole.js";
import { ChannelLog } from "../entity/ChannelLog.js";
import { CustomCommand } from "../entity/CustomCommand.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";

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
		return guild.leave();
	}

	console.log(`Epsibot invited to new guild ${guild.name} [${guild.id}], registerings commands on it`);
	return commandManager.registerCommands([guild]);
}

export async function botRemoved(guild: Guild) {
	console.log(`Epsibot removed from guild ${guild.name} [${guild.id}], cleaning up DB`);

	await Promise.all([
		getRepository(ChannelLog).delete({
			guildId: guild.id
		}),
		getRepository(CustomCommand).delete({
			guildId: guild.id
		}),
		getRepository(AutoRole).delete({
			guildId: guild.id
		}),
		getRepository(IgnoredChannel).delete({
			guildId: guild.id
		})
	]);
}
