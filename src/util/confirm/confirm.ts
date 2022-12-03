import {
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	InteractionReplyOptions,
	Message
} from "discord.js";
import { EpsibotColor } from "../color/EpsibotColor.js";

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
		description: string;
		/**
		 * Color of the message sent
		 * Default to EpsibotColor.success
		 */
		color?: number;
		/**
		 * User that will be able to click on the buttons<br>
		 * Will use the interaction user by default
		 */
		userId?: string;
		/**
		 * Label to put on the yes button<br>
		 * Default to 'Oui'
		 */
		labelYes?: string;
		/**
		 * Label to put on the no button<br>
		 * Default to 'Non'
		 */
		labelNo?: string;
		/**
		 * Time in seconds to wait for an answer<br>
		 * Default to 60s
		 */
		timeout?: number;
		/**
		 * Set this if you want to return a default value after
		 * a timeout instead of null
		 */
		returnOnTimout?: boolean;
		/**
		 * Should the message be hidden?<br>
		 * Default to true
		 */
		ephemeral?: boolean;
	}
): Promise<boolean | null> {
	const {
		description,
		color = EpsibotColor.question,
		userId = interaction.member.id,
		labelYes = "Oui",
		labelNo = "Non",
		timeout = 60_000,
		returnOnTimout = null,
		ephemeral = true
	} = options;

	if (ephemeral && userId !== interaction.member.id) {
		throw new Error(
			"You can't set a confirm message as ephemeral if you want this user to see it!"
		);
	}

	const isFollowUp = interaction.deferred || interaction.replied;

	const messageContent: InteractionReplyOptions & { fetchReply: true } = {
		embeds: [
			{
				description: description,
				color: color
			}
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						label: labelYes,
						style: ButtonStyle.Success,
						customId: ButtonAction.yes
					},
					{
						type: ComponentType.Button,
						label: labelNo,
						style: ButtonStyle.Danger,
						customId: ButtonAction.no
					}
				]
			}
		],
		fetchReply: true,
		ephemeral: ephemeral
	};

	let messageConfirm: Message<true>;

	if (isFollowUp) {
		messageConfirm = await interaction.followUp(messageContent);
	} else {
		messageConfirm = await interaction.reply(messageContent);
	}

	let answer: boolean | null;
	let click: ButtonInteraction | undefined = undefined;

	try {
		click = await messageConfirm.awaitMessageComponent({
			componentType: ComponentType.Button,
			filter: (click) => click.member.id === userId,
			time: timeout
		});
		answer = click.customId === ButtonAction.yes;
		await click.deferUpdate();
	} catch (err) {
		answer = returnOnTimout;
	}

	if (answer === null) {
		await interaction.webhook.editMessage(messageConfirm, {
			components: []
		});
	} else {
		await interaction.webhook.editMessage(messageConfirm, {
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: answer ? labelYes : labelNo,
							style: answer
								? ButtonStyle.Success
								: ButtonStyle.Success,
							customId: answer
								? ButtonAction.yes
								: ButtonAction.no,
							disabled: true
						}
					]
				}
			]
		});
	}

	return answer;
}
