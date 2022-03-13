import {Client, Message, PartialMessage} from "discord.js"

const eventLoader = (
	client: Client,
	log: (t: string, m: string | Error) => void,
	serverLog: Map<string, string>
) => {
	return (oldMsg: Message | PartialMessage, msg: Message | PartialMessage) => {
		if (!msg.author || !msg.guild) return
		if (msg.author.bot) return

		if (oldMsg.content === msg.content) return

		const channelID = serverLog.get(msg.guild.id)
		if (!channelID) return
		const channel = client.channels.resolve(channelID)
		if (!channel || !channel.isText()) return

		channel.send({
			embed: {
				title: "Message modifié",
				thumbnail: {
					url: msg.author.displayAvatarURL()
				},
				description: `${msg.member} a modifié son message dans ${msg.channel}:\n\n__Avant:__\n${oldMsg.content}\n\n__Après:__\n${msg.content}`,
				color: "BLUE"
			}
		}).catch(e => log("ERROR", e))
	}
}

export default eventLoader
