const epsimpleembed = require("epsimpleembed");
const epsilist = require("epsilist")(log);

module.exports = {
	alias: ["l"],

	help(pre) {
		return {
			short: "Liste les commandes personnalisées",
			long: "Permet de lister toutes les commandes personnalisées de ce serveur",
			usage: `\`${pre}command\``
		};
	},

	execute(msg) {
		let commands = properties.serverCommand.get(msg.guild.id);

		if (!commands || !commands.size) {
			return msg.channel.send(epsimpleembed("il n'y a aucune commande personnalisée sur ce serveur", msg.author.id, "YELLOW"));
		}

		let header = ["Commande", "Réponse", "Admin", "Delete"];
		let data = [];
		for (let [name, command] of commands) {
			data.push([
				name,
				command.response,
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
				1: {
					width: 20,
					wrapWord: true
				}
			}
		}

		return epsilist({
			data,
			originMsg: msg
		}, {
			embedMsg,
			header,
			tableConfig
		})
	}
}