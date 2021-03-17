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

	async execute({msg, args, prefix, log, deletedMsgToIgnore}) {
		const usage = `\n\n__Utilisation:__:\n${this.help(prefix).usage}`;
		const channel = msg.channel;

		if (!args.length) {
			return channel.bulkDelete(2);
		}

		if (args.length === 1) {
			let nbToDel = parseInt(args[0], 10);
			if (isNaN(nbToDel)) {
				return channel.send(epsimpleembed("le premier argument doit être un nombre" + usage, msg.author.id, "RED"))
			}

			nbToDel++; // Because there is also the !purge to delete
			//deletedMsgToIgnore.add(msg.id); // Don't want to log this

			log("PURGE", `Purging ${nbToDel} messages in channel ${channel.id}`);

			while (nbToDel > 0) {
				let currentDel = Math.min(nbToDel, 100);
				let msgToDel = await channel.messages.fetch({
					limit: currentDel
				});
				if (msgToDel.size === 1) {
					// If there is only onde message to delete,
					// we don't want to use bulkDelete as this will
					// trigger the event messageDeleted
					msgToDel = msgToDel.first()
					deletedMsgToIgnore.add(msgToDel.id);
					await msgToDel.delete();
				} else {
					await channel.bulkDelete(currentDel);
				}
				
				nbToDel -= currentDel;
			}

			log("PURGE", "Purge finished");
		} else {

			const userToPurge = msg.mentions.users.first();
			const nbParsed = args.map(e => parseInt(e, 10));
			const nbToPurge = nbParsed.find(e => !isNaN(e));
	
			if (!userToPurge || !nbToPurge) {
				return channel.send(epsimpleembed("mauvaise utilisation de la commande" + usage, msg.author.id, "RED"));
			}

			log("PURGE", `Trying to purge ${nbToPurge} messages from ${userToPurge.username} in channel ${channel.id}`);
	
			// Deleting the called command
			deletedMsgToIgnore.add(msg.id);
			await msg.delete();
	
			// Getting last messages of this channel
			let lastMessages = await channel.messages.fetch({
				limit: 100
			});
	
			lastMessages = lastMessages.filter(m => m.author.id === userToPurge.id);
			msgToDelete = lastMessages.array().slice(0, nbToPurge);

			if (msgToDelete.length === 1) {
				deletedMsgToIgnore.add(msgToDelete[0].id);
				await msgToDelete[0].delete();
			} else {
				await channel.bulkDelete(msgToDelete);
			}
			
			log("PURGE", `${msgToDelete.length} messages from ${userToPurge.username} purged`);
		}
	}
}
