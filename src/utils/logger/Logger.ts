import chalk from "chalk";
import { format } from "date-fns";
import { Guild, User } from "discord.js";

enum LogLevel {
	error = "ERROR",
	warn  = "WARN ",
	done  = "DONE ",
	info  = "INFO ",
	debug = "DEBUG"
}

export class Logger {
	// Singleton
	static #instance?: Logger;

	private constructor(readonly dev: boolean) {}

	private static get instance() {
		this.check(this.#instance);
		return this.#instance;
	}

	/**
	 * Initialize the logger
	 * You wont be able to use the logger without initializing it
	 * @param isDev Are we logging for development purposes?
	 */
	static initialize(isDev: boolean) {
		this.#instance = new Logger(isDev);
	}

	/**
	 * Contextualize a logger, so you won't have to write the guild
	 * and the user when logging things
	 * @param guild Guild to use on next calls of logger function
	 * @param user User to use on next calls of logger function
	 */
	static contextualize(guild?: Guild, user?: User) {
		return new ContextualizedLogger(guild, user);
	}

	/**
	 * Log an error message
	 * @param message The message
	 * @param guild Guild associated to this log, if any
	 * @param user User associated to this log, if any
	 */
	static error(message: string, guild?: Guild, user?: User) {
		Logger.instance.log(LogLevel.error, message, guild, user);
	}

	/**
	 * Log a warning message
	 * @param message The message
	 * @param guild Guild associated to this log, if any
	 * @param user User associated to this log, if any
	 */
	static warn(message: string, guild?: Guild, user?: User) {
		Logger.instance.log(LogLevel.warn, message, guild, user);
	}

	/**
	 * Log a success message
	 * @param message The message
	 * @param guild Guild associated to this log, if any
	 * @param user User associated to this log, if any
	 */
	static done(message: string, guild?: Guild, user?: User) {
		Logger.instance.log(LogLevel.done, message, guild, user);
	}

	/**
	 * Log an info message
	 * @param message The message
	 * @param guild Guild associated to this log, if any
	 * @param user User associated to this log, if any
	 */
	static info(message: string, guild?: Guild, user?: User) {
		Logger.instance.log(LogLevel.info, message, guild, user);
	}

	/**
	 * Log a debug message
	 * @param message The message
	 * @param guild Guild associated to this log, if any
	 * @param user User associated to this log, if any
	 */
	static debug(message: string, guild?: Guild, user?: User) {
		Logger.instance.log(LogLevel.debug, message, guild, user);
	}

	private log(
		logLevel: LogLevel,
		message: string,
		guild?: Guild,
		user?: User
	) {
		const dev = this.dev ? "[DEV]" : "";
		const date = format(new Date(), "dd/MM HH:mm:ss");
		const guildName = guild ? guild.name : "";
		const userTag = user ? user.tag : "";

		this.colorLog(logLevel, dev, date, guildName, userTag, message);
	}

	private colorLog(
		logLevel: LogLevel,
		dev: string,
		date: string,
		guild: string,
		user: string,
		message: string
	) {
		let dateColor = chalk.white;
		let logLevelColor = chalk.white;
		const guildColor = chalk.cyan;
		const userColor = chalk.blue;
		let messageColor = chalk.white;

		switch (logLevel) {
			case LogLevel.error:
				dateColor = chalk.red;
				logLevelColor = chalk.red;
				messageColor = chalk.red;
				break;
			case LogLevel.warn:
				dateColor = chalk.yellow;
				logLevelColor = chalk.yellow;
				messageColor = chalk.yellow;
				break;
			case LogLevel.done:
				dateColor = chalk.green;
				logLevelColor = chalk.green;
				messageColor = chalk.green;
				break;
			case LogLevel.info:
				dateColor = chalk.gray;
				break;
			case LogLevel.debug: {
				const color = this.dev ? chalk.magenta : chalk.grey;
				dateColor = color;
				logLevelColor = color;
				messageColor = color;
				break;
			}
		}

		let line = "";
		if (dev) line += chalk.magenta(dev) + " ";
		line += dateColor(date) + " ";
		line += logLevelColor(logLevel) + " | ";
		if (guild) line += `[${guildColor(guild)}] `;
		if (user) line += `[${userColor(user)}] `;
		line += messageColor(message);

		console.log(line);
	}

	private static check(instance?: Logger): asserts instance {
		if (!instance) {
			throw Error("Logger was used before initializing it, you must first call Logger.initialize()");
		}
	}
}

class ContextualizedLogger {
	constructor(readonly guild?: Guild, readonly user?: User) {}

	error(message: string) {
		Logger.error(message, this.guild, this.user);
	}

	warn(message: string) {
		Logger.warn(message, this.guild, this.user);
	}

	done(message: string) {
		Logger.done(message, this.guild, this.user);
	}

	info(message: string) {
		Logger.info(message, this.guild, this.user);
	}

	debug(message: string) {
		Logger.debug(message, this.guild, this.user);
	}
}
