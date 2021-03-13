module.exports = () => {
	let selections = [
		db.select().from("ServerPrefix").then(lines => {
			for (let line of lines) {
				properties.serverPrefix.set(line.ServerID, line.Prefix);
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
				let commands = properties.serverCommand.get(server);
				if (!commands) {
					// Maybe not
					commands = new Map();
					properties.serverCommand.set(server, commands);
				}

				commands.set(line.CommandName, {
					adminOnly: line.AdminOnly,
					autoDelete: line.AutoDelete,
					response: line.CommandResponse,
					execute(msg, args) {
						let argResponse = this.response;
						for (let i = 0; i < 5; i++) {
							argResponse = argResponse.replace(`$${i}`, args[i]);
						}

						return msg.channel.send(argResponse);
					}
				});
			}

			log("STARTUP", `${lines.length} custom commands loaded`);
		}).catch(err => {
			log("ERROR", err);
		})
	];

	return Promise.all(selections);
}