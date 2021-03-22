import customCommand from "../commands/command/customCommand";
import {CustomCommand} from "../epsibotParams";

interface SelectionParams {
	db: any,
	log: (t: string, m: string | Error) => void,
	serverPrefix: Map<string, string>,
	serverCommand: Map<string, CustomCommand[]>,
	serverLog: Map<string, string>
}

const startupSelection = ({
	db,
	log,
	serverPrefix,
	serverCommand,
	serverLog
}: SelectionParams) => {
	let selections = [
		db.select().from("ServerPrefix").then((lines: any[]) => {
			for (let line of lines) {
				serverPrefix.set(line.ServerID, line.Prefix);
			}
		
			log("STARTUP", `${lines.length} prefixes loaded`);
		}),

		db.select().from("ServerCommand").orderBy("ServerID").then((lines: any[]) => {
			// Ordered by ServerID so we can create or update the map
			for (let line of lines) {
				const server = line.ServerID;

				// Maybe there was already a map for this server
				let commands = serverCommand.get(server);
				if (!commands) {
					// Maybe not
					commands = [];
					serverCommand.set(server, commands);
				}

				commands.push(customCommand({
					name: line.CommandName,
					adminOnly: line.AdminOnly,
					autoDelete: line.AutoDelete,
					response: line.CommandResponse
				}));
			}

			log("STARTUP", `${lines.length} custom commands loaded`);
		}),

		db.select().from("ServerLog").then((lines: any[]) => {
			for (let line of lines) {
				serverLog.set(line.ServerID, line.ChannelID);
			}

			log("STARTUP", `${lines.length} channel logs loaded`);
		})
	];

	return Promise.all(selections).catch((err: Error) => {
		log("ERROR", err);
	});
}

export default startupSelection;
