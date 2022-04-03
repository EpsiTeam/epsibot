import { MigrationInterface, QueryRunner } from "typeorm";

export class shifumiScore1648945753766 implements MigrationInterface {
	name = "shifumiScore1648945753766";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "shifumi_score" (
				"guildId" varchar NOT NULL,
				"userId" varchar NOT NULL,
				"win" integer NOT NULL,
				"lose" integer NOT NULL,
				"draw" integer NOT NULL,
				PRIMARY KEY ("guildId", "userId")
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DROP TABLE "shifumi_score"
		`);
	}

}
