import { CommandInteraction } from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Command } from "../Command.js";

export class InviteLink extends Command {
	constructor() {
		super("invite_link", "Permet d'obtenir le lien pour m'inviter sur un autre serveur");
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const link = interaction.client.generateInvite({
			permissions: ["ADMINISTRATOR"],
			scopes: [
				"applications.commands",
				"bot"
			]
		});

		return interaction.reply({
			embeds: [{
				description: "Pour m'inviter sur un autre serveur, il faut cliquer sur le bouton ci-dessous.\n\nJ'ai besoin de la permission administrateur pour certaines de mes fonctionnalités, comme l'assignation de rôle automatique ou la purge de message",
				footer: {
					text: "Attention, je refuse de rejoindre un serveur sans la permission administrateur"
				},
				color: EpsibotColor.info
			}],
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					style: "LINK",
					label: "Lien d'invitation",
					url: link
				}]
			}],
			ephemeral: true
		});
	}
}
