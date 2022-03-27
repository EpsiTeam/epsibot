import { addDays } from "date-fns";
import { Collection, CommandInteraction, Message, TextBasedChannel, User } from "discord.js";
import { Command } from "./manager/Command.js";

enum Param {
	nb = "nb_to_delete",
	user = "user"
}

export class Purge extends Command {
	constructor() {
		super("purge", "Purge les derniers messages d'un channel");

		this.options = [{
			type: "INTEGER",
			name: Param.nb,
			description: "Le nombre de messages à supprimer",
			minValue: 1,
			maxValue: 100,
			required: true
		}, {
			type: "USER",
			name: Param.user,
			description: "L'utilisateur dont il faut supprimer les messages",
			required: false
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!interaction.channel) {
			throw Error("Channel is undefined while trying to purge");
		}

		const nb = interaction.options.getInteger(Param.nb, true);
		const user = interaction.options.getUser(Param.user);

		let msgToDelete: Message[];

		if (user) {
			msgToDelete = await this.getMemberMessagesToDelete(
				nb,
				interaction.channel,
				user
			);
		} else {
			msgToDelete = await this.getMessagesToDelete(
				nb,
				interaction.channel
			);
		}

		if (msgToDelete.length === 0) {
			return interaction.reply({
				embeds: [{
					title: "Impossible de purger ce channel",
					description: "En cherchant les messages purgeables, je n'en ai pas trouvé, peut être que les messages dates d'il y a plus de 2 semaines ?",
					color: "RED"
				}],
				ephemeral: true
			});
		}

		if (msgToDelete.length === 1) {
			const message = msgToDelete[0];

			await message.delete();

			return interaction.reply({
				embeds: [{
					title: "Message supprimé",
					description: `Un message ${user ? `de ${user} ` : ""}a été supprimé`,
					color: "GREEN"
				}],
				ephemeral: true
			});
		}

		await interaction.channel.bulkDelete(msgToDelete);

		return interaction.reply({
			embeds: [{
				title: "Messages supprimés",
				description: `${msgToDelete.length} message ${user ? `de ${user} ` : ""}ont été supprimés`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	private async getMessagesToDelete(nb: number, channel: TextBasedChannel) {
		const messages = await channel.messages.fetch({
			limit: nb
		});

		return Array.from(this.filterMessages(messages).values());
	}

	private async getMemberMessagesToDelete(
		nb: number,
		channel: TextBasedChannel,
		user: User
	) {
		// Retrieving the max possible amount to search for user message
		const messages = await channel.messages.fetch({
			limit: 100
		});

		const lastMessages = this.filterMessages(messages);
		// Not sure that messages are correctly ordered, we want
		// most recent one at the start
		lastMessages.sort(
			(msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp
		);

		const userMessages =
			lastMessages.filter(message => message.author.id === user.id);

		return userMessages.first(nb);
	}

	private filterMessages(messages: Collection<string, Message>) {
		const twoWeeksAgo = addDays(new Date(), -14);

		return messages.filter(message => message.createdAt > twoWeeksAgo);
	}
}
