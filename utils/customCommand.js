module.exports = ({
	adminOnly = false,
	autoDelete = false,
	response = ""
}) => {
	return {
		adminOnly,
		autoDelete,
		response,

		execute({msg, args}) {
			let resp = this.response;
			let currentArg = 0;
			let quotedArg = "";
			let quote = false;

			while (args.length) {
				let arg = args.shift();

				// Manage quoted arguments
				// Start of a quoted argument
				if (!quote && arg.startsWith("\"")) {
					arg = arg.substr(1);
					quote = true;
				}
				// End of a quoted argument
				if (quote && arg.endsWith("\"")) {
					arg = quotedArg + arg.slice(0, arg.length - 1);
					quote = false;
					quotedArg = "";
				}
				// Middle of a quoted argument
				if (quote) {
					quotedArg += arg + " ";
				}

				// The argument is malformed, we'll do our best to fix it
				if (!args.length && quote) {
					arg = quotedArg.slice(0, quotedArg.length - 1);
				}

				// Replace if one of those
				// - not a quoted argument
				// - quoted argument finished
				// - quoted argument not finished, but no more args
				if (!quotedArg || !args.length) {
					// regex that search for $currentArg, but only
					// where there is not a number just after.
					// So when we search for $1, $10 is omited
					let reg = new RegExp(`\\$${currentArg}(?![0-9])`, "g");
					resp = resp.replace(reg, arg);
					currentArg++;
				}
			}

			return msg.channel.send(resp);
		}
	}
};