import { CommandInteraction } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { AutoRole } from "../entity/AutoRole.js";
import { Command } from "./manager/Command.js";

enum Subcommand {
	info = "info",
	enable = "enable",
	disable = "disable"
}

enum Params {
	role = "role"
}

export class GuildAutoRole extends Command {
	constructor() {
		super("autorole", "Gère le rôle assigné aux nouveaux membres");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.info,
			description: "Affiche quel rôle est automatiquement assigné"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.enable,
			description: "Active le rôle automatique",
			options: [{
				type: "ROLE",
				name: Params.role,
				description: "Rôle à assigner automatiquement aux nouveaux membres",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.disable,
			description: "Désactive le rôle automatique"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				embeds: [{
					title: "Non non non !",
					description: "Il faut être un admin pour faire ça :p",
					color: "RED"
				}],
				ephemeral: true
			});
		}

		const subcommand = interaction.options.getSubcommand();
		const autoroleRepo = getRepository(AutoRole);

		switch (subcommand) {
		case Subcommand.info:
			return this.showInfo(interaction, autoroleRepo);
		case Subcommand.enable:
			return this.enableAutorole(interaction, autoroleRepo);
		case Subcommand.disable:
			return this.disableAutorole(interaction, autoroleRepo);
		}

		throw Error(`Unexpected subcommand ${subcommand}`);
	}

	async showInfo(
		interaction: CommandInteraction<"cached">,
		autoroleRepo: Repository<AutoRole>
	) {
		const autorole = await autoroleRepo.findOne(
			new AutoRole(interaction.guildId)
		);

		let message: string;
		if (!autorole) {
			message = "Aucun rôle automatique n'est configuré";
		} else {
			const role = await interaction.guild.roles.fetch(autorole.roleId);
			if (!role) {
				message = "Il semblerait que le rôle qui devait être automatiquement assigné n'existe plus !";
			} else {
				message = `Les nouveaux membres auront automatiquement le rôle ${role}`;
			}
		}

		return interaction.reply({
			embeds: [{
				title: "Configuration du rôle automatique",
				description: message
			}],
			ephemeral: true
		});
	}

	async enableAutorole(
		interaction: CommandInteraction<"cached">,
		autoroleRepo: Repository<AutoRole>
	) {
		const role = interaction.options.getRole(Params.role, true);

		if (role.id === interaction.guild.roles.everyone.id) {
			return interaction.reply({
				embeds: [{
					title: "Impossible de configurer le rôle automatique",
					description: `Ça n'aurait aucun sens d'assigner le rôle ${interaction.guild.roles.everyone} !`,
					color: "RED"
				}],
				ephemeral: true
			});
		}

		if (!interaction.guild.me) {
			throw Error("guild.me is null, no idea why (has the bot been kicked?)");
		}

		const roleBelowBot: boolean =
			interaction.guild.roles.comparePositions(
				role,
				interaction.guild.me.roles.highest
			) < 0;

		if (!roleBelowBot) {
			return interaction.reply({
				embeds:[{
					title: "Impossible de configurer le rôle automatique",
					description: `Je suis incapable d'assigner le role ${role} à qui que ce soit, car ce rôle est plus haut que moi dans la hiérarchie. Déplacez ce rôle dans les paramètres du serveur si vous voulez que je puisse l'assigner automatiquement !`,
					color: "RED"
				}],
				ephemeral: true
			});
		}

		await autoroleRepo.save(
			new AutoRole(interaction.guildId, role.id)
		);

		return interaction.reply({
			embeds: [{
				title: "Rôle automatique configuré",
				description: `Tous les nouveaux membres se verront assigner le rôle ${role}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async disableAutorole(
		interaction: CommandInteraction<"cached">,
		autoroleRepo: Repository<AutoRole>
	) {
		const autorole = await autoroleRepo.findOne(
			new AutoRole(interaction.guildId)
		);

		if (!autorole) {
			return interaction.reply({
				embeds: [{
					title: "Rôle automatique supprimé",
					description: "Il n'y avait pas de rôle automatique, mais bon si ça te fait plaisir, il n'y en a toujours pas !",
					color: "YELLOW"
				}],
				ephemeral: true
			});
		}

		await autoroleRepo.remove(autorole);
		const role = await interaction.guild.roles.fetch(autorole.roleId);

		let message: string;

		if (!role) {
			message = "Les nouveaux membres n'auront plus de rôle automatique (tant mieux parce que j'ai l'impression que ce rôle n'existe plus)";
		} else {
			message = `Les nouveaux membres n'auront plus le rôle ${role} automatiquement`;
		}

		return interaction.reply({
			embeds: [{
				title: "Rôle automatique supprimé",
				description: message,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}
}
