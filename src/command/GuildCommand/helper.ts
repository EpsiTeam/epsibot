import { EmbedField, InteractionReplyOptions } from "discord.js";
import { CustomCommand } from "../../entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export const helpArgument = `

**Inutile de lire la suite de ce message si la commande ne doit pas contenir de paramètres**

Il est possible de spécifier des paramètres de commande avec \`$\` suivi du numéro de l'argument (la numérotation commence à 0)
__Exemple__:
Imaginons une commande \`!bonjour\` qui répond \`Bonjour $0\`
Faire la commande \`!bonjour Paul\` répondra \`Bonjour Paul\`
(\`$0\` sera remplacé par \`Paul\`)
Faire la commande \`!bonjour Paul Pierre Jacques\` répondra aussi \`Bonjour Paul\` (les paramètres en trop sont supprimés)

Pour mettre plusieurs mots dans un seul paramètre d'une commande, il faut entourer les mots de \`'\` ou \`"\`
__Exemple__:
Imaginons une commande \`!bonjour\` qui répond \`Bonjour $0, n'oubliez pas $1 !\`
Faire la commande  \`!bonjour 'à tous' "de boire de l'eau"\` affichera \`Bonjour à tous, n'oubliez pas de boire de l'eau\`
(\`$0\` sera remplacé par \`à tous\`, et \`$1\` sera remplacé par \`de boire de l'eau\`)`;

export function timeoutEmbed(name: string): InteractionReplyOptions {
	return {
		embeds: [
			{
				description: `Pas de réponse, création de la commande \`${name}\` annulée`,
				color: EpsibotColor.error
			}
		],
		ephemeral: false
	};
}

export function commandFields(
	command: CustomCommand | CustomEmbedCommand
): EmbedField[] {
	return [
		{
			name: "Pour admins seulement:",
			value: command.adminOnly ? "Oui" : "Non",
			inline: false
		},
		{
			name: "Supprime le message qui appelle la commande:",
			value: command.autoDelete ? "Oui" : "Non",
			inline: false
		}
	];
}
