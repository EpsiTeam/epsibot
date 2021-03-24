import {RateLimitData} from "discord.js"

const eventLoader = (log: (t: string, m: string | Error) => void) => {
	return (rl: RateLimitData) => {
		log("RATE LIMIT", `For ${rl.timeout}ms | Limit: ${rl.limit} | ${rl.route}`)
	}
}

export default eventLoader
