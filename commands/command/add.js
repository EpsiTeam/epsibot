const epsimpleembed = require("epsimpleembed");
const epsiconfirm = require("epsiconfirm");

module.exports = {
	alias: ["a"],

	help(pre) {
		return {
			short: "Ajoute une commande personnalisée",
			long: "Permet d'ajouter une commande personnalisée sur ce serveur",
			usage: `\`${pre}command add <commande> <commandeResponse>\`\n\`${pre}command add test Ceci est un test\` => Créé la commande \`${pre}test\` qui répond \`Ceci est un test\`\n\`${pre}command add bloup blop\` => Créé la commande \`${pre}bloup\` qui répond \`blop\``
		};
	},

	adminOnly: true,

	async execute({msg, args, prefix, db, log, serverCommand}) {
		if (args.length < 2) {
			return msg.channel.send(epsimpleembed("il faut indiquer le nom de la commande personnalisée et sa réponse !\n\n__Utilisation:__\n" + this.help(prefix).usage));
		}

		const cmdName = args[0];
		let title = `Ajout de la commande !${cmdName}`;
		const server = msg.guild.id;

		// Check if this command already exist (maybe overwrite it)
		let commands = serverCommand.get(server);
		let overwrite = false;
		if (commands && commands.has(cmdName)) {
			overwrite = await epsiconfirm({
				originMsg: msg,
				log,
				title,
				desc: `${msg.author}, la commande \`${prefix}${cmdName}\` existe déjà, voulez vous la remplacer ?`,
				color: "YELLOW"
			});

			if (overwrite === undefined) {
				return msg.channel.send(epsimpleembed("pas de réponse, je prends ça pour un non", msg.author.id, "YELLOW"));
			}

			if (!overwrite) {
				return msg.channel.send(epsimpleembed("je touche à rien alors !", msg.author.id, "GREEN"));
			}
		}

		// Get command response with correct capitalization
		// This break if the name of this command is changed,
		// or even if an alias is added,
		// but I didn't find any clear way from now
		let lowerCase = msg.content.toLowerCase().substr(prefix.length);
		let noSpace = lowerCase.replace(/ +/g, "");
		let startPos;
		if (noSpace.startsWith("commandadd")) {
			startPos = lowerCase.indexOf("add ") + 4;
		} else {
			startPos = lowerCase.indexOf("a ") + 2;
		}
		startPos += prefix.length + lowerCase.substr(startPos).indexOf(cmdName) + cmdName.length + 1;
		const cmdResponse = msg.content.substr(startPos);

		// Should this command be only for admins?
		let adminOnly = await epsiconfirm({
			originMsg: msg,
			log,
			title,
			desc: "Est-ce que cette commande est réservée aux admins ?",
			timeoutResponse: false
		});

		// Should this command auto delete the calling message?
		let autoDelete = await epsiconfirm({
			originMsg: msg,
			log,
			title,
			desc: "Est-ce que le message qui appelle la commande doit être supprimé automatiquement ?",
			timeoutResponse: false
		});

		// Inserting into DB
		if (!overwrite) {
			await db.insert({
				ServerId: server,
				CommandName: cmdName,
				AdminOnly: adminOnly,
				AutoDelete: autoDelete,
				CommandResponse: cmdResponse
			}).into("ServerCommand");
		} else {
			await db.update({
				AdminOnly: adminOnly,
				AutoDelete: autoDelete,
				CommandResponse: cmdResponse
			}).from("ServerCommand").where({
				ServerID: server,
				CommandName: cmdName
			});
		}

		// Updating maps
		if (!commands) {
			commands = new Map();
			serverCommand.set(server, commands);
		}
		commands.set(cmdName, {
			adminOnly,
			autoDelete,
			response: cmdResponse,
			execute({msg, args}) {
				let argResponse = this.response;
				for (let i = 0; i < 5; i++) {
					argResponse = argResponse.replace(`$${i}`, args[i]);
				}

				return msg.channel.send(argResponse);
			}
		});

		log("COMMAND A", `Added command ${prefix}${cmdName} for server ${server}`);

		return msg.channel.send(epsimpleembed(`La commande \`${prefix}${cmdName}\` a été ajouté avec succès.\n\n__Réponse de la commande:__ ${cmdResponse}\n__Admin only:__ ${adminOnly ? "Oui" : "Non"}\n__Auto delete:__ ${autoDelete ? "Oui" : "Non"}`));
	}
}