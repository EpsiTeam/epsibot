exports.up = function(knex) {
	return knex.schema
		.createTable("ServerLog", table => {

			table.string("ServerID")
				.primary()

			table.string("ChannelID")
				.notNullable()
		})
}

exports.down = function(knex) {
	return knex.schema
		.dropTable("ServerLog")
}
