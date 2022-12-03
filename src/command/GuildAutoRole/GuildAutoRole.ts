import {
	APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionFlagsBits
} from "discord.js";
import { Command } from "../Command.js";
import { disable } from "./disable.js";
import { enable, EnableParam } from "./enable.js";
import { info } from "./info.js";

enum Subcommand {
	info = "info",
	enable = "enable",
	disable = "disable"
}

export class GuildAutoRole extends Command {
	name = "autorole";

	description = "Gère le rôle assigné automatiquement aux nouveaux membres";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.info,
			description: "Affiche quel rôle est automatiquement assigné"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.enable,
			description: "Active le rôle automatique",
			options: [
				{
					type: ApplicationCommandOptionType.Role,
					name: EnableParam.role,
					description:
						"Rôle à assigner automatiquement aux nouveaux membres",
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.disable,
			description: "Désactive le rôle automatique"
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.info) return info(interaction);

		if (subcommand === Subcommand.enable) return enable(interaction);

		if (subcommand === Subcommand.disable) return disable(interaction);

		throw new Error(`Unexpected subcommand ${subcommand}`);
	}
}
