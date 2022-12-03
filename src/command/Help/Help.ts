import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionData,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
} from "discord.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { Command } from "../Command.js";
import { CommandManager } from "../CommandManager.js";

enum HelpParam {
	everyone = "show_to_everyone"
}

export class Help extends Command {
	name = "help";

	description = "Affiche toutes les commandes disponibles";

	defaultPermission = null;

	options: APIApplicationCommandBasicOption[] = [
		{
			type: ApplicationCommandOptionType.Boolean,
			name: HelpParam.everyone,
			description:
				"Est-ce que le message qui affiche l'aide doit s'afficher pour tout le monde ?",
			required: false
		}
	];

	constructor(readonly manager: CommandManager) {
		super();
	}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const everyone =
			interaction.options.getBoolean(HelpParam.everyone) ?? false;

		let text = "";

		for (const command of this.manager.commandList) {
			// Do not display owner only commands
			if (command.availableTo === "owner") continue;

			text += `\n\n\`/${command.name}\`: ${command.description}`;

			for (const subcommand of command.options) {
				if (
					subcommand.type !==
						ApplicationCommandOptionType.Subcommand &&
					subcommand.type !==
						ApplicationCommandOptionType.SubcommandGroup
				) {
					continue;
				}

				const subcommands: ApplicationCommandOptionData[] = [];

				if (
					subcommand.type === ApplicationCommandOptionType.Subcommand
				) {
					subcommands.push(subcommand);
				} else {
					for (const subsubcommand of subcommand.options ?? []) {
						if (
							subsubcommand.type ===
							ApplicationCommandOptionType.Subcommand
						)
							subcommands.push(subsubcommand);
					}
				}

				for (const sub of subcommands) {
					// eslint-disable-next-line no-irregular-whitespace
					text += `\n　　\`/${command.name} ${sub.name}\`: ${sub.description}`;
				}
			}
		}

		return interaction.reply({
			embeds: [
				{
					title: "Liste des slash commandes",
					description: text,
					footer: {
						text: "Tip: commencer un message par / affichera la liste des slash commandes disponibles"
					},
					color: EpsibotColor.info
				}
			],
			ephemeral: !everyone
		});
	}
}
