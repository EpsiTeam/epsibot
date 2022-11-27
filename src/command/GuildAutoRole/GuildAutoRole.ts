import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
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
	constructor() {
		super(
			"autorole",
			"Gère le rôle assigné automatiquement aux nouveaux membres"
		);

		this.needPermissions = ["Administrator"];

		this.options = [
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
	}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return this.wrongPermissions(interaction);
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.info) return info(interaction);

		if (subcommand === Subcommand.enable) return enable(interaction);

		if (subcommand === Subcommand.disable) return disable(interaction);

		throw Error(`Unexpected subcommand ${subcommand}`);
	}
}
