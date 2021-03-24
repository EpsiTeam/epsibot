import {Message} from "discord.js"
import {Config} from "../config"
import EpsibotParams, {CustomCommand} from "../types/epsibotParams"
import commandLoader from "epsicommands"
import {Commands} from "epsicommands/built/types"
import {Knex} from "knex"

interface NewMessageParams {
	commands: Commands<EpsibotParams>
	basePrefix: string
	log: (t: string, m: string | Error) => void
	db: Knex
	config: Config
	serverPrefix: Map<string, string>
	serverCommand: Map<string, CustomCommand[]>
	serverLog: Map<string, string>
	serverAutorole: Map<string, string>
	deletedMsgToIgnore: Set<string>
}

const eventLoader = ({
	commands,
	basePrefix,
	log,
	db,
	config,
	serverPrefix,
	serverCommand,
	serverLog,
	serverAutorole,
	deletedMsgToIgnore
}: NewMessageParams) => {
	// Loading commands and creating getCommand function
	const getCommand = commandLoader(commands, config.owners, log)

	return (msg: Message) => {
		// We don't care about bots
		if (msg.author.bot) return

		// We don't care about DMs
		if (!msg.guild || !msg.member) return

		// Getting prefix for this server
		let prefix = serverPrefix.get(msg.guild.id) ?? basePrefix

		// Retrieve message content
		let content = msg.content

		// Checking if it's a command
		if (content.startsWith(prefix + " ")) {
			content = content.slice(prefix.length + 1)
		} else if (content.startsWith(prefix)) {
			content = content.slice(prefix.length)
		} else {
			// If this is not a command, we GET THE FUCK OUTTA HERE
			return
		}

		// Splitting arguments
		let args = content.toLowerCase().split(/ +/)
		let baseArgs = content.split(/ +/)
		const firstArg = args[0]

		log("COMMAND", `"${msg.content}" called by ${msg.member.displayName}`)

		let {command} = getCommand(args)

		// This command does not exist
		if (!command) {
			// Maybe there is a custom command for this server?
			const customCommands = serverCommand.get(msg.guild.id)
			// No custom command
			if (!customCommands) return

			command = customCommands.find(cmd => cmd.name === firstArg)

			// There is a custom command for this server, but not this one
			if (!command) return
		}

		let canBeExecuted =
			// owner => free pass
			config.owners.includes(msg.author.id) || (
				// ownerOnly => no pass
				!command.ownerOnly && (
					// not adminOnly => pass
					!command.adminOnly ||
					// adminOnly + admin perm => pass
					msg.member.hasPermission("ADMINISTRATOR")
				)
			)

		if (!canBeExecuted) {
			return
		}
		const executable = command
		executable.execute({
			msg,
			args,
			baseArgs,
			prefix
		}, {
			db,
			log,
			deletedMsgToIgnore,
			config,
			serverPrefix,
			serverCommand,
			serverLog,
			serverAutorole
		}).then(() => {
			if (executable.autoDelete) {
				deletedMsgToIgnore.add(msg.id)
				return msg.delete()
			}
			return
		}).catch(err => log("ERROR", err))
	}
}

export default eventLoader
