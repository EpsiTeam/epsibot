// DB configuration
const config = {
	client: 'sqlite3',
	connection: {
		filename: './db.sqlite3'
	},
	useNullAsDefault: true
};

module.exports = config;
