import {Command} from "epsicommands/built/types";
import EpsibotParams from "../epsibotParams";
import epsimpleembed from "epsimpleembed";
import epsiconfirm from "epsiconfirm";

const cmd: Command<EpsibotParams> = {
	name: "reboot",
	
	help(pre) {
		return {
			short: "Reboot le bot",
			long: "Epsibot fait des siennes, et vous pensez qu'un reboot pourrait suffire à le remettre d'applomb ? Cette commande est faites pour vous!",
			usage: `\`${pre}reboot`
		}
	},

	alias: ["restart"],

	ownerOnly: true,

	async execute({msg}, {log}) {
		const confirm = await epsiconfirm({
			originMsg: msg,
			log,
			title: "Voulez-vous vraiment reboot Epsibot ?",
			desc: "Reboot de cette manière n'est pas super propre, car le processus de node ne sera plus attaché au terminal (par de ctrl-C possible). Pour kill le bot après un reboot, il faut soit utiliser la commande `!kill`, soit chercher le PID du processus (`ps`) puis le tuer (`kill <pid>`)",
			color: "YELLOW",
			timeout: 60000,
			timeoutResponse: false
		});

		if (!confirm) return;

		log("REBOOT", `${msg.member?.displayName} rebooted the bot`);

		return msg.channel.send(epsimpleembed("Le reboot est lancé", null, "GREEN")).catch(err => {
			log("REBOOT", `Impossible to send message, but rebooting anyway: ${err}`);
		}).then(() => reboot());
	}
}

const reboot = () => {
	const proc = require("child_process");

	proc.fork("built/index.js", {
		detached: false,
		stdio: "inherit"
	});

	process.exit();
};

export default cmd;
