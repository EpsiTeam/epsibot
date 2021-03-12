const embed = require("epsimpleembed");

module.exports = {
	help(pre) {
		return {
			short: "Un court sous-test",
			long: "C'est juste une commande de sous-test pourquoi tu affiches son aide ??",
			usage: `\`${pre}subcmd subtest\``
		};
	},

	execute(msg) {
		return msg.channel.send(embed("Sous-test concluant"));
	}
}