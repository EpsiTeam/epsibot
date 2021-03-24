import {Command} from "epsicommands/built/types"
import EpsibotParams from "../types/epsibotParams"
import epsimpleembed from "epsimpleembed"

const cmd: Command<EpsibotParams> = {
	name: "prefix",

	help(pre) {
		return {
			short: "Change le prefix",
			long: "Permet de changer le prefix d'Epsibot sur ce serveur",
			usage:
`\`${pre}prefix <new_prefix>\`
\`${pre}prefix ;\` => Change le prefix en \`;\` (c'est moche ne faites pas ça)`
		}
	},

	adminOnly: true,

	async execute({msg, args, prefix}, {db, log, serverPrefix, config}) {
		if (!msg.guild) return // This shouldn't happen

		let newPrefix = args.join(" ")

		if (newPrefix === prefix) {
			return msg.channel.send(epsimpleembed("ceci est déjà le prefix actuel de ce serveur", msg.author.id, "YELLOW"))
		}

		let server = msg.guild.id

		// Returning to base prefix
		if (newPrefix === config.prefix) {
			serverPrefix.delete(server)

			await db("ServerPrefix").delete().where({
				ServerID: server
			})
		// Going from base prefix to a new one
		} else if (prefix === config.prefix) {
			serverPrefix.set(server, newPrefix)

			await db("ServerPrefix").insert({
				ServerID: server,
				Prefix: newPrefix
			})
		// Changing from a special prefix to another one
		} else {
			serverPrefix.set(server, newPrefix)

			await db("ServerPrefix").update({
				Prefix: newPrefix
			}).where({
				ServerID: server
			})
		}

		log("PREFIX", `Changing prefix to ${newPrefix} for server ${server}`)

		return msg.channel.send(epsimpleembed(
			`le prefix a été changé, fais \`${newPrefix}help\` pour tester`,
			msg.author.id,
			"GREEN"
		))
	}
}

export default cmd
