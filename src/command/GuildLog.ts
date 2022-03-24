import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog, logType } from "../entity/ChannelLog.js";
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
		// List logs
		if (subcommand === Subcommand.list) {
			return this.listLogs(interaction);
		}
		// Ignore or watch a channel for logs
		if (subcommand === Subcommand.ignore) {
			return this.ignoreLogs(interaction);
		}

		// The type of log we should enable or disable
		const paramLogType =
			interaction.options.getString(Params.logType, true);

		// Maybe all of them?
		if (paramLogType === LogType.all) {
			if (subcommand === Subcommand.enable) {
				return this.enableAllLog(interaction);
			} else if (subcommand === Subcommand.disable) {
				return this.disableAllLog(interaction);
			}
			throw Error(`Subcommand ${subcommand} is not recognized for log type ${paramLogType}`);
		}

		// Mapping the log type displayed to the user to the one in our DB
		let logType: logType;
		switch (paramLogType) {
		case LogType.user:
			logType = "userJoinLeave";
			break;
		case LogType.deletedMessage:
			logType = "deletedMessage";
			break;
		case LogType.updatedMessage:
			logType = "updatedMessage";
			break;
		default:
			throw Error(`logType ${paramLogType} is not recognized, don't how which ChannelLog.logType to assign`);
		}

		// Enabling or disable those logs
		if (subcommand === Subcommand.enable) {
			return this.enableLog(interaction, logType);
		} else if (subcommand === Subcommand.disable) {
			return this.disableLog(interaction, logType);
		}

		throw Error(`Unexpected subcommand ${subcommand}`);
	}

	private async listLogs(interaction: CommandInteraction<"cached">) {
		const repo = getRepository(ChannelLog);
		const guildId = interaction.guildId;

		// Retrieve all types of log
		const [userLog, deletedLog, updatedLog] = await Promise.all([
			repo.findOne(new ChannelLog(guildId, "userJoinLeave")),
			repo.findOne(new ChannelLog(interaction.guildId, "deletedMessage")),
			repo.findOne(new ChannelLog(interaction.guildId, "updatedMessage"))
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
				if (err?.code === 10003) { // Unknown channel
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

	private async enableAllLog(interaction: CommandInteraction<"cached">) {
		const channel = interaction.options.getChannel(Params.channel, true);
		const repo = getRepository(ChannelLog);

		await repo.save([
			new ChannelLog(interaction.guildId, "userJoinLeave", channel.id),
			new ChannelLog(interaction.guildId, "deletedMessage", channel.id),
			new ChannelLog(interaction.guildId, "updatedMessage", channel.id)
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

	private async disableAllLog(interaction: CommandInteraction<"cached">) {
		await getRepository(ChannelLog).delete({
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

	private async enableLog(interaction: CommandInteraction<"cached">, logType: logType) {
		const channel = interaction.options.getChannel(Params.channel, true);
		const logDescription = this.getLogDescription(logType);

		await getRepository(ChannelLog).save(new ChannelLog(
			interaction.guildId,
			logType,
			channel.id
		));

		return interaction.reply({
			embeds: [{
				title: "Logs activés",
				description: `Les logs ${logDescription} sont désormais actif sur le channel ${channel}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	private async disableLog(interaction: CommandInteraction<"cached">, channelLogType: logType) {
		const logDescription = this.getLogDescription(channelLogType);

		await getRepository(ChannelLog).remove(new ChannelLog(
			interaction.guildId,
			channelLogType
		));

		return interaction.reply({
			embeds: [{
				title: "Logs désactivés",
				description: `Les logs ${logDescription} sont désormais inactif`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	private async ignoreLogs(interaction: CommandInteraction<"cached">) {
		const ignored = interaction.options.getBoolean(Params.ignored, true);
		const channel = interaction.options.getChannel(Params.channel, true);
		const repo = getRepository(IgnoredChannel);

		if (!ignored) {
			await repo.remove(new IgnoredChannel(
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

		await repo.save(new IgnoredChannel(
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

	private getLogDescription(logType: logType) {
		switch (logType) {
		case "userJoinLeave":
			return "d'arrivés et de départs des membres";
		case "deletedMessage":
			return "des messages supprimés";
		case "updatedMessage":
			return "des messages modifiés";
		default:
			return `de type ${logType}`;
		}
	}
}
