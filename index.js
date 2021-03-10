// External modules
const Discord = require("discord.js");

const embed = require("epsimpleembed");
// Load config
const config = require("./config.json");
// Create log function
global.log = require("epsilogging")(config.development, 13, 55);

log("STARTUP", `Epsibot v${config.version}`);

// Load token
let token;
try {
	const credential = require("./credential.json");
	token = credential.token;
} catch (err) {
	log("STARTUP ERROR", "It looks like there is no credential.json file (or it's malformed). Copy the file credential_example.json, rename it and put the bot token in it");
	process.exit();
}

// Putting the prefix in the global scope
global.prefix = config.prefix;

// Loading commands and creating getCommand function
const getCommand = require("epsicommands")(require("./commands"), prefix, config.owners, log);

// Bot status
const status = {
	activity: {
		type: "WATCHING",
		name: `v${config.version} | ${prefix}help`
	}
};
// Bot instance
global.bot = new Discord.Client({presence: status});
bot.login(token);

bot.on("ready", () => {
	log("STARTUP", `Epsibot logged as "${bot.user.tag}" in ${bot.guilds.cache.size} servers`);

	log("STARTED", "Epsibot configuration finished, ready to read messages");
});

bot.on("message", msg => {
	// We don't care about bots
	if (msg.author.bot)
		return;

	// We don't care about DMs
	if (!msg.guild)
		return;

	// Retrieve message content
	let content = msg.content.toLowerCase();

	// Splitting arguments, retrieving command name
	let args = content.split(/ +/);

	const id = msg.author.id;
	const isOwner = config.owners.includes(id);

	let isCommand = false;

	// Checking if it is a command
	if (args[0].startsWith(prefix)) {
		args[0] = args[0].slice(prefix.length);
		isCommand = true;
	}

	// If this is not a command, we GET THE FUCK OUTTA HERE
	if (!isCommand) {
		return;
	}

	log("COMMAND", `"${msg.content}" called by ${msg.member.displayName}`);

	let {command} = getCommand(args);

	if (!isOwner && command.ownerOnly) {
		msg.channel.send(embed("tu n'as pas le droit de faire cette commande", id, "RED"))
		.catch(error => {
			log("ERROR", error);
		});
		return;
	}

	command.execute(msg, args).catch(err => log("ERROR", err));
});