import { MigrationInterface, QueryRunner } from "typeorm";

export class ignoredChannel1647983769589 implements MigrationInterface {
	name = "ignoredChannel1647983769589";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "ignored_channel" (
				"guildId" varchar NOT NULL,
				"channelId" varchar NOT NULL,
				PRIMARY KEY ("guildId", "channelId")
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DROP TABLE "ignored_channel"
		`);
	}
}
