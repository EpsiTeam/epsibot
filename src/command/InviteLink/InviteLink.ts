import {
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	OAuth2Scopes
} from "discord.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { Command } from "../Command.js";

export class InviteLink extends Command {
	name = "invite_link";

	description =
		"Permet d'obtenir le lien pour m'inviter sur un autre serveur";

	defaultPermission = null;

	options = [];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const link = interaction.client.generateInvite({
			permissions: ["Administrator"],
			scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot]
		});

		return interaction.reply({
			embeds: [
				{
					description:
						"Pour m'inviter sur un autre serveur, il faut cliquer sur le bouton ci-dessous.\n\nJ'ai besoin de la permission administrateur pour certaines de mes fonctionnalités, comme l'assignation de rôle automatique ou la purge de message",
					footer: {
						text: "Attention, je refuse de rejoindre un serveur sans la permission administrateur"
					},
					color: EpsibotColor.info
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: "Lien d'invitation",
							url: link
						}
					]
				}
			],
			ephemeral: true
		});
	}
}
