import { MigrationInterface, QueryRunner } from "typeorm";

export class ChannelLog1647212280868 implements MigrationInterface {
	name = "ChannelLog1647212280868";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"channel_log\" (\"guildID\" varchar NOT NULL, \"logType\" varchar NOT NULL, \"channelID\" varchar NOT NULL, PRIMARY KEY (\"guildID\", \"logType\"))");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP TABLE \"channel_log\"");
	}

}
