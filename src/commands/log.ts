import {Command} from "epsicommands/built/types";
import EpsibotParams from "../epsibotParams";
import epsimpleembed from "epsimpleembed";
import epsiconfirm from "epsiconfirm";

const cmd: Command<EpsibotParams> = {
	name: "log",
	
	help(pre) {
		return {
			short: "Active les logs de ce serveur",
			long: "Active les logs de ce serveur dans le channel courant",
			usage: `${pre}log`
		}
	},

	alias: ["logs"],

	adminOnly: true,

	async execute({msg, args}, {db, log, serverLog}) {
		if (!msg.guild)
			return; // This shouldn't happen

		if (args[0] === "off") {
			if (!serverLog.delete(msg.guild.id)) {
				return msg.channel.send(epsimpleembed("les logs n'était déjà pas activés sur ce serveur", msg.author.id, "YELLOW"));
			}

			await db.delete().from("ServerLog").where({
				ServerID: msg.guild.id
			});

			return msg.channel.send(epsimpleembed("les logs de ce serveur sont désormais désactivés", msg.author.id, "GREEN"));
		}

		let oldChannel = serverLog.get(msg.guild.id)
		if (oldChannel) {
			let overwrite = await epsiconfirm({
				originMsg: msg,
				log,
				color: "YELLOW",
				desc: `Ce serveur a déjà les logs activés dans le channel <#${oldChannel}>, voulez vous le remplacer par le channel actuel ?`
			});

			if (!overwrite) return;
		}

		serverLog.set(msg.guild.id, msg.channel.id);

		if (oldChannel) {
			await db.update({
				ChannelID: msg.channel.id
			}).from("ServerLog").where({
				ServerID: msg.guild.id
			});
		} else {
			await db.insert({
				ServerID: msg.guild.id,
				ChannelID: msg.channel.id
			}).into("ServerLog");
		}

		log("LOG", `Logs activated for server ${msg.guild.id} in channel ${msg.channel.id}`);

		return msg.channel.send(epsimpleembed("les logs sont activés dans ce channel", msg.author.id, "GREEN"));
	}
}

export default cmd;
