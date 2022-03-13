import {Guild} from "discord.js"

const eventLoader = (log: (t: string, m: string | Error) => void) => {
	return (server: Guild) => {
		log("REMOVED", `Epsibot has leaved the server ${server.name}`)
	}
}

export default eventLoader
