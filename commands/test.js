const embed = require("epsimpleembed");

module.exports = {
	help: {
		short: "Un court test",
		long: "C'est juste une commande de test pourquoi tu affiches son aide ??",
		usage: `${prefix}test`
	},

	execute(msg) {
		return msg.channel.send(embed("Test concluant"));
	}
}