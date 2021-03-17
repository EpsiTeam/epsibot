// External modules
const Discord = require("discord.js");

// Load config
const config = require("./config.json");
// Create log function
const log = require("epsilogging")(config.development, config.logTypeWidth, config.logMsgWidth);
// Create db function
const db = require("knex")(require("./knexfile"));
// serverID => prefix
const serverPrefix = new Map();
// serverID => (commandName => commandObj)
const serverCommand = new Map();
// deleted messages that we don't want to be logged
const deletedMsgToIgnore = new Set();
// serverID => channelID
const serverLog = new Map();

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
const getCommand = require("epsicommands")(require("./commands"), config.owners, log);

// Bot status
const basePrefix = config.prefix;
const status = {
	activity: {
		type: "PLAYING",
		name: `v${process.env.npm_package_version} | ${basePrefix}help`
	}
};
if (!process.env.npm_package_version)
	log("STARTUP", "There is no npm version, are you sure you started epsibot with 'npm start' and not 'node index.js'?");

// Bot instance
const bot = new Discord.Client({presence: status});

require("./utils/startupSelection")({
	db,
	log,
	serverPrefix,
	serverCommand,
	serverLog
}).then(() => {
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
	let prefix = serverPrefix.get(msg.guild.id) || basePrefix;

	// Retrieve message content
	let content = msg.content;

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
	let args = content.toLowerCase().split(/ +/);
	let baseArgs = content.split(/ +/);
	const firstArg = args[0];

	log("COMMAND", `"${msg.content}" called by ${msg.member.displayName}`);

	let {command} = getCommand(args);

	// This command does not exist
	if (!command) {
		// Maybe there is a custom command for this server?
		const customCommands = serverCommand.get(msg.guild.id);
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
		config.owners.includes(msg.author.id) || (
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

	command.execute({
		msg,
		args,
		baseArgs,
		prefix,
		db,
		log,
		serverPrefix,
		serverCommand,
		deletedMsgToIgnore,
		serverLog
	}).then(() => {
		if (command.autoDelete) {
			deletedMsgToIgnore.add(msg.id);
			return msg.delete();
		}
	}).catch(err => log("ERROR", err));
});

bot.on("rateLimit", rateLimit => {
	log("RATE LIMIT", `For ${rateLimit.timeout}ms | Limit: ${rateLimit.limit} | ${rateLimit.route}`);
});

bot.on("guildMemberAdd", member => {
	const channelID = serverLog.get(msg.guild.id);
	if (!channelID) return;
	const channel = bot.channels.resolve(channelID);
	if (!channel) return;

	channel.send({
		embed: {
			title: "Nouveau membre",
			thumbnail: {
				url: member.user.displayAvatarURL()
			},
			description: `${member} est arrivé sur le serveur`,
			color: "GREEN"
		}
	}).catch(e => log("ERROR", e));
})

bot.on("guildMemberRemove", member => {
	const channelID = serverLog.get(msg.guild.id);
	if (!channelID) return;
	const channel = bot.channels.resolve(channelID);
	if (!channel) return;

	channel.send({
		embed: {
			title: "Un membre est parti",
			thumbnail: {
				url: member.user.displayAvatarURL()
			},
			description: `${member} a quitté le serveur`,
			color: "RED"
		}
	}).catch(e => log("ERROR", e));
})

bot.on("messageUpdate", (oldMsg, msg) => {
	if (msg.author.bot) return;

	const channelID = serverLog.get(msg.guild.id);
	if (!channelID) return;
	const channel = bot.channels.resolve(channelID);
	if (!channel) return;

	channel.send({
		embed: {
			title: "Message modifié",
			thumbnail: {
				url: msg.author.displayAvatarURL()
			},
			description: `${msg.member} a modifié son message dans ${msg.channel}:\n\n__Avant:__\n${oldMsg.content}\n\n__Après:__\n${msg.content}`,
			color: "BLUE"
		}
	}).catch(e => log("ERROR", e));
})

bot.on("messageDelete", msg => {
	if (msg.author.bot) return;

	if (deletedMsgToIgnore.has(msg.id)) {
		deletedMsgToIgnore.delete(msg.id);
		return;
	}

	const channelID = serverLog.get(msg.guild.id);
	if (!channelID) return;
	const channel = bot.channels.resolve(channelID);
	if (!channel) return;

	let msgAttachment = "";
	if (msg.attachments.size > 0) {
		msgAttachment = `\n__Ce message contenait un fichier:__ ${msg.attachments.first().url}`
	}
	
	channel.send({
		embed: {
			title: "Message supprimé",
			thumbnail: {
				url: msg.author.displayAvatarURL()
			},
			description: `Un message de ${msg.member} a été supprimé dans ${msg.channel}:\n\n${msg.content}${msgAttachment}`,
			color: "ORANGE"
		}
	}).catch(e => log("ERROR", e));
})
