exports.up = function(knex) {
	return knex.schema
		.createTable("ServerAutorole", table => {

			table.string("ServerID")
				.primary()

			table.string("RoleID")
				.notNullable()
		})
}

exports.down = function(knex) {
	return knex.schema
		.dropTable("ServerAutorole")
}
