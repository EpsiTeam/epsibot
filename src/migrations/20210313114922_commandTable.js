exports.up = function(knex) {
	return knex.schema
		.createTable("ServerCommand", table => {
			table.string("ServerID");
			table.string("CommandName", 2000);
			table.boolean("AdminOnly")
				.defaultTo(0);
			table.boolean("AutoDelete")
				.defaultTo(0);
			table.string("CommandResponse")
				.notNullable();

			table.primary(["ServerID", "CommandName"]);
		});
};

exports.down = function(knex) {
	return knex.schema
		.dropTable("ServerCommand");
};
