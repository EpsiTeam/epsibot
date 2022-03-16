import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { Command } from "./Command.js";

export class GuildLog extends Command {
	constructor() {
		super({
			name: "log",
			description: "Met en place des logs du serveur"
		});

		this.commandBuilder.addSubcommandGroup(group =>
			group
				.setName("user")
				.setDescription("Met en place des logs sur les arrivés et départs de membres")
				.addSubcommand(subcommand =>
					subcommand
						.setName("activate")
						.setDescription("Active les logs d'arrivés et départs de membres")
						.addChannelOption(option =>
							option
								.setName("channel")
								.setDescription("Channel où les logs seront affichés")
								.setRequired(true)
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName("desactivate")
						.setDescription("Désactive les logs d'arrivés et départs de membres")
				)
		);
	}

	async execute(interaction: CommandInteraction): Promise<void> {
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

	async activateUserLog(interaction: CommandInteraction): Promise<void> {
		if (!interaction.guildId) throw Error("Guild ID not found, this is weird");
		const channel = interaction.options.getChannel("channel", true);

		if (channel.type !== "GUILD_TEXT") {
			return interaction.reply({ content: `${channel} n'est pas un channel de type textuel, impossible d'y afficher des logs`, ephemeral: true });
		}

		const repo = getRepository(ChannelLog);
		repo.save(new ChannelLog(interaction.guildId, "userJoinLeave", channel.id));

		await interaction.reply({ content: `Les logs d'arrivés et de départs des membres sont désormais actif sur le channel ${channel}`, ephemeral: true });
	}

	async desactivateUserLog(interaction: CommandInteraction): Promise<void> {
		if (!interaction.guildId) throw Error("Guild ID not found, this is weird");

		const repo = getRepository(ChannelLog);
		repo.delete(new ChannelLog(interaction.guildId, "userJoinLeave"));

		await interaction.reply({ content: "Les logs d'arrivés et de départs des membres sont désormais inactif", ephemeral: true });
	}
}
