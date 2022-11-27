import { DataSource } from "typeorm";

export const DBConnection = new DataSource({
	type: "better-sqlite3",
	database: "data.db"
});
