import {Commands} from "epsicommands/built/types"
import EpsibotParams from "../types/epsibotParams"

import am_i_an_admin from "./am_i_an_admin"
import am_i_an_owner from "./am_i_an_owner"
import autorole from "./autorole"
import command from "./command"
import kill from "./kill"
import log from "./log"
import prefix from "./prefix"
import purge from "./purge"
import reboot from "./reboot"

const commands: Commands<EpsibotParams> = [
	am_i_an_admin,
	am_i_an_owner,
	autorole,
	command,
	kill,
	log,
	prefix,
	purge,
	reboot
]

export default commands
