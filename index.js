// External modules
const Discord = require("discord.js");
const knex = require("knex");

const embed = require("epsimpleembed");
// Load config
const config = require("./config.json");
const dbConfig = require("./knexfile");
// Create log function
global.log = require("epsilogging")(config.development, 13, 55);
// Create db function
global.db = knex(dbConfig);
global.properties = {
	serverPrefix: new Map() // ServerID => Prefix
};

log("STARTUP", `Epsibot v${process.env.npm_package_version}`);

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

require("./utils/startupSelection")(log).then(() => {
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
	let isCommand = false;
	if (content.startsWith(prefix)) {
		content = content.slice(prefix.length);
		isCommand = true;
	} else if (content.startsWith(prefix + " ")) {
		content = content.slice(prefix.length + 1);
		isCommand = true;
	} else {
		// If this is not a command, we GET THE FUCK OUTTA HERE
		return;
	}

	// Splitting arguments
	let args = content.split(/ +/);

	const id = msg.author.id;

	log("COMMAND", `"${msg.content}" called by ${msg.member.displayName}`);

	let {command} = getCommand(args);

	// This command does not exist
	if (!command) {
		return;
	}

	let canBeExecuted =
		config.owners.includes(id) || ( // owner => free pass
			!command.ownerOnly && ( // ownerOnly => no pass
				!command.adminOnly || // not adminOnly => pass
				msg.member.hasPermission("ADMINISTRATOR") // adminOnly + admin perm => pass
			)
		);

	if (!canBeExecuted) {
		msg.channel.send(embed("tu n'as pas le droit de faire cette commande", id, "RED"))
		.catch(error => {
			log("ERROR", error);
		});
		return;
	}

	command.execute(msg, args, prefix).catch(err => log("ERROR", err));
});