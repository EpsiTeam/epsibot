import {Command} from "epsicommands/built/types";

interface EpsibotParams {
	db: any,
	log: (t: string, m: string | Error) => void,
	serverPrefix: Map<string, string>,
	serverCommand: Map<string, CustomCommand[]>,
	deletedMsgToIgnore: Set<string>,
	serverLog: Map<string, string>
}

interface CustomCommand extends Command<EpsibotParams> {
	response: string
}

export type {CustomCommand};
export default EpsibotParams;
