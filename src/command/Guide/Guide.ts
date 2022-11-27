import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Command } from "../Command.js";
import { text } from "./guide-text.js";

enum GuideParam {
	everyone = "show_to_everyone"
}

export class Guide extends Command {
	constructor() {
		super("guide", "Affiche un guide général pour m'utiliser");

		this.options = [{
			type: ApplicationCommandOptionType.Boolean,
			name: GuideParam.everyone,
			description: "Est-ce que le message qui affiche le guide doit s'afficher pour tout le monde ?",
			required: false
		}];
	}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const everyone =
			interaction.options.getBoolean(GuideParam.everyone) ?? false;

		return interaction.reply({
			embeds: [{
				title: "Que peut-on faire avec moi ?",
				description: text,
				footer: {
					text: "Tip: commencer un message par / affichera la liste des slash commandes disponibles"
				},
				color: EpsibotColor.info
			}],
			ephemeral: !everyone
		});
	}
}
