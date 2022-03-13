// External modules
import {Client, PresenceData} from "discord.js"
import knex from "knex"
import logLoader from "epsilogging"

// Internal modules
import {CustomCommand} from "./types/epsibotParams"
import configLoader from "./config"
import credential from "./credential.json"
import commands from "./commands"
import startupSelection from "./utils/startupSelection"

// Events to listen to
import onMessageLoader from "./events/onNewMessage"
import onMessageDeleteLoader from "./events/onMessageDelete"
import onMessageUpdateLoader from "./events/onMessageUpdate"
import onRateLimitLoader from "./events/onRateLimit"
import onGuildMemberAddLoader from "./events/onMemberJoin"
import onGuildMemberRemoveLoader from "./events/onMemberLeave"
import onGuildCreateLoader from "./events/onServerJoin"
import onGuildDeleteLoader from "./events/onServerLeave"

// Get config
const env = process.env.NODE_ENV || "development"
const config = configLoader(env)
// Create log function
const log = logLoader(env === "development", config.logTypeWidth, config.logMsgWidth)
// Create db function
const dbConfig = require("../knexfile")
const db = knex(dbConfig)

// serverID => prefix
const serverPrefix = new Map<string, string>()
// serverID => customCommand[]
const serverCommand = new Map<string, CustomCommand[]>()
// deleted messages that we don't want to be logged
const deletedMsgToIgnore = new Set<string>()
// serverID => channelID
const serverLog = new Map<string, string>()
// serverID => roleID
const serverAutorole = new Map<string, string>()

if (!process.env.npm_package_version)
	log("STARTUP", "There is no npm version, are you sure you started epsibot with 'npm start' and not 'node index.js'?")

log("STARTUP", `Epsibot v${process.env.npm_package_version} - ${env === "development" ? "DEV" : "PROD"}`)

// Bot status
const basePrefix = config.prefix
const status: PresenceData = {
	activity: {
		type: "PLAYING",
		name: `v${process.env.npm_package_version} | ${basePrefix}help`
	}
}

// Bot instance
const bot = new Client({presence: status})

// Initialize bot properties from DB
startupSelection({
	db,
	log,
	serverPrefix,
	serverCommand,
	serverLog,
	serverAutorole
}).then(success => {
	const nbSuccess = success.filter(e => e).length
	const nbFailed = success.filter(e => !e).length
	log("STARTUP", `Selections finished (${nbSuccess} success, ${nbFailed} fails), logging to discord`)
	bot.login(credential.token)
})


bot.on("ready", () => {
	log("STARTUP", `Logged as ${bot.user?.tag} in ${bot.guilds.cache.size} servers`)

	log("STARTED", "Configuration finished, ready to received messages")
})

const onMessage = onMessageLoader({
	basePrefix, commands, config,
	db, deletedMsgToIgnore, log,
	serverAutorole, serverCommand,
	serverLog, serverPrefix
})
bot.on("message", onMessage)

const onMessageDelete = onMessageDeleteLoader(bot, log, serverLog, deletedMsgToIgnore)
bot.on("messageDelete", onMessageDelete)

const onMessageUpdate = onMessageUpdateLoader(bot, log, serverLog)
bot.on("messageUpdate", onMessageUpdate)

const onRateLimit = onRateLimitLoader(log)
bot.on("rateLimit", onRateLimit)

const onGuildMemberAdd = onGuildMemberAddLoader(bot, log, serverAutorole, serverLog)
bot.on("guildMemberAdd", onGuildMemberAdd)

const onGuildMemberRemove = onGuildMemberRemoveLoader(bot, log, serverLog)
bot.on("guildMemberRemove", onGuildMemberRemove)

const onGuildCreate = onGuildCreateLoader(log)
bot.on("guildCreate", onGuildCreate)

const onGuildDelete = onGuildDeleteLoader(log)
bot.on("guildDelete", onGuildDelete)
