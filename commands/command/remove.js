const epsimpleembed = require("epsimpleembed");
const epsiconfirm = require("epsiconfirm")(log);

module.exports = {
	alias: ["r", "delete", "d"],

	help(pre) {
		return {
			short: "Retire une commande personnalisée",
			long: "Permet de retirer une commande personnalisée sur ce serveur",
			usage: `\`${pre}command remove <command>\`\n\`${pre}command remove test\` => retire la commande \`${pre}test\``
		};
	},

	adminOnly: true,

	async execute(msg, args, prefix) {
		const cmdToRemove = args[0];
		const server = msg.guild.id;
		const id = msg.author.id;

		if (!cmdToRemove) {
			return msg.channel.send(epsimpleembed("il faut me donner la commande à retirer pour que je puisse le faire", id, "RED"));
		}

		let serverCmd = properties.serverCommand.get(server);

		if (!serverCmd) {
			return msg.channel.send(epsimpleembed("il n'y a aucune commande personnalisée sur ce serveur", id, "RED"));
		}

		let command = serverCmd.get(cmdToRemove);

		if (!command) {
			return msg.channel.send(epsimpleembed(`la commande personnalisée \`${prefix}${cmdToRemove}\` n'existe pas`, id, "RED"));
		}

		// Deleting from maps
		serverCmd.delete(cmdToRemove);
		if (!serverCmd.size) {
			properties.serverCommand.delete(server);
		}

		// Deleting from DB
		await db.delete().from("ServerCommand").where({
			ServerID: server,
			CommandName: cmdToRemove
		});

		log("COMMAND D", `Deleted command ${cmdToRemove} from server ${server}`);

		return msg.channel.send(epsimpleembed(`la commande \`${prefix}${cmdToRemove}\` a été supprimée`, id, "GREEN"));
	}
}