import {CustomCommand} from "../../types/epsibotParams"

interface CustomCommandParams {
	name: string
	adminOnly: boolean
	autoDelete: boolean
	response: string
}

const customCommand = ({
	name,
	adminOnly,
	autoDelete,
	response 
}: CustomCommandParams) => {
	const cmd: CustomCommand = {
		name,
		adminOnly,
		autoDelete,
		response,

		help(pre) {
			return {
				short: `Commande ${name}`,
				long: this.response,
				usage: pre + name
			}
		},

		execute({msg, baseArgs}) {
			// Remove the command name from baseArgs
			baseArgs.shift()

			let resp = this.response
			let currentArg = 0
			let quotedArg = ""
			let quote = false

			while (baseArgs.length) {
				let arg = baseArgs.shift() as string

				// Manage quoted arguments
				// Start of a quoted argument
				if (!quote && arg.startsWith("\"")) {
					arg = arg.substr(1)
					quote = true
				}
				// End of a quoted argument
				if (quote && arg.endsWith("\"")) {
					arg = quotedArg + arg.slice(0, arg.length - 1)
					quote = false
					quotedArg = ""
				}
				// Middle of a quoted argument
				if (quote) {
					quotedArg += arg + " "
				}

				// The argument is malformed, we'll do our best to fix it
				if (!baseArgs.length && quote) {
					arg = quotedArg.slice(0, quotedArg.length - 1)
					quote = false
				}

				// Replace if one of those
				// - not a quoted argument
				// - quoted argument finished
				if (!quote) {
					// regex that search for $currentArg, but only
					// where there is not a number just after.
					// So when we search for $1, $10 is omited
					let reg = new RegExp(`\\$${currentArg}(?![0-9])`, "g")
					resp = resp.replace(reg, arg)
					currentArg++
				}
			}

			return msg.channel.send(resp)
		}
	}

	return cmd
}

export default customCommand
