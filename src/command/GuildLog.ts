import { CommandInteraction, GuildBasedChannel } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { Command } from "./Command.js";

enum GuildLogGroup {
	user = "user",
	deletedMessage = "deleted_message"
}

enum GuildLogSubcommand {
	activate = "activate",
	desactivate = "desactivate"
}

export class GuildLog extends Command {
	constructor() {
		super("log", "Met en place des logs du serveur");

		this.availableTo = "owner";

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND_GROUP",
			name: GuildLogGroup.user,
			description: "Met en place des logs sur les arrivés et départs de membres",
			options: [{
				type: "SUB_COMMAND",
				name: GuildLogSubcommand.activate,
				description: "Active les logs d'arrivés et départs de membres",
				options: [{
					type: "CHANNEL",
					name: "channel",
					description: "Channel où les logs seront affichés",
					required: true,
					channelTypes: ["GUILD_TEXT"]
				}]
			}, {
				type: "SUB_COMMAND",
				name: GuildLogSubcommand.desactivate,
				description: "Désactive les logs d'arrivés et départs de membres"
			}]
		}, {
			type: "SUB_COMMAND_GROUP",
			name: GuildLogGroup.deletedMessage,
			description: "Met en place des logs sur les messages supprimés",
			options: [{
				type: "SUB_COMMAND",
				name: GuildLogSubcommand.activate,
				description: "Active les logs sur les messages supprimés",
				options: [{
					type: "CHANNEL",
					name: "channel",
					description: "Channel où les logs seront affichés",
					required: true,
					channelTypes: ["GUILD_TEXT"]
				}]
			}, {
				type: "SUB_COMMAND",
				name: GuildLogSubcommand.desactivate,
				description: "Désactive les logs sur les messages supprimés"
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">): Promise<void> {
		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				content: "Cette commande est réservée au admins, peut-être qu'un jour tu le seras ?",
				ephemeral: true
			});
		}

		const group = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();
		const channelLogRepo = getRepository(ChannelLog);

		// Choosing the correct subcommand to execute
		if (subcommand === GuildLogSubcommand.activate) {
			const channel = interaction.options.getChannel("channel", true);
			switch (group) {
			case GuildLogGroup.user:
				return this.activateUserLog(
					interaction,
					channel,
					channelLogRepo
				);
			case GuildLogGroup.deletedMessage:
				return this.activateDeletedMessageLog(
					interaction,
					channel,
					channelLogRepo
				);
			}
		} else if (subcommand === GuildLogSubcommand.desactivate) {
			switch (group) {
			case GuildLogGroup.user:
				return this.desactivateUserLog(interaction, channelLogRepo);
			case GuildLogGroup.deletedMessage:
				return this.desactivateUserLog(interaction, channelLogRepo);
			}
		}

		throw Error(`Unexpected group ${group} or subcommand ${subcommand}`);
	}

	async activateUserLog(interaction: CommandInteraction<"cached">, channel: GuildBasedChannel, channelLogRepo: Repository<ChannelLog>): Promise<void> {
		channelLogRepo.save(new ChannelLog(interaction.guildId, "userJoinLeave", channel.id));

		await interaction.reply({
			content: `Les logs d'arrivés et de départs des membres sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateUserLog(interaction: CommandInteraction<"cached">, channelLogRepo: Repository<ChannelLog>): Promise<void> {
		channelLogRepo.delete(new ChannelLog(interaction.guildId, "userJoinLeave"));

		await interaction.reply({
			content: "Les logs d'arrivés et de départs des membres sont désormais inactif",
			ephemeral: true
		});
	}

	async activateDeletedMessageLog(interaction: CommandInteraction<"cached">, channel: GuildBasedChannel, channelLogRepo: Repository<ChannelLog>): Promise<void> {
		channelLogRepo.save(new ChannelLog(interaction.guildId, "deletedMessage", channel.id));

		await interaction.reply({
			content: `Les logs des messages supprimés sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateDeletedMessageLog(interaction: CommandInteraction<"cached">, channelLogRepo: Repository<ChannelLog>): Promise<void> {
		channelLogRepo.delete(new ChannelLog(interaction.guildId, "deletedMessage"));

		await interaction.reply({
			content: "Les logs des messages supprimés sont désormais inactif",
			ephemeral: true
		});
	}
}
