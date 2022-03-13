import {Command} from "epsicommands/built/types"
import EpsibotParams from "../types/epsibotParams"
import epsimpleembed from "epsimpleembed"
import {DMChannel, Message} from "discord.js"

const cmd: Command<EpsibotParams> = {
	name: "purge",

	help(pre) {
		return {
			short: "Purge des messages",
			long: "Purge les n derniers messages dans le salon actuel",
			usage:
`\`${pre}purge 10\` => purge les 10 derniers messages du salon
\`${pre}purge 5 @user\` => purge les 5 derniers messages de @user dans ce salon
\`${pre}purge @user 5\` => purge les 5 derniers messages de @user dans ce salon`
		}
	},

	adminOnly: true,

	async execute({msg, args, prefix}, {log, deletedMsgToIgnore}) {
		const usage = `\n\n__Utilisation:__:\n${this.help(prefix).usage}`
		const channel = msg.channel

		if (channel instanceof DMChannel)
			return Promise.resolve() // No purge on delete

		if (!args.length) {
			return channel.bulkDelete(2)
		}

		if (args.length > 2) {
			return epsimpleembed(
				"il y a trop d'arguments" + usage,
				msg.author.id,
				"RED"
			)
		}

		if (args.length === 1) {
			// Purging a number of messages
			let nbToDel = parseInt(args[0], 10)
			if (isNaN(nbToDel)) {
				return channel.send(epsimpleembed(
					"le premier argument doit être un nombre" + usage,
					msg.author.id,
					"RED"
				))
			}

			nbToDel++ // Because there is also the !purge to delete

			log("PURGE", `Purging ${nbToDel} messages in channel ${channel.id}`)

			while (nbToDel > 0) {
				let currentDel = Math.min(nbToDel, 100)
				let msgsToDel = await channel.messages.fetch({
					limit: currentDel
				})
				
				if (msgsToDel.size === 0) {
					// Not found anything? Nothing left to purge then
					break;
				} else if (msgsToDel.size === 1) {
					// If there is only one message to delete,
					// we don't want to use bulkDelete as this will
					// trigger the event messageDeleted
					let msgToDel = msgsToDel.first() as Message
					deletedMsgToIgnore.add(msgToDel.id)
					await msgToDel.delete()
				} else {
					await channel.bulkDelete(currentDel)
				}
				
				nbToDel -= currentDel
			}

			log("PURGE", "Purge finished")
		} else {
			// Purging a user

			// Finding where is the number
			const nbParsed = args.map(e => parseInt(e, 10))
			const indexNb = nbParsed.findIndex(e => !isNaN(e));

			if (indexNb === -1) {
				return msg.channel.send(epsimpleembed(
					"je n'ai pas trouvé de nombre dans ta commande" + usage,
					msg.author.id,
					"RED"
				))
			}

			const nbToPurge = nbParsed[indexNb];

			if (nbToPurge < 1) {
				return msg.channel.send(epsimpleembed(
					"le nombre de messages à purger doit être positif",
					msg.author.id,
					"RED"
				))
			}

			// Getting the user to purge
			const userToPurge = msg.mentions.users.first()
			let usernameToPurge: string
			let idToPurge: string
			if (!userToPurge) {
				// Try to get it from string
				const userSearch = args[(indexNb === 0 ? 1 : 0)]
				const members = await msg.guild?.members.fetch({
					query: userSearch,
					limit: 1
				})
				const member = members?.first()

				if (!member) {
					return msg.channel.send(epsimpleembed(
						`je n'ai pas réussi à trouver l'utilisateur ${userSearch}${usage}`,
						msg.author.id,
						"RED"
					))
				}

				idToPurge = member.id
				usernameToPurge = member.displayName
			} else {
				idToPurge = userToPurge.id
				usernameToPurge = userToPurge.username
			}

			log("PURGE", `Trying to purge ${nbToPurge} messages from ${usernameToPurge} in channel ${channel.id}`)
	
			// Deleting the called command
			deletedMsgToIgnore.add(msg.id)
			await msg.delete()
	
			// Getting last messages of this channel
			let lastMessages = await channel.messages.fetch({
				limit: 100
			})
	
			lastMessages = lastMessages.filter(m => m.author.id === idToPurge)
			let msgToDelete = lastMessages.array().slice(0, nbToPurge)

			if (msgToDelete.length === 1) {
				deletedMsgToIgnore.add(msgToDelete[0].id)
				await msgToDelete[0].delete()
			} else {
				await channel.bulkDelete(msgToDelete)
			}
			
			log("PURGE", `${msgToDelete.length} messages from ${usernameToPurge} purged`)
		}
	}
}

export default cmd
