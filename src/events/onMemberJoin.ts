import {Client, GuildMember} from "discord.js"

const eventLoader = (
	client: Client,
	log: (t: string, s: string | Error) => void,
	serverAutorole: Map<string, string>,
	serverLog: Map<string, string>
) => {
	return (member: GuildMember) => {
		// Add the autorole
		const autorole = serverAutorole.get(member.guild.id)
		if (autorole) {
			member.roles.add(autorole).then(() => {
				log("ROLE", `Added autorole for ${member.displayName}`)
			}).catch(e => log("ERROR", e))
		}

		const channelID = serverLog.get(member.guild.id)
		if (!channelID) return
		const channel = client.channels.resolve(channelID)
		if (!channel || !channel.isText()) return

		channel.send({
			embed: {
				title: "Nouveau membre",
				thumbnail: {
					url: member.user.displayAvatarURL()
				},
				description: `${member} est arrivé sur le serveur`,
				color: "GREEN"
			}
		}).catch(e => log("ERROR", e))
	}
}

export default eventLoader
