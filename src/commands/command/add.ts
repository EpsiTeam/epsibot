import {Command} from "epsicommands/built/types"
import EpsibotParams from "../../types/epsibotParams"
import epsimpleembed from "epsimpleembed"
import epsiconfirm from "epsiconfirm"
import customCommand from "./customCommand"

const maxCharacters = 90

const cmd: Command<EpsibotParams> = {
	name: "add",

	alias: ["a"],

	help(pre) {
		return {
			short: "Ajoute une commande personnalisée",
			long: "Permet d'ajouter une commande personnalisée sur ce serveur",
			usage: `\`${pre}command add <commande> <commandeResponse>\`\n\`${pre}command add test Ceci est un test\` => Créé la commande \`${pre}test\` qui répond \`Ceci est un test\`\n\`${pre}command add bloup blop\` => Créé la commande \`${pre}bloup\` qui répond \`blop\``
		}
	},

	adminOnly: true,

	async execute({msg, args, prefix}, {db, log, serverCommand}) {
		if (!msg.guild)
			return

		if (args.length < 2) {
			return msg.channel.send(epsimpleembed(
				"il faut indiquer le nom de la commande personnalisée et sa réponse !\n\n__Utilisation:__\n" + this.help(prefix).usage,
				msg.author.id,
				"RED"
			))
		}

		const cmdName = args[0]

		if (cmdName.length > maxCharacters)
			return msg.channel.send(epsimpleembed(
				`le nom de la commande est trop long (${maxCharacters} caractères maximum)`,
				msg.author.id,
				"RED"
			))

		const title = `Ajout de la commande !${cmdName}`
		const server = msg.guild.id

		// Check if this command already exist (maybe overwrite it)
		let commands = serverCommand.get(server)
		let overwrite: boolean | null = false
		// index of the command to overwrite
		const cmdToOverwriteIndex =
			commands?.findIndex(cmd => cmd.name === cmdName) ?? -1
		
		if (cmdToOverwriteIndex !== -1) {
			overwrite = await epsiconfirm({
				originMsg: msg,
				log,
				title,
				desc: `${msg.author}, la commande \`${prefix}${cmdName}\` existe déjà, voulez vous la remplacer ?`,
				color: "YELLOW",
				timeoutResponse: null
			})

			if (overwrite === null) {
				return msg.channel.send(epsimpleembed(
					"pas de réponse, je prends ça pour un non",
					msg.author.id,
					"YELLOW"
				))
			}

			if (!overwrite) {
				return msg.channel.send(epsimpleembed(
					"je touche à rien alors !",
					msg.author.id,
					"GREEN"
				))
			}
		}

		// Get command response with correct capitalization
		// This break if the name of this command is changed,
		// or even if an alias is added,
		// but I didn't find any clear way from now
		let lowerCase = msg.content.toLowerCase().substr(prefix.length)
		let noSpace = lowerCase.replace(/ +/g, "")
		let startPos
		if (noSpace.startsWith("commandadd")) {
			startPos = lowerCase.indexOf("add ") + 4
		} else {
			startPos = lowerCase.indexOf("a ") + 2
		}
		startPos += prefix.length + lowerCase.substr(startPos).indexOf(cmdName) + cmdName.length + 1
		const cmdResponse = msg.content.substr(startPos)

		// Should this command be only for admins?
		let adminOnly = await epsiconfirm({
			originMsg: msg,
			log,
			title,
			desc: "Est-ce que cette commande est réservée aux admins ?",
			timeoutResponse: false
		})

		// Should this command auto delete the calling message?
		let autoDelete = await epsiconfirm({
			originMsg: msg,
			log,
			title,
			desc: "Est-ce que le message qui appelle la commande doit être supprimé automatiquement ?",
			timeoutResponse: false
		})

		// Inserting into DB
		if (overwrite) {
			await db("ServerCommand").update({
				AdminOnly: adminOnly,
				AutoDelete: autoDelete,
				CommandResponse: cmdResponse
			}).where({
				ServerID: server,
				CommandName: cmdName
			})
		} else {
			await db("ServerCommand").insert({
				ServerID: server,
				CommandName: cmdName,
				AdminOnly: adminOnly,
				AutoDelete: autoDelete,
				CommandResponse: cmdResponse
			})
		}

		// Updating maps
		if (!commands) {
			commands = []
			serverCommand.set(server, commands)
		}
		const newCommand = customCommand({
			name: cmdName,
			adminOnly,
			autoDelete,
			response: cmdResponse
		})
		if (overwrite) {
			commands[cmdToOverwriteIndex] = newCommand
			log("COMMAND A", `Overwrited command ${prefix}${cmdName} for server ${server}`)
		} else {
			commands.push(newCommand)
			log("COMMAND A", `Added command ${prefix}${cmdName} for server ${server}`)
		}

		return msg.channel.send(epsimpleembed(
`La commande \`${prefix}${cmdName}\` a été ajouté avec succès.

__Réponse de la commande:__ ${cmdResponse}
__Admin only:__ ${adminOnly ? "Oui" : "Non"}
__Auto delete:__ ${autoDelete ? "Oui" : "Non"}`, null, "GREEN"))
	}
}

export default cmd
