import { MigrationInterface, QueryRunner } from "typeorm";

export class queueElement1656247849048 implements MigrationInterface {
	name = "queueElement1656247849048";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "queue_element" (
				"id" varchar PRIMARY KEY NOT NULL,
				"guildId" varchar NOT NULL,
				"position" integer NOT NULL,
				"requester" varchar NOT NULL,
				"request" varchar NOT NULL,
				"hiddenInformation" varchar NOT NULL
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DROP TABLE "queue_element"
		`);
	}

}
