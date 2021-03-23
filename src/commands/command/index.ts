import {SubCommand} from "epsicommands/built/types";
import EpsibotParams from "../../epsibotParams";

import add from "./add";
import remove from "./remove";
import list from "./list";

const subcmd: SubCommand<EpsibotParams> = {
	name: "command",

	baseCommand: "list",

	category: "Commandes personnalisées",

	commands: [
		add,
		remove,
		list
	]
}

export default subcmd;
