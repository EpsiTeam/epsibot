import {Command} from "epsicommands/built/types"
import EpsibotParams from "../../types/epsibotParams"
import epsimpleembed from "epsimpleembed"
import epsilist from "epsilist"
import {MessageEmbed} from "discord.js"

const elmtByPage = 3
const cmdWidth = 10
const responseWidth = 23
const maxResponseWidth = 9 * responseWidth

const cmd: Command<EpsibotParams> = {
	name: "list",

	alias: ["l"],

	help(pre) {
		return {
			short: "Liste les commandes personnalisées",
			long: "Permet de lister toutes les commandes personnalisées de ce serveur",
			usage: `\`${pre}command\``
		}
	},

	execute({msg}, {log, serverCommand}) {
		if (!msg.guild) return Promise.resolve() // Shouldn't happen

		let commands = serverCommand.get(msg.guild.id)

		if (!commands || !commands.length) {
			return msg.channel.send(epsimpleembed(
				"il n'y a aucune commande personnalisée sur ce serveur",
				msg.author.id,
				"YELLOW"
			))
		}

		let header = ["Commande", "Réponse", "Admin", "Delete"]
		let data = []
		for (const command of commands) {
			let response = command.response.replace(/\n/g, "\\n")

			if (response.length > maxResponseWidth) {
				response = response.substring(0, maxResponseWidth - 3)
				response += "..."
			}
			
			data.push([
				command.name,
				response,
				command.adminOnly ? "Oui" : "Non",
				command.autoDelete ? "Oui" : "Non"
			])
		}

		let embedMsg = new MessageEmbed()
		embedMsg.setColor("BLUE")
		embedMsg.setTitle("Commandes personnalisées de ce serveur")

		let tableConfig = {
			columns: {
				0: {
					width: cmdWidth
				},
				1: {
					width: responseWidth
				}
			}
		}

		return epsilist({
			data,
			originMsg: msg,
			log,
			embedMsg,
			header,
			tableConfig,
			elmtByPage
		})
	}
}

export default cmd
