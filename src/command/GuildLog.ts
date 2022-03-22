import { CommandInteraction, GuildBasedChannel } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";
import { Command } from "./manager/Command.js";

enum Subcommand {
	list = "list",
	enable = "enable",
	disable = "disable",
	ignore = "ignore"
}

enum LogType {
	all = "all",
	user = "user",
	deletedMessage = "deleted_message",
	updatedMessage = "updated_message"
}

enum Params {
	logType = "log_type",
	channel = "channel",
	ignored = "ignored"
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
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.ignore,
			description: "Ignore ou non certains channels pour les logs",
			options: [{
				type: "CHANNEL",
				name: Params.channel,
				description: "Channel à ignorer ou non, les messages supprimés/modifiés seront ou non dans les logs",
				required: true,
				channelTypes: ["GUILD_TEXT"]
			}, {
				type: "BOOLEAN",
				name: Params.ignored,
				description: "Est-ce que ce channel doit être ignoré ?",
				required: true
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

		if (subcommand === Subcommand.ignore) {
			return this.ignoreLogs(interaction);
		}

		const logtype = interaction.options.getString(Params.logType, true);

		// Choosing the correct subcommand to execute
		if (subcommand === Subcommand.enable) {
			const channel = interaction.options.getChannel(
				Params.channel,
				true
			);

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
		// Retrieve all types of log
		const [userLog, deletedLog, updatedLog] = await Promise.all([
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
		]);

		// -- Some function to help build the list --
		// Get a channel from Discord (not so easy because the channel
		// might have been deleted)
		const getChannel = async (channelId: string) => {
			const deletedChannel = "(channel supprimé)";
			try {
				const channel =
					await interaction.guild.channels.fetch(channelId);
				return channel?.toString() ?? deletedChannel;
			} catch (err) {
				// This is a special case where we're sure
				// the channel has been deleted
				if (err?.code === 10003) {
					// Better clean our DB
					await getRepository(IgnoredChannel).remove(
						new IgnoredChannel(interaction.guildId, channelId)
					);
				}
				return deletedChannel;
			}
		};
		// Print a line for a not configured log
		const notConfigured = (logType: string) =>
			`**${logType}** → non configuré`;
		// Print a line for a configured log
		const configured = async (logType: string, channelId: string) => {
			const channel = await getChannel(channelId);

			return `**${logType}** → ${channel}`;
		};
		// Print a line for a type of log
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

		// Starting building the list
		let message = "";
		message += await configurationMsg(userLog, "Arrivés et départs de membres");
		message += "\n" + await configurationMsg(deletedLog, "Messages supprimés");
		message += "\n" + await configurationMsg(updatedLog, "Messages modifiés");

		// Retrieve ignored channels
		const ignoredChannels = await getRepository(IgnoredChannel).find({
			where: {
				guildId: interaction.guildId
			}
		});

		// Finish building the list
		if (ignoredChannels.length > 0) {
			message += "\n\nChannels ignorés (les messages supprimés ou modifés dans ces channels ne seront pas log):";
		}
		for (const ignoredChannel of ignoredChannels) {
			const channel = await getChannel(ignoredChannel.channelId);
			message += `\n${channel}`;
		}

		return interaction.reply({
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

	async ignoreLogs(interaction: CommandInteraction<"cached">) {
		const ignored = interaction.options.getBoolean(Params.ignored, true);
		const channel = interaction.options.getChannel(Params.channel, true);
		const ignoredChannelRepo = getRepository(IgnoredChannel);

		if (!ignored) {
			await ignoredChannelRepo.remove(new IgnoredChannel(
				interaction.guildId,
				channel.id
			));

			return interaction.reply({
				embeds: [{
					title: "Channel pris en compte pour les logs",
					description: `Le channel ${channel} sera maintenant pris en compte pour les logs des messages supprimés ou modifiés`,
					color: "GREEN"
				}],
				ephemeral: true
			});
		}

		await ignoredChannelRepo.save(new IgnoredChannel(
			interaction.guildId,
			channel.id
		));

		return interaction.reply({
			embeds: [{
				title: "Channel ignoré pour les logs",
				description: `Le channel ${channel} sera maintenant ignoré pour les logs des messages supprimés ou modifiés`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}
}
