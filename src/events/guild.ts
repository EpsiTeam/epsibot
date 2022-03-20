import { Guild } from "discord.js";
import { getRepository } from "typeorm";
import { CommandManager } from "../command/manager/CommandManager.js";
import { ChannelLog } from "../entity/ChannelLog.js";

export async function botInvited(
	commandManager: CommandManager,
	guild: Guild
) {
	console.log(`Epsibot invited to new guild ${guild.name} [${guild.id}], registerings commands on it`);
	commandManager.registerCommands([guild]);
}

export async function botRemoved(guild: Guild) {
	console.log(`Epsibot removed from guild ${guild.name} [${guild.id}], cleaning up DB`);

	const repo = getRepository(ChannelLog);
	return repo.delete({
		guildId: guild.id
	});

}
