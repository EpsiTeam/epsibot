import {Client, Message} from "discord.js"

const eventLoader = (
	client: Client,
	log: (t: string, m: string | Error) => void,
	serverLog: Map<string, string>,
	deletedMsgToIgnore: Set<string>
) => {
	return (msg: Message) => {
		if (!msg.author || !msg.guild) return
		if (msg.author.bot) return

		if (deletedMsgToIgnore.has(msg.id)) {
			deletedMsgToIgnore.delete(msg.id)
			return
		}

		const channelID = serverLog.get(msg.guild.id)
		if (!channelID) return
		const channel = client.channels.resolve(channelID)
		if (!channel || !channel.isText()) return

		let msgAttachment = ""
		const firstAttachment = msg.attachments.first()
		if (firstAttachment) {
			msgAttachment = `\n__Ce message contenait un fichier:__ ${firstAttachment.url}`
		}
		
		channel.send({
			embed: {
				title: "Message supprimé",
				thumbnail: {
					url: msg.author.displayAvatarURL()
				},
				description: `Un message de ${msg.member} a été supprimé dans ${msg.channel}:\n\n${msg.content}${msgAttachment}`,
				color: "ORANGE"
			}
		}).catch(e => log("ERROR", e))
	}
}

export default eventLoader
