// Import not used, but necessary for the declare module to work
import {knex} from 'knex';

// Declaring table interface for typed knex
declare module "knex/types/tables" {
	
	interface ServerPrefix {
		ServerID: string, // primary
		Prefix: string
	}

	interface ServerCommand {
		ServerID: string, // primary
		CommandName: string,
		AdminOnly: boolean, // default false
		AutoDelete: boolean, // default false
		CommandResponse: string
	}

	interface ServerLog {
		ServerID: string, // primary
		ChannelID: string
	}

	interface Tables {
		ServerPrefix: ServerPrefix,
		ServerCommand: ServerCommand,
		ServerLog: ServerLog
	}
}
