const embed = require("epsimpleembed");

module.exports = {
	alias: ["owner"],

	help: {
		short: "Êtes vous un owner d'Epsibot",
		long: "Vérifiez avec cette commande si vous êtes un owner",
		usage: `${prefix}am_i_an_owner`
	},

	ownerOnly: true,

	execute(msg) {
		return msg.channel.send(embed("C'est oui !"));
	}
}