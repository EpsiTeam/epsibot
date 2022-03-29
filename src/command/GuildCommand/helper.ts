import { EmbedField, InteractionReplyOptions } from "discord.js";
import { CustomCommand } from "../../entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export function helpArgument(name: string) {
	return `

	Il est possible de spécifier des arguments avec \`$\` suivi du numéro de l'argument, la numérotation commence à 0
	__Exemple__: si la réponse de la commande est \`Bonjour $0\`, faire la commande \`${name} Paul\` répondra \`Bonjour Paul\`

	Pour mettre plusieurs mots dans un seul argument d'une commande, il faut entourer les mots de \`'\` ou \`"\`
	__Exemple__: si la réponse de la commande est \`Bojour $0 et $1\`, faire la commande  \`${name} "à tous" bienvenue\` affichera \`Bonjour à tous et bienvenue\``;
}

export function timeoutEmbed(name: string): InteractionReplyOptions {
	return {
		embeds: [{
			description: `Pas de réponse, création de la commande \`${name}\` annulée`,
			color: EpsibotColor.error
		}],
		ephemeral: false
	};
}

export function commandFields(
	command: CustomCommand | CustomEmbedCommand
): EmbedField[] {
	return [{
		name: "Pour admins seulement:",
		value: command.adminOnly ? "Oui" : "Non",
		inline: true
	}, {
		name: "Supprime le message qui appelle la commande:",
		value: command.autoDelete ? "Oui" : "Non",
		inline: true
	}];
}
