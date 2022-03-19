import { CommandInteraction, GuildBasedChannel } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { Command } from "./Command.js";

enum GuildLogGroup {
	user = "user",
	deletedMessage = "deleted_message",
	updatedMessage = "updated_message"
}

enum GuildLogSubcommand {
	activate = "activate",
	desactivate = "desactivate",
	list = "list"
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
		}, {
			type: "SUB_COMMAND_GROUP",
			name: GuildLogGroup.updatedMessage,
			description: "Met en place des logs sur les messages modifiés",
			options: [{
				type: "SUB_COMMAND",
				name: GuildLogSubcommand.activate,
				description: "Active les logs sur les messages modifiés",
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
				description: "Désactive les logs sur les messages modifiés"
			}]
		}, {
			type: "SUB_COMMAND",
			name: "list",
			description: "Liste les logs activés, et dans quel channel les logs sont écrit"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				content: "Cette commande est réservée au admins, peut-être qu'un jour tu le seras ?",
				ephemeral: true
			});
		}

		const subcommand = interaction.options.getSubcommand();
		const channelLogRepo = getRepository(ChannelLog);

		if (subcommand === GuildLogSubcommand.list) {
			return this.listLogs(
				interaction,
				channelLogRepo
			);
		}

		const group = interaction.options.getSubcommandGroup();

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
			case GuildLogGroup.updatedMessage:
				return this.activateUpdatedMessageLog(
					interaction,
					channel,
					channelLogRepo
				);
			}
		} else if (subcommand === GuildLogSubcommand.desactivate) {
			switch (group) {
			case GuildLogGroup.user:
				return this.desactivateUserLog(
					interaction,
					channelLogRepo)
				;
			case GuildLogGroup.deletedMessage:
				return this.desactivateUserLog(
					interaction,
					channelLogRepo
				);
			case GuildLogGroup.updatedMessage:
				return this.desactivateUpdatedMessageLog(
					interaction,
					channelLogRepo
				);
			}
		}

		throw Error(`Unexpected group ${group} or subcommand ${subcommand}`);
	}

	async listLogs(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		const promisesDb = [
			channelLogRepo.findOne(new ChannelLog(
				interaction.guildId,
				"userJoinLeave"
			)),
			channelLogRepo.findOne(new ChannelLog(
				interaction.guildId,
				"deletedMessage"
			)),
			channelLogRepo.findOne(new ChannelLog(
				interaction.guildId,
				"updatedMessage"
			))
		];

		const [
			userLog,
			deletedLog,
			updatedLog
		] = await Promise.all(promisesDb);

		const notConfigured = (logType: string) =>
			`**${logType}** → non configuré`;

		const configured = async (logType: string, channelId: string) => {
			const channel = await interaction.guild.channels.fetch(channelId);

			return `**${logType}** → ${channel}`;
		};

		const configurationMsg = async (
			channelLog: ChannelLog | undefined,
			logType: string
		) => {
			if (channelLog) {
				return configured(logType, channelLog.channelId);
			} else {
				return notConfigured(logType);
			}
		};

		let message = await configurationMsg(userLog, "Arrivés et départs de membres");
		message += "\n" + await configurationMsg(deletedLog, "Messages supprimés");
		message += "\n" + await configurationMsg(updatedLog, "Messages modifiés");

		interaction.reply({
			embeds: [{
				title: "Liste des configurations des logs",
				description: message
			}],
			ephemeral: true
		});
	}

	async activateUserLog(
		interaction: CommandInteraction<"cached">,
		channel: GuildBasedChannel,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.save(new ChannelLog(
			interaction.guildId,
			"userJoinLeave",
			channel.id
		));

		return interaction.reply({
			content: `Les logs d'arrivés et de départs des membres sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateUserLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.delete(new ChannelLog(
			interaction.guildId,
			"userJoinLeave"
		));

		return interaction.reply({
			content: "Les logs d'arrivés et de départs des membres sont désormais inactif",
			ephemeral: true
		});
	}

	async activateDeletedMessageLog(
		interaction: CommandInteraction<"cached">,
		channel: GuildBasedChannel,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.save(new ChannelLog(
			interaction.guildId,
			"deletedMessage",
			channel.id
		));

		return interaction.reply({
			content: `Les logs des messages supprimés sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateDeletedMessageLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.delete(new ChannelLog(
			interaction.guildId,
			"deletedMessage"
		));

		return interaction.reply({
			content: "Les logs des messages supprimés sont désormais inactif",
			ephemeral: true
		});
	}

	async activateUpdatedMessageLog(
		interaction: CommandInteraction<"cached">,
		channel: GuildBasedChannel,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.save(new ChannelLog(
			interaction.guildId,
			"updatedMessage",
			channel.id
		));

		return interaction.reply({
			content: `Les logs des messages modifiés sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateUpdatedMessageLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		channelLogRepo.delete(new ChannelLog(
			interaction.guildId,
			"updatedMessage"
		));

		return interaction.reply({
			content: "Les logs des messages modifiés sont désormais inactif",
			ephemeral: true
		});
	}
}
