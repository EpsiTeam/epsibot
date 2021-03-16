const epsimpleembed = require("epsimpleembed");

module.exports = {
	help(pre) {
		return {
			short: "Tue le bot",
			long: "Epsibot a acquéri une conscience et vous avez besoin d'un moyen rapide de le mettre à terre ? Cette commande est faite pour ça",
			usage: `\`${pre}kill\` -> le bot mourra`
		};
	},

	ownerOnly: true,

	execute({msg, log}) {
		log("KILL", `${msg.member.displayName} killed the bot!`);

		return msg.channel.send(epsimpleembed("Au revoir, monde cruel...", null, "RED")).then(() => {
			process.exit();
		}).catch(err => {
			log("KILL", `Impossible to send message but killing anyway: ${err}`);
			process.exit();
		});
	}
}
