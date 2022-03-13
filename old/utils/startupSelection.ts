import {Knex} from "knex"
import customCommand from "../commands/command/customCommand"
import {CustomCommand} from "../types/epsibotParams"

interface SelectionParams {
	db: Knex<any, unknown[]>
	log: (t: string, m: string | Error) => void
	serverPrefix: Map<string, string>
	serverCommand: Map<string, CustomCommand[]>
	serverLog: Map<string, string>
	serverAutorole: Map<string, string>
}

const startupSelection = ({
	db,
	log,
	serverPrefix,
	serverCommand,
	serverLog,
	serverAutorole
}: SelectionParams) => {
	const selections: Promise<[string, number]>[] = [
		db("ServerPrefix").select().then(lines => {
			for (let line of lines) {
				serverPrefix.set(line.ServerID, line.Prefix)
			}
			return ["prefixes", lines.length]
		}),

		db("ServerCommand").select().orderBy("ServerID").then(lines => {
			// Ordered by ServerID so we can create or update the map
			for (let line of lines) {
				const server = line.ServerID

				// Maybe there was already a map for this server
				let commands = serverCommand.get(server)
				if (!commands) {
					// Maybe not
					commands = []
					serverCommand.set(server, commands)
				}

				commands.push(customCommand({
					name: line.CommandName,
					adminOnly: line.AdminOnly,
					autoDelete: line.AutoDelete,
					response: line.CommandResponse
				}))
			}
			return ["custom commands", lines.length]
		}),

		db("ServerLog").select().then(lines => {
			for (let line of lines) {
				serverLog.set(line.ServerID, line.ChannelID)
			}
			return ["channel logs", lines.length]
		}),

		db("ServerAutorole").select().then(lines => {
			for (let line of lines) {
				serverAutorole.set(line.ServerID, line.RoleID)
			}
			return ["autoroles", lines.length]
		})
	]

	// Catch each selection
	const catchedSelections = selections.map(selection => {
		return selection.then(([type, nb]) => {
			log("STARTUP", `${nb} ${type} loaded`)
			return true
		}).catch((err: Error) => {
			log("ERROR", err)
			return false
		})
	})

	return Promise.all(catchedSelections)
}

export default startupSelection
