import { MigrationInterface, QueryRunner } from "typeorm";

export class customCommand1647704999833 implements MigrationInterface {
	name = "customCommand1647704999833";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"custom_command\" (\"guildId\" varchar NOT NULL, \"name\" varchar NOT NULL, \"response\" text(500) NOT NULL, \"adminOnly\" boolean NOT NULL, \"autoDelete\" boolean NOT NULL, PRIMARY KEY (\"guildId\", \"name\"))");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP TABLE \"custom_command\"");
	}

}
