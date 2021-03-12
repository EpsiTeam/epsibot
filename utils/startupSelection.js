module.exports = log => {
	let selections = [];

	selections.push(
		db.select().from("ServerPrefix").then(lines => {
			for (line of lines) {
				properties.serverPrefix.set(line.ServerID, line.Prefix);
			}
		
			log("STARTUP", `${lines.length} prefixes loaded`);
		}).catch(err => {
			log("ERROR", err);
		})
	);

	return Promise.all(selections);
}