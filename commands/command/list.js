const epsimpleembed = require("epsimpleembed");
const epsilist = require("epsilist");

const elmtByPage = 3;
const cmdWidth = 10;
const responseWidth = 23;
const maxResponseWidth = 9 * responseWidth;

module.exports = {
	alias: ["l"],

	help(pre) {
		return {
			short: "Liste les commandes personnalisées",
			long: "Permet de lister toutes les commandes personnalisées de ce serveur",
			usage: `\`${pre}command\``
		};
	},

	execute({msg, log, serverCommand}) {
		let commands = serverCommand.get(msg.guild.id);

		if (!commands || !commands.size) {
			return msg.channel.send(epsimpleembed("il n'y a aucune commande personnalisée sur ce serveur", msg.author.id, "YELLOW"));
		}

		let header = ["Commande", "Réponse", "Admin", "Delete"];
		let data = [];
		for (let [name, command] of commands) {
			let response = command.response.replaceAll("\n", "\\n");

			if (response.length > maxResponseWidth) {
				response = response.substring(0, maxResponseWidth - 3);
				response += "...";
			}
			
			data.push([
				name,
				response,
				command.adminOnly ? "Oui" : "Non",
				command.autoDelete ? "Oui" : "Non"
			]);
		}

		let embedMsg = {
			color: "BLUE",
			title: "Commandes personnalisées de ce serveur"
		};

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