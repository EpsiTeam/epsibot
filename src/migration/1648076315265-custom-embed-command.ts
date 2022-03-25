import { MigrationInterface, QueryRunner } from "typeorm";

export class customEmbedCommand1648076315265 implements MigrationInterface {
	name = "customEmbedCommand1648076315265";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"custom_embed_command\" (\"guildId\" varchar NOT NULL, \"name\" text(50) NOT NULL, \"title\" text(256) NOT NULL, \"description\" text(4096) NOT NULL, \"image\" varchar, \"color\" integer NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP TABLE \"custom_embed_command\"");
	}

}
