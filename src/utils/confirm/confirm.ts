import {
	ButtonInteraction,
	ColorResolvable,
	CommandInteraction,
	InteractionReplyOptions,
	Message
} from "discord.js";

enum ButtonAction {
	yes = "yes",
	no = "no"
}

/**
 * Send a confirmation message with buttons
 * @param interaction The interaction that triggered this confirmation
 * @param options Options for the message sent
 * @returns true if the user confirmed, false otherwise, and null if the
 * timeout is reached
 */
export async function confirm(
	interaction: CommandInteraction<"cached">,
	options: {
		/**
		 * Description of the message sent
		 */
		description: string,
		/**
		 * Color of the message sent
		 */
		color?: ColorResolvable,
		/**
		 * User that will be able to click on the buttons<br>
		 * Will use the interaction user by default
		 */
		userId?: string,
		/**
		 * Label to put on the yes button
		 */
		labelYes?: string,
		/**
		 * Label to put on the no button
		 */
		labelNo?: string,
		/**
		 * Time in seconds to wait for an answer
		 */
		timeout?: number,
		/**
		 * Set this if you want to return a default value after
		 * a timeout instead of null
		 */
		returnOnTimout?: boolean,
		/**
		 * Should the message be hidden?
		 */
		ephemeral?: boolean
	}
): Promise<boolean | null> {
	const {
		description,
		color,
		userId = interaction.member.id,
		labelYes = "Oui",
		labelNo = "Non",
		timeout = 60_000,
		returnOnTimout = null,
		ephemeral = true
	} = options;

	if (ephemeral && userId !== interaction.member.id) {
		throw Error("You can't set a confirm message as ephemeral if you want this user to see it!");
	}

	const isFollowUp = interaction.deferred || interaction.replied;

	const messageContent: InteractionReplyOptions = {
		embeds: [{
			description: description,
			color: color
		}],
		components: [{
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				label: labelYes,
				style: "SUCCESS",
				customId: ButtonAction.yes
			}, {
				type: "BUTTON",
				label: labelNo,
				style: "DANGER",
				customId: ButtonAction.no
			}]
		}]
	};

	let messageConfirm: Message<true>;

	if (isFollowUp) {
		messageConfirm = await interaction.followUp(messageContent);
	} else {
		messageConfirm = await interaction.reply({
			...messageContent,
			fetchReply: true
		});
	}

	let answer: boolean | null;
	let click: ButtonInteraction<"cached"> | undefined = undefined;

	try {
		click = await messageConfirm.awaitMessageComponent({
			componentType: "BUTTON",
			filter: click => click.member.id === userId,
			time: timeout
		});
		answer = click.customId === ButtonAction.yes;
		await click.deferUpdate();
	} catch (err) {
		answer = returnOnTimout;
	}

	if (answer === null) {
		await messageConfirm.edit({
			components: []
		});
	} else {
		await messageConfirm.edit({
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					label: answer ? "Oui" : "Non",
					style: answer ? "SUCCESS" : "DANGER",
					customId: answer ? ButtonAction.yes : ButtonAction.no,
					disabled: true
				}]
			}]
		});
	}

	return answer;
}
