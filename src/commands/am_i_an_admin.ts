import {Command} from "epsicommands/built/types"
import EpsibotParams from "../types/epsibotParams"
import epsimpleembed from "epsimpleembed"

const cmd: Command<EpsibotParams> = {
	name: "am_i_an_admin",

	alias: ["isadmin"],

	help(pre) {
		return {
			short: "Êtes vous un admin sur ce serveur",
			long: "Vérifiez avec cette commande si vous êtes un admin",
			usage: `\`${pre}am_i_an_admin\``
		}
	},

	adminOnly: true,

	execute({msg}) {
		return msg.channel.send(epsimpleembed("C'est oui !"))
	}
}

export default cmd
