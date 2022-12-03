import {
	APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
	ChannelType,
	ChatInputCommandInteraction,
	PermissionFlagsBits
} from "discord.js";
import { Command } from "../Command.js";
import { GuildLogType } from "./channel-log-type.js";
import { disable, DisableParam } from "./disable.js";
import { enable, EnableParam } from "./enable.js";
import { ignore, IgnoreParam } from "./ignore.js";
import { list } from "./list.js";

enum Subcommand {
	list = "list",
	enable = "enable",
	disable = "disable",
	ignore = "ignore"
}

// Choices for the log type
const logChoices = [
	{
		name: "Tous les logs",
		value: GuildLogType.all
	},
	{
		name: "Logs sur les arrivés et départs de membre",
		value: GuildLogType.user
	},
	{
		name: "Logs sur les messages supprimés",
		value: GuildLogType.deletedMessage
	},
	{
		name: "Logs sur les messages modifiés",
		value: GuildLogType.updatedMessage
	}
];

export class GuildLog extends Command {
	name = "log";

	description = "Met en place des logs du serveur";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.list,
			description:
				"Liste les logs activés, et dans quel channel les logs sont écrit"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.enable,
			description: "Active un type de log",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: EnableParam.logType,
					description: "Type de log à activer",
					required: true,
					choices: logChoices
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: EnableParam.channel,
					description: "Channel où les logs seront affichés",
					required: true,
					channel_types: [ChannelType.GuildText]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.disable,
			description: "Désactive un type de log",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: DisableParam.logType,
					description: "Type de log à désactiver",
					required: true,
					choices: logChoices
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.ignore,
			description: "Ignore ou non certains channels pour les logs",
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: IgnoreParam.channel,
					description:
						"Channel à ignorer ou non, les messages supprimés/modifiés seront ou non dans les logs",
					required: true,
					channel_types: [ChannelType.GuildText]
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: IgnoreParam.ignored,
					description: "Est-ce que ce channel doit être ignoré ?",
					required: true
				}
			]
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();
		// List logs
		if (subcommand === Subcommand.list) return list(interaction);
		// Ignore or watch a channel for logs
		if (subcommand === Subcommand.ignore) return ignore(interaction);
		// Enabling logs
		if (subcommand === Subcommand.enable) return enable(interaction);
		// Disabling logs
		if (subcommand === Subcommand.disable) return disable(interaction);

		throw new Error(`Unexpected subcommand ${subcommand}`);
	}
}
