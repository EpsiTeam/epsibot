/**
 * Fill the arguments of a custom command
 * @param message The message that triggered the command,
 * without the command name
 * @param response The base response of the custom command
 * @returns The argument filled command response, ready to be sent
 */
export function fillArguments(message: string, response: string): string {
	const args = cleanArguments(message.trim().split(" "));
	let filledResponse = response;

	for (const [index, arg] of args.entries()) {
		// regex that search for $index, but only
		// where there is not a number just after.
		// So when we search for $1, $10 is omited
		const regex = new RegExp(`\\$${index}(?![0-9])`, "g");
		filledResponse = filledResponse.replace(regex, arg);
	}

	return filledResponse;
}

/**
 * Will clean arguments, meaning putting back together
 * quoted arguments and shit
 * @param args List of arguments
 */
export function cleanArguments(args: string[]) {
	const cleanedArgs: string[] = [];
	// Filling arguments, a little bit complicated
	// because there could be an argument
	// separated by spaces, but between ""
	while (args.length) {
		// Can't be undefined because we checked for the length just before
		let arg = args.shift() as string;

		// A quoted argument, damn it
		if (arg.startsWith("\"") || arg.startsWith("'")) {
			arg = findQuotedArgument(arg, args);
		}

		cleanedArgs.push(arg);
	}

	return cleanedArgs;
}

/**
 * Will find an return a quoted argument.
 * If you call `findQuotedArgument("'hey", ["comment", "ça", "va'", "other"])`
 * it will returns `"hey comment ça va"` and removes the first 3 elements
 * of the args
 * @param arg Start of the quoted argument
 * @param args Rest of the arguments
 */
export function findQuotedArgument(arg: string, args: string[]): string {
	const quoteChar = arg.charAt(0);
	let argument = arg.substring(1);

	// Already done, nice
	if (argument.endsWith(quoteChar)) {
		return argument.substring(0, argument.length - 1);
	}

	// Trying to find the end quote
	while (args.length) {
		const current = args.shift() as string;

		argument += " " + current;

		// Found it!
		if (argument.endsWith(quoteChar)) {
			return argument.substring(0, argument.length - 1);
		}
	}

	// No end quote? Well, we did what we could
	return argument;
}
