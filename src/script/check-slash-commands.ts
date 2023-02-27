import { Routes } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { EnvVariable } from "../util/EnvVariable.js";
import { Logger } from "../util/Logger.js";
import {
	checkGlobalCommands,
	checkGuildCommands
} from "../util/slash-commands.ts/check-slash-commands.js";
import { getRest } from "../util/slash-commands.ts/get-rest.js";

Logger.initialize(!EnvVariable.production);

const manager = new CommandManager();
const names = manager.commandList.map((command) => command.name);
const nbCommands = names.length;
let expectedGlobal: string[] = [];
let expectedLocal: string[] = [];
let failed = false;

Logger.info(`Epsibot contains ${nbCommands} slash commands`);
Logger.info(names.join(", "));

if (EnvVariable.production) {
	Logger.info(
		"Currently in production mode, all slash commands should be registered globally"
	);
	expectedGlobal = names;
} else {
	Logger.info(
		`Currently in dev mode, all slash commands should be registered to guild ${EnvVariable.devGuildId}`
	);
	expectedLocal = names;
}

Logger.info("----------");
Logger.info("Checking global slash commands");

const globalNames = await checkGlobalCommands();

const globalLog = `Found ${globalNames.length} global slash commands, expected ${expectedGlobal.length}`;
if (globalNames.length === expectedGlobal.length) {
	Logger.done(globalLog);
} else {
	Logger.error(globalLog);
}

const shouldNotBeGlobal = globalNames
	.filter((g) => !expectedGlobal.includes(g))
	.join(", ");
if (shouldNotBeGlobal) {
	Logger.warn(
		`Those slash commands should not be registered globally: ${shouldNotBeGlobal}`
	);
	failed = true;
}

const shouldBeGlobal = expectedGlobal
	.filter((g) => !globalNames.includes(g))
	.join(", ");
if (shouldBeGlobal) {
	Logger.warn(
		`Those slash commands should be registered globally but are not: ${shouldBeGlobal}`
	);
	failed = true;
}

Logger.info("----------");
Logger.info("Checking local slash commands");

const rest = getRest();
const guilds = await rest.get(Routes.userGuilds());

if (!Array.isArray(guilds)) {
	throw new Error("Endpoint to get guilds dit not return an array");
}

const guildIds = guilds
	.map((guild) => {
		const id = guild?.id;
		if (typeof id !== "string") {
			Logger.warn("One of the guild seems to have no id");
			return null;
		}
		return id;
	})
	.filter((id): id is string => id !== null);

Logger.info(`Found ${guildIds.length} guilds connected to this client`);

for (const guildId of guildIds) {
	Logger.info("----------");
	Logger.info(`Checking guild ${guildId}`);

	const expected =
		guildId === EnvVariable.devGuildId ? expectedLocal.length : 0;

	const localNames = await checkGuildCommands(guildId);

	const localLog = `Found ${localNames.length} local slash command, expected ${expected}`;
	if (localNames.length === expected) {
		Logger.done(localLog);
	} else {
		Logger.error(localLog);
	}

	if (EnvVariable.production || guildId !== EnvVariable.devGuildId) {
		// prod mode or not the dev guild? definitely no command should be here
		if (localNames.length > 0) {
			Logger.warn(
				`Those slash commands should not be registered on guild ${guildId}: ${localNames.join(
					", "
				)}`
			);
			failed = true;
		}
	} else {
		// we should have commands here, still checking if there is not too much
		const shouldNotBeLocal = localNames
			.filter((l) => !expectedLocal.includes(l))
			.join(", ");
		if (shouldNotBeLocal) {
			Logger.warn(
				`Those slash commands should not be registered on guild ${guildId}: ${shouldNotBeLocal}`
			);
			failed = true;
		}

		const shouldBeLocal = expectedLocal
			.filter((l) => !localNames.includes(l))
			.join(", ");
		if (shouldBeLocal) {
			Logger.warn(
				`Those slash commands should be registered on guild ${guildId} but are not: ${shouldBeLocal}`
			);
			failed = true;
		}
	}
}

if (!failed) {
	Logger.done("All checks successful");
	Logger.info(
		"Keep in mind that this script only checks for slash command names, it won't detect if they are up to date or not"
	);
	Logger.info("If you're unsure you can use 'npm run cmd:register'");
} else {
	Logger.error(
		"All checks done, at least one of them failed, you need to either:"
	);
	Logger.error(
		"  - fix your environment variables to match where slash commands are registered"
	);
	Logger.error(
		"  - use 'npm run cmd:clear' to remove some slash commands from discord. Keep in mind that this script will clear local or global commands depending on your environment variables"
	);
}
