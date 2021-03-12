// --- DB SCHEMA ---
/* 
	ServerPrefix
		ServerID: string primary
		Prefix: string notNull
*/

// DB configuration
module.exports = {
	client: 'sqlite3',
	connection: {
		filename: './db.sqlite3'
	},
	useNullAsDefault: true
};
