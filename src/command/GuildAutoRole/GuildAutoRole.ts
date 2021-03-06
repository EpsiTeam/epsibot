import { CommandInteraction } from "discord.js";
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
		super("autorole", "Gère le rôle assigné automatiquement aux nouveaux membres");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.info,
			description: "Affiche quel rôle est automatiquement assigné"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.enable,
			description: "Active le rôle automatique",
			options: [{
				type: "ROLE",
				name: EnableParam.role,
				description: "Rôle à assigner automatiquement aux nouveaux membres",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.disable,
			description: "Désactive le rôle automatique"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return this.wrongPermissions(interaction);
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.info)
			return info(interaction);

		if (subcommand === Subcommand.enable)
			return enable(interaction);

		if (subcommand === Subcommand.disable)
			return disable(interaction);

		throw Error(`Unexpected subcommand ${subcommand}`);
	}
}
