// --- DB SCHEMA ---
/* 
	ServerPrefix
		ServerID: string primary
		Prefix: string notNull

	ServerCommand
		ServerID: string primary
		CommandName: string primary
		AdminOnly: boolean default=0
		AutoDelete: boolean default=0
		CommandResponse: string notNull
*/

// DB configuration
module.exports = {
	client: 'sqlite3',
	connection: {
		filename: './db.sqlite3'
	},
	useNullAsDefault: true
};
