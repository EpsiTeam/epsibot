import {Client, GuildMember} from "discord.js"

const eventLoader = (
	client: Client,
	log: (t: string, s: string | Error) => void,
	serverLog: Map<string, string>
) => {
	return (member: GuildMember) => {
		const channelID = serverLog.get(member.guild.id)
		if (!channelID) return
		const channel = client.channels.resolve(channelID)
		if (!channel || !channel.isText()) return
	
		channel.send({
			embed: {
				title: "Un membre est parti",
				thumbnail: {
					url: member.user?.displayAvatarURL()
				},
				description: `${member} a quitté le serveur`,
				color: "RED"
			}
		}).catch(e => log("ERROR", e))
	}
}

export default eventLoader
