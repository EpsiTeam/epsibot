import { MigrationInterface, QueryRunner } from "typeorm";

export class customCommandRole1670548402860 implements MigrationInterface {
	name = "customCommandRole1670548402860";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// CustomCommand
		await queryRunner.query(`
			CREATE TABLE "tmp_custom_command" (
				"guildId" varchar NOT NULL,
				"name" varchar NOT NULL,
				"response" varchar NOT NULL,
				"roleNeeded" varchar NOT NULL,
				"autoDelete" boolean NOT NULL,
				PRIMARY KEY ("guildId", "name")
			)
		`);
		await queryRunner.query(`
			INSERT INTO "tmp_custom_command" (
				"guildId",
				"name",
				"response",
				"roleNeeded",
				"autoDelete"
			) SELECT
				"guildId",
				"name",
				"response",
				'',
				"autoDelete"
			FROM "custom_command"
		`);
		await queryRunner.query(`
			DROP TABLE "custom_command"
		`);
		await queryRunner.query(`
			ALTER TABLE "tmp_custom_command"
			RENAME TO "custom_command"
		`);

		// CustomEmbedCommand
		await queryRunner.query(`
			CREATE TABLE "tmp_custom_embed_command" (
				"guildId" varchar NOT NULL,
				"name" varchar NOT NULL,
				"title" varchar NOT NULL,
				"description" varchar NOT NULL,
				"image" varchar NOT NULL,
				"color" integer NOT NULL,
				"roleNeeded" varchar NOT NULL,
				"autoDelete" boolean NOT NULL,
				PRIMARY KEY ("guildId", "name")
			)
		`);
		await queryRunner.query(`
			INSERT INTO "tmp_custom_embed_command" (
				"guildId",
				"name",
				"title",
				"description",
				"image",
				"color",
				"roleNeeded",
				"autoDelete"
			) SELECT
				"guildId",
				"name",
				"title",
				"description",
				"image",
				"color",
				'',
				"autoDelete"
			FROM "custom_embed_command"
		`);
		await queryRunner.query(`
			DROP TABLE "custom_embed_command"
		`);
		await queryRunner.query(`
			ALTER TABLE "tmp_custom_embed_command"
			RENAME TO "custom_embed_command"
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// CustomCommand
		await queryRunner.query(`
			CREATE TABLE "tmp_custom_command" (
				"guildId" varchar NOT NULL,
				"name" varchar NOT NULL,
				"response" varchar NOT NULL,
				"adminOnly" boolean NOT NULL,
				"autoDelete" boolean NOT NULL,
				PRIMARY KEY ("guildId", "name")
			)
		`);
		await queryRunner.query(`
			INSERT INTO "tmp_custom_command" (
				"guildId",
				"name",
				"response",
				"adminOnly",
				"autoDelete"
			) SELECT
				"guildId",
				"name",
				"response",
				0,
				"autoDelete"
			FROM "custom_command"
		`);
		await queryRunner.query(`
			DROP TABLE "custom_command"
		`);
		await queryRunner.query(`
			ALTER TABLE "tmp_custom_command"
			RENAME TO "custom_command"
		`);

		// CustomEmbedCommand
		await queryRunner.query(`
			CREATE TABLE "tmp_custom_embed_command" (
				"guildId" varchar NOT NULL,
				"name" varchar NOT NULL,
				"title" varchar NOT NULL,
				"description" varchar NOT NULL,
				"image" varchar NOT NULL,
				"color" integer NOT NULL,
				"adminOnly" boolean NOT NULL,
				"autoDelete" boolean NOT NULL,
				PRIMARY KEY ("guildId", "name")
			)
		`);
		await queryRunner.query(`
			INSERT INTO "tmp_custom_embed_command" (
				"guildId",
				"name",
				"title",
				"description",
				"image",
				"color",
				"adminOnly",
				"autoDelete"
			) SELECT
				"guildId",
				"name",
				"title",
				"description",
				"image",
				"color",
				'0,
				"autoDelete"
			FROM "custom_embed_command"
		`);
		await queryRunner.query(`
			DROP TABLE "custom_embed_command"
		`);
		await queryRunner.query(`
			ALTER TABLE "tmp_custom_embed_command"
			RENAME TO "custom_embed_command"
		`);
	}
}
