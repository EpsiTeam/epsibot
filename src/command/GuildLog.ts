import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { Command } from "./Command.js";

export class GuildLog extends Command {
	constructor() {
		super("log", "Met en place des logs du serveur");

		this.availableTo = "owner";

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND_GROUP",
			name: "user",
			description: "Met en place des logs sur les arrivés et départs de membres",
			options: [{
				type: "SUB_COMMAND",
				name: "activate",
				description: "Active les logs d'arrivés et départs de membres",
				options: [{
					type: "CHANNEL",
					name: "channel",
					description: "Channel où les logs seront affichés",
					required: true,
					channelTypes: ["GUILD_TEXT"]
				}]
			}, {
				type: "SUB_COMMAND",
				name: "desactivate",
				description: "Désactive les logs d'arrivés et départs de membres"
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">): Promise<void> {
		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				content: "Cette commande est réservée au admins, peut-être qu'un jour tu le seras ?",
				ephemeral: true
			});
		}

		const group = interaction.options.getSubcommandGroup();

		if (group === "user") {
			const subcommand = interaction.options.getSubcommand();

			switch (subcommand) {
			case "activate":
				await this.activateUserLog(interaction);
				break;
			case "desactivate":
				await this.desactivateUserLog(interaction);
				break;
			}
		}
	}

	async activateUserLog(interaction: CommandInteraction<"cached">): Promise<void> {
		if (!interaction.guildId) throw Error("Guild ID not found, this is weird");
		const channel = interaction.options.getChannel("channel", true);

		if (channel.type !== "GUILD_TEXT") {
			return interaction.reply({
				content: `${channel} n'est pas un channel de type textuel, impossible d'y afficher des logs`,
				ephemeral: true
			});
		}

		const repo = getRepository(ChannelLog);
		repo.save(new ChannelLog(interaction.guildId, "userJoinLeave", channel.id));

		await interaction.reply({
			content: `Les logs d'arrivés et de départs des membres sont désormais actif sur le channel ${channel}`,
			ephemeral: true
		});
	}

	async desactivateUserLog(interaction: CommandInteraction<"cached">): Promise<void> {
		if (!interaction.guildId) throw Error("Guild ID not found, this is weird");

		const repo = getRepository(ChannelLog);
		repo.delete(new ChannelLog(interaction.guildId, "userJoinLeave"));

		await interaction.reply({
			content: "Les logs d'arrivés et de départs des membres sont désormais inactif",
			ephemeral: true
		});
	}
}
