import { MigrationInterface, QueryRunner } from "typeorm";

export class channelLog1647383021316 implements MigrationInterface {
	name = "channelLog1647383021316";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"channel_log\" (\"guildId\" varchar NOT NULL, \"logType\" varchar NOT NULL, \"channelId\" varchar NOT NULL, PRIMARY KEY (\"guildId\", \"logType\"))");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP TABLE \"channel_log\"");
	}

}
