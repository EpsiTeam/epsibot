const epsimpleembed = require("epsimpleembed");

module.exports = {
	alias: ["isowner"],

	help(pre) {
		return {
			short: "Êtes vous un owner d'Epsibot",
			long: "Vérifiez avec cette commande si vous êtes un owner",
			usage: `\`${pre}am_i_an_owner\``
		};
	},

	ownerOnly: true,

	execute({msg}) {
		return msg.channel.send(epsimpleembed("C'est oui !"));
	}
}