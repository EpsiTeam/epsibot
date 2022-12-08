import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";

export async function getCommandFromName(
	guildId: string,
	name: string
): Promise<CustomCommand | CustomEmbedCommand | null> {
	const [command, embedCommand] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findOneBy({
			guildId: guildId,
			name
		}),
		DBConnection.getRepository(CustomEmbedCommand).findOneBy({
			guildId: guildId,
			name
		})
	]);

	return command ?? embedCommand;
}

export async function deleteCommandFromName(guildId: string, name: string) {
	return Promise.all([
		DBConnection.getRepository(CustomCommand).delete({
			name,
			guildId: guildId
		}),
		DBConnection.getRepository(CustomEmbedCommand).delete({
			name,
			guildId: guildId
		})
	]);
}
