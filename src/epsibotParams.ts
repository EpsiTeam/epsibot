import {Command} from "epsicommands/built/types";
import {Config} from "./config";

interface EpsibotParams {
	db: any,
	log: (t: string, m: string | Error) => void,
	serverPrefix: Map<string, string>,
	serverCommand: Map<string, CustomCommand[]>,
	deletedMsgToIgnore: Set<string>,
	serverLog: Map<string, string>,
	config: Config
}

interface CustomCommand extends Command<EpsibotParams> {
	response: string
}

export type {CustomCommand};
export default EpsibotParams;
