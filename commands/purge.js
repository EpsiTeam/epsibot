const epsimpleembed = require("epsimpleembed");

module.exports = {
	help(pre) {
		return {
			short: "Purge des messages",
			long: "Purge les n derniers messages dans le salon actuel",
			usage: `\`${pre}purge 10\` => purge les 10 derniers messages du salon\n\`${pre}purge 5 @user\` => purge les 5 derniers messages de @user dans ce salon`
		};
	},

	adminOnly: true,

	async execute(msg, args, prefix) {
		let usage = `\n\n__Utilisation:__:\n${this.help(prefix).usage}`;

		if (!args.length) {
			return msg.channel.bulkDelete(2);
		}

		if (args.length === 1) {
			let nbToDel = parseInt(args[0]);
			if (isNaN(nbToDel)) {
				return msg.channel.send(epsimpleembed("le premier argument doit être un nombre" + usage, msg.author.id, "RED"))
			}

			nbToDel++; // Because there is also the !purge to delete

			while (nbToDel > 100) {
				await msg.channel.bulkDelete(100);
				nbToDel -= 100;
			}

			return msg.channel.bulkDelete(nbToDel);
		}

		return msg.channel.send(epsimpleembed("ceci n'est pas encore implémenté", msg.author.id, "YELLOW"));
	}
}