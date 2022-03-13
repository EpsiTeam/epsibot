import {Guild} from "discord.js"

const eventLoader = (log: (t: string, m: string | Error) => void) => {
	return (server: Guild) => {
		log("INVITED", `Epsibot has joined a new server: ${server.name}`)
	}
}

export default eventLoader
