import { CommandInteraction, GuildBasedChannel } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { Command } from "./manager/Command.js";

enum Subcommand {
	enable = "enable",
	disable = "disable",
	list = "list"
}

enum LogType {
	all = "all",
	user = "user",
	deletedMessage = "deleted_message",
	updatedMessage = "updated_message"
}

enum Params {
	logType = "log_type",
	channel = "channel"
}

export class GuildLog extends Command {
	constructor() {
		super("log", "Met en place des logs du serveur");

		this.needPermissions = ["ADMINISTRATOR"];

		// Choices for the log type
		const logChoices = [{
			name: "Tous les logs",
			value: LogType.all
		}, {
			name: "Logs sur les arrivés et départs de membre",
			value: LogType.user
		}, {
			name: "Logs sur les messages supprimés",
			value: LogType.deletedMessage
		}, {
			name: "Logs sur les messages modifiés",
			value: LogType.updatedMessage
		}];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.list,
			description: "Liste les logs activés, et dans quel channel les logs sont écrit"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.enable,
			description: "Active un type de log",
			options: [{
				type: "STRING",
				name: Params.logType,
				description: "Type de log à activer",
				required: true,
				choices: logChoices
			}, {
				type: "CHANNEL",
				name: Params.channel,
				description: "Channel où les logs seront affichés",
				required: true,
				channelTypes: ["GUILD_TEXT"]
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.disable,
			description: "Désactive un type de log",
			options: [{
				type: "STRING",
				name: Params.logType,
				description: "Type de log à désactiver",
				required: true,
				choices: logChoices
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				embeds: [{
					title: "Cette commande est réservée au admins, peut-être qu'un jour tu le seras ?",
					color: "RED"
				}],
				ephemeral: true
			});
		}

		const subcommand = interaction.options.getSubcommand();
		const channelLogRepo = getRepository(ChannelLog);

		if (subcommand === Subcommand.list) {
			return this.listLogs(
				interaction,
				channelLogRepo
			);
		}

		const logtype = interaction.options.getString(Params.logType, true);

		// Choosing the correct subcommand to execute
		if (subcommand === Subcommand.enable) {
			const channel =
				interaction.options.getChannel(Params.channel, true);

			switch (logtype) {
			case LogType.all:
				return this.enableAllLog(
					interaction,
					channel,
					channelLogRepo
				);
			case LogType.user:
				return this.enableUserLog(
					interaction,
					channel,
					channelLogRepo
				);
			case LogType.deletedMessage:
				return this.enableDeletedMessageLog(
					interaction,
					channel,
					channelLogRepo
				);
			case LogType.updatedMessage:
				return this.enableUpdatedMessageLog(
					interaction,
					channel,
					channelLogRepo
				);
			}
		} else if (subcommand === Subcommand.disable) {
			switch (logtype) {
			case LogType.all:
				return this.disableAllLog(
					interaction,
					channelLogRepo
				);
			case LogType.user:
				return this.disableUserLog(
					interaction,
					channelLogRepo
				);
			case LogType.deletedMessage:
				return this.disableUserLog(
					interaction,
					channelLogRepo
				);
			case LogType.updatedMessage:
				return this.disableUpdatedMessageLog(
					interaction,
					channelLogRepo
				);
			}
		}

		throw Error(`Unexpected logType ${logtype} or subcommand ${subcommand}`);
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

	async enableAllLog(
		interaction: CommandInteraction<"cached">,
		channel: GuildBasedChannel,
		channelLogRepo: Repository<ChannelLog>
	) {
		await Promise.all([
			channelLogRepo.save(new ChannelLog(
				interaction.guildId,
				"userJoinLeave",
				channel.id
			)),
			channelLogRepo.save(new ChannelLog(
				interaction.guildId,
				"deletedMessage",
				channel.id
			)),
			channelLogRepo.save(new ChannelLog(
				interaction.guildId,
				"updatedMessage",
				channel.id
			))
		]);

		return interaction.reply({
			embeds: [{
				title: "Logs activés",
				description: `Tous les logs sont désormais actif sur le channel ${channel}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async disableAllLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		await channelLogRepo.delete({
			guildId: interaction.guildId
		});

		return interaction.reply({
			embeds: [{
				title: "Logs désactivés",
				description: "Tous les logs sont désormais inactif",
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async enableUserLog(
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
			embeds: [{
				title: "Logs activés",
				description: `Les logs d'arrivés et de départs des membres sont désormais actif sur le channel ${channel}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async disableUserLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		await channelLogRepo.remove(new ChannelLog(
			interaction.guildId,
			"userJoinLeave"
		));

		return interaction.reply({
			embeds: [{
				title: "Logs désactivés",
				description: "Les logs d'arrivés et de départs des membres sont désormais inactif",
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async enableDeletedMessageLog(
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
			embeds: [{
				title: "Logs activés",
				description: `Les logs des messages supprimés sont désormais actif sur le channel ${channel}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async disableDeletedMessageLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		await channelLogRepo.remove(new ChannelLog(
			interaction.guildId,
			"deletedMessage"
		));

		return interaction.reply({
			embeds: [{
				title: "Logs desactivés",
				description: "Les logs des messages supprimés sont désormais inactif",
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async enableUpdatedMessageLog(
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
			embeds: [{
				title: "Logs activés",
				description: `Les logs des messages modifiés sont désormais actif sur le channel ${channel}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async disableUpdatedMessageLog(
		interaction: CommandInteraction<"cached">,
		channelLogRepo: Repository<ChannelLog>
	) {
		await channelLogRepo.remove(new ChannelLog(
			interaction.guildId,
			"updatedMessage"
		));

		return interaction.reply({
			embeds: [{
				title: "Logs desactivés",
				description: "Les logs des messages modifiés sont désormais inactif",
				color: "GREEN"
			}],
			ephemeral: true
		});
	}
}
