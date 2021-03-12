const epsimpleembed = require("epsimpleembed");

module.exports = {
	help(pre) {
		return {
			short: "Purge des messages",
			long: "Purge les n derniers messages dans le salon actuel",
			usage: `\`${pre}purge 10\` => purge les 10 derniers messages du salon\n\`${pre}purge 5 @user\` => purge les 5 derniers messages de @user dans ce salon\n\`${pre}purge @user 5\` => purge les 5 derniers messages de @user dans ce salon`
		};
	},

	adminOnly: true,

	async execute(msg, args, prefix) {
		const usage = `\n\n__Utilisation:__:\n${this.help(prefix).usage}`;

		if (!args.length) {
			return msg.channel.bulkDelete(2);
		}

		if (args.length === 1) {
			let nbToDel = parseInt(args[0], 10);
			if (isNaN(nbToDel)) {
				return msg.channel.send(epsimpleembed("le premier argument doit être un nombre" + usage, msg.author.id, "RED"))
			}

			nbToDel++; // Because there is also the !purge to delete

			log("PURGE", `Purging ${nbToDel} messages in channel ${msg.channel.id}`);

			while (nbToDel > 100) {
				await msg.channel.bulkDelete(100);
				nbToDel -= 100;
			}

			await msg.channel.bulkDelete(nbToDel);

			log("PURGE", "Purge finished");
		} else {

			const userToPurge = msg.mentions.users.first();
			const nbParsed = args.map(e => parseInt(e, 10));
			const nbToPurge = nbParsed.find(e => !isNaN(e));
	
			if (!userToPurge || !nbToPurge) {
				return msg.channel.send(epsimpleembed("mauvaise utilisation de la commande" + usage, msg.author.id, "RED"));
			}

			log("PURGE", `Trying to purge ${nbToPurge} messages from ${userToPurge.username}`);
	
			// Deleting the called command
			await msg.delete();
	
			// Getting last messages of this channel
			let lastMessages = await msg.channel.messages.fetch({
				limit: 100
			});
	
			lastMessages = lastMessages.filter(m => m.author.id === userToPurge.id);
			msgToDelete = lastMessages.array().slice(0, nbToPurge);

			await msg.channel.bulkDelete(msgToDelete);
	
			log("PURGE", `${msgToDelete.length} messages from ${userToPurge.username} purged`);
		}
	}
}