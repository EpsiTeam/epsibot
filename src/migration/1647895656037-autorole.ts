import { MigrationInterface, QueryRunner } from "typeorm";

export class autorole1647895656037 implements MigrationInterface {
	name = "autorole1647895656037";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "auto_role" (
				"guildId" varchar PRIMARY KEY NOT NULL,
				"roleId" varchar NOT NULL
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DROP TABLE "auto_role"
		`);
	}

}
