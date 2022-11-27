import { addDays } from "date-fns";
import {
	ChatInputCommandInteraction,
	Collection,
	Message,
	TextBasedChannel,
	User
} from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export enum PurgeParam {
	nb = "nb_to_delete",
	user = "user"
}

export async function purge(
	interaction: ChatInputCommandInteraction<"cached">
) {
	if (!interaction.channel) {
		throw Error("Channel is undefined while trying to purge");
	}

	const nb = interaction.options.getInteger(PurgeParam.nb, true);
	const user = interaction.options.getUser(PurgeParam.user);

	let msgToDelete: Message[];

	if (user) {
		msgToDelete = await getMemberMessagesToDelete(
			nb,
			interaction.channel,
			user
		);
	} else {
		msgToDelete = await getMessagesToDelete(nb, interaction.channel);
	}

	if (msgToDelete.length === 0) {
		return interaction.reply({
			embeds: [
				{
					description: "Aucun message à purger trouvé",
					footer: {
						text: "Pour information, les messages plus vieux que 2 semaines ne peuvent pas être purgé"
					},
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	if (msgToDelete.length === 1) {
		const message = msgToDelete[0];

		await message.delete();

		return interaction.reply({
			embeds: [
				{
					description: `Un message ${
						user ? `de ${user} ` : ""
					}a été supprimé`,
					color: EpsibotColor.success
				}
			],
			ephemeral: true
		});
	}

	await interaction.channel.bulkDelete(msgToDelete);

	return interaction.reply({
		embeds: [
			{
				description: `${msgToDelete.length} message ${
					user ? `de ${user} ` : ""
				}ont été supprimés`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}

async function getMessagesToDelete(nb: number, channel: TextBasedChannel) {
	const messages = await channel.messages.fetch({
		limit: nb
	});

	return Array.from(filterMessages(messages).values());
}

async function getMemberMessagesToDelete(
	nb: number,
	channel: TextBasedChannel,
	user: User
) {
	// Retrieving the max possible amount to search for user message
	const messages = await channel.messages.fetch({
		limit: 100
	});

	const lastMessages = filterMessages(messages);
	// Not sure that messages are correctly ordered, we want
	// most recent one at the start
	lastMessages.sort(
		(msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp
	);

	const userMessages = lastMessages.filter(
		(message) => message.author.id === user.id
	);

	return userMessages.first(nb);
}

function filterMessages(messages: Collection<string, Message>) {
	const twoWeeksAgo = addDays(new Date(), -14);

	return messages.filter((message) => message.createdAt > twoWeeksAgo);
}
