const customCommand = require("./customCommand");

module.exports = ({
	db,
	log,
	serverPrefix,
	serverCommand
}) => {
	let selections = [
		db.select().from("ServerPrefix").then(lines => {
			for (let line of lines) {
				serverPrefix.set(line.ServerID, line.Prefix);
			}
		
			log("STARTUP", `${lines.length} prefixes loaded`);
		}).catch(err => {
			log("ERROR", err);
		}),

		db.select().from("ServerCommand").orderBy("ServerID").then(lines => {
			// Ordered by ServerID so we can create or update the map
			for (let line of lines) {
				const server = line.ServerID;

				// Maybe there was already a map for this server
				let commands = serverCommand.get(server);
				if (!commands) {
					// Maybe not
					commands = new Map();
					serverCommand.set(server, commands);
				}

				commands.set(line.CommandName, customCommand({
					adminOnly: line.AdminOnly,
					autoDelete: line.AutoDelete,
					response: line.CommandResponse
				}));
			}

			log("STARTUP", `${lines.length} custom commands loaded`);
		}).catch(err => {
			log("ERROR", err);
		})
	];

	return Promise.all(selections);
}
