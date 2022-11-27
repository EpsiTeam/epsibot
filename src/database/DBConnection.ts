import "reflect-metadata";
import { DataSource } from "typeorm";

export const DBConnection = new DataSource({
	type: "better-sqlite3",
	database: "data.db",
	entities: ["built/database/entity/*.js"],
	migrations: ["built/database/migration/*.js"]
});
