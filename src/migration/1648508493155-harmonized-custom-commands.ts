import { MigrationInterface, QueryRunner } from "typeorm";

export class harmonizedCustomCommands1648508493155
implements MigrationInterface {
	name = "harmonizedCustomCommands1648508493155";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"temporary_custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"temporary_custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"custom_command\"");
		await queryRunner.query("DROP TABLE \"custom_command\"");
		await queryRunner.query("ALTER TABLE \"temporary_custom_command\" RENAME TO \"custom_command\"");
		await queryRunner.query("CREATE TABLE \"temporary_custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" varchar NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"temporary_custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"custom_command\"");
		await queryRunner.query("DROP TABLE \"custom_command\"");
		await queryRunner.query("ALTER TABLE \"temporary_custom_command\" RENAME TO \"custom_command\"");
		await queryRunner.query("CREATE TABLE \"temporary_custom_embed_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"title\" varchar NOT NULL, \"description\" varchar NOT NULL, \"image\" varchar, \"color\" integer NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"temporary_custom_embed_command\"(\"guildId\", \"name\", \"title\", \"description\", \"image\", \"color\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"title\", \"description\", \"image\", \"color\", \"adminOnly\", \"autoDelete\" FROM \"custom_embed_command\"");
		await queryRunner.query("DROP TABLE \"custom_embed_command\"");
		await queryRunner.query("ALTER TABLE \"temporary_custom_embed_command\" RENAME TO \"custom_embed_command\"");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE \"custom_embed_command\" RENAME TO \"temporary_custom_embed_command\"");
		await queryRunner.query("CREATE TABLE \"custom_embed_command\" (\"guildId\" varchar NOT NULL, \"name\" text(50) NOT NULL, \"title\" text(256) NOT NULL, \"description\" text(4096) NOT NULL, \"image\" varchar, \"color\" integer NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"custom_embed_command\"(\"guildId\", \"name\", \"title\", \"description\", \"image\", \"color\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"title\", \"description\", \"image\", \"color\", \"adminOnly\", \"autoDelete\" FROM \"temporary_custom_embed_command\"");
		await queryRunner.query("DROP TABLE \"temporary_custom_embed_command\"");
		await queryRunner.query("ALTER TABLE \"custom_command\" RENAME TO \"temporary_custom_command\"");
		await queryRunner.query("CREATE TABLE \"custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"temporary_custom_command\"");
		await queryRunner.query("DROP TABLE \"temporary_custom_command\"");
		await queryRunner.query("ALTER TABLE \"custom_command\" RENAME TO \"temporary_custom_command\"");
		await queryRunner.query("CREATE TABLE \"custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"temporary_custom_command\"");
		await queryRunner.query("DROP TABLE \"temporary_custom_command\"");
	}

}
