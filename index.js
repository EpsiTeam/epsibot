// External modules
const Discord = require("discord.js");
const knex = require("knex");

// Load config
const config = require("./config.json");
const dbConfig = require("./knexfile");
// Create log function
global.log = require("epsilogging")(config.development, 13, 55);
// Create db function
global.db = knex(dbConfig);
// Global properties, accessible everywhere in the code
global.properties = {
	// ServerID => Prefix
	serverPrefix: new Map(),
	// ServerID => (CommandName => commandObj)
	serverCommand: new Map()
};

log("STARTUP", `Epsibot v${process.env.npm_package_version} - ${config.development ? "DEV" : "PROD"}`);

// Load token
let token;
try {
	const credential = require("./credential.json");
	token = credential.token;
} catch (err) {
	log("STARTUP ERROR", "It looks like there is no credential.json file (or it's malformed). Copy the file credential_example.json, rename it and put the bot token in it");
	process.exit();
}

// Loading commands and creating getCommand function
const basePrefix = config.prefix;
const getCommand = require("epsicommands")(require("./commands"), config.owners, log);

// Bot status
const status = {
	activity: {
		type: "PLAYING",
		name: `v${process.env.npm_package_version} | ${basePrefix}help`
	}
};
// Bot instance
global.bot = new Discord.Client({presence: status});

require("./utils/startupSelection")().then(() => {
	log("STARTUP", "Startup selections finished, logging to discord");
	bot.login(token);
});

bot.on("ready", () => {
	log("STARTUP", `Logged as ${bot.user.tag} in ${bot.guilds.cache.size} servers`);

	log("STARTED", "Configuration finished, ready to received messages");
});

bot.on("message", msg => {
	// We don't care about bots
	if (msg.author.bot)
		return;

	// We don't care about DMs
	if (!msg.guild)
		return;
	
	// Getting prefix for this server
	let prefix = properties.serverPrefix.get(msg.guild.id) || basePrefix;

	// Retrieve message content
	let content = msg.content.toLowerCase();

	// Checking if it's a command
	if (content.startsWith(prefix + " ")) {
		content = content.slice(prefix.length + 1);
	} else if (content.startsWith(prefix)) {
		content = content.slice(prefix.length);
	} else {
		// If this is not a command, we GET THE FUCK OUTTA HERE
		return;
	}

	// Splitting arguments
	let args = content.split(/ +/);
	let firstArg = args[0];

	const id = msg.author.id;

	log("COMMAND", `"${msg.content}" called by ${msg.member.displayName}`);

	let {command} = getCommand(args);

	// This command does not exist
	if (!command) {
		// Maybe there is a custom command for this server?
		const customCommands = properties.serverCommand.get(msg.guild.id);
		// No custom command
		if (!customCommands) {
			return;
		}
		
		command = customCommands.get(firstArg);

		// There is a custom command for this server, but not this one
		if (!command) {
			return;
		}
	}

	let canBeExecuted =
		// owner => free pass
		config.owners.includes(id) || (
			// ownerOnly => no pass
			!command.ownerOnly && (
				// not adminOnly => pass
				!command.adminOnly ||
				// adminOnly + admin perm => pass
				msg.member.hasPermission("ADMINISTRATOR")
			)
		);

	if (!canBeExecuted) {
		return;
	}

	command.execute(msg, args, prefix).then(() => {
		if (command.autoDelete) {
			return msg.delete();
		}
	}).catch(err => log("ERROR", err));
});

bot.on("rateLimit", rateLimit => {
	log("WARN", `Rate limited for ${rateLimit.timeout}ms | Limit: ${rateLimit.limit} | Request: ${rateLimit.route}`);
});