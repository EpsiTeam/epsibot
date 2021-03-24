import {Command} from "epsicommands/built/types"
import {Knex} from "knex"
import {Config} from "../config"

interface EpsibotParams {
	db: Knex
	log: (t: string, m: string | Error) => void
	deletedMsgToIgnore: Set<string>
	config: Config
	serverPrefix: Map<string, string>
	serverCommand: Map<string, CustomCommand[]>
	serverLog: Map<string, string>
	serverAutorole: Map<string, string>
}

interface CustomCommand extends Command<EpsibotParams> {
	response: string
}

export type {CustomCommand}
export default EpsibotParams
