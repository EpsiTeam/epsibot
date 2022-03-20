import { MigrationInterface, QueryRunner } from "typeorm";

export class autoDelete1647793194627 implements MigrationInterface {
	name = "autoDelete1647793194627";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"temporary_custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"temporary_custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\" FROM \"custom_command\"");
		await queryRunner.query("DROP TABLE \"custom_command\"");
		await queryRunner.query("ALTER TABLE \"temporary_custom_command\" RENAME TO \"custom_command\"");
		await queryRunner.query("UPDATE \"custom_command\" SET \"autoDelete\" = ?", ["0"]);
		await queryRunner.query("CREATE TABLE \"temporary_custom_command\" (\"guildId\" varchar NOT NULL, \"name\" text(50) NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"temporary_custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"custom_command\"");
		await queryRunner.query("DROP TABLE \"custom_command\"");
		await queryRunner.query("ALTER TABLE \"temporary_custom_command\" RENAME TO \"custom_command\"");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE \"custom_command\" RENAME TO \"temporary_custom_command\"");
		await queryRunner.query("CREATE TABLE \"custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\", \"autoDelete\" FROM \"temporary_custom_command\"");
		await queryRunner.query("DROP TABLE \"temporary_custom_command\"");
		await queryRunner.query("ALTER TABLE \"custom_command\" RENAME TO \"temporary_custom_command\"");
		await queryRunner.query("CREATE TABLE \"custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
		await queryRunner.query("INSERT INTO \"custom_command\"(\"guildId\", \"name\", \"response\", \"adminOnly\") SELECT \"guildId\", \"name\", \"response\", \"adminOnly\" FROM \"temporary_custom_command\"");
		await queryRunner.query("DROP TABLE \"temporary_custom_command\"");
	}

}
