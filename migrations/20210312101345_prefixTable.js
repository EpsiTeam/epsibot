exports.up = function(knex) {
	return knex.schema
		.createTable("ServerPrefix", table => {
			table.string("ServerID")
				.primary();
			table.string("Prefix")
				.notNullable();
		});
};

exports.down = function(knex) {
	return knex.schema
		.dropTable("ServerPrefix");
};
