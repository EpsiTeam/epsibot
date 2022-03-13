import {Command} from "epsicommands/built/types"
import epsiconfirm from "epsiconfirm"
import epsimpleembed from "epsimpleembed"
import EpsibotParams from "../types/epsibotParams"

const cmd: Command<EpsibotParams> = {
	name: "autorole",

	adminOnly: true,

	help(pre) {
		return {
			short: "Ajoute un rôle automatique",
			long: "Permet d'ajouter un rôle automatique pour les nouveaux arrivants",
			usage:
`\`${pre}${this.name} <@role>\` => le rôle @role sera ajouté automatiquement pour les nouveaux membres
\`${pre}${this.name}\` => désactive l'ajout du rôle automatique`
		}
	},

	async execute({msg}, {db, log, serverAutorole}) {
		if (!msg.guild)
			return Promise.resolve() // Shouldn't happen

		const server = msg.guild.id
		const role = msg.mentions.roles.first()
		const oldRoleID = serverAutorole.get(server)

		// Desactivating autorole
		if (!role) {
			// Nothing to desactivate?
			if (!oldRoleID) {
				return msg.channel.send(epsimpleembed("il n'y a aucun rôle automatique à supprimer", msg.author.id, "YELLOW"))
			}

			const confirm = await epsiconfirm({
				originMsg: msg,
				log,
				color: "YELLOW",
				desc: `Veux-tu supprimer l'ajout automatique du role <@&${oldRoleID}> ?`
			})

			if (!confirm) return

			// Desactivating
			serverAutorole.delete(server)

			await db("ServerAutorole").delete().where({
				ServerID: server
			})

			return msg.channel.send(epsimpleembed(
				`l'ajout automatique du rôle <@&${oldRoleID}> a été désactivé`,
				msg.author.id,
				"GREEN"
			))
		}
		// Activating autorole

		const confirm = await epsiconfirm({
			originMsg: msg,
			log,
			color: "BLUE",
			desc: `Veux-tu que j'ajoute automatiquement le rôle ${role} aux nouveaux membres ?`
		})

		if (!confirm) return

		// Is there already an autorole?
		if (oldRoleID) {
			const overwrite = await epsiconfirm({
				originMsg: msg,
				log,
				color: "YELLOW",
				desc: `Le rôle <@&${oldRoleID}> est déjà configuré en tant que rôle automatique, veux-tu le remplacer ?`
			})

			if (!overwrite) return
		}

		serverAutorole.set(server, role.id)

		// Updating DB
		if (oldRoleID) {
			await db("ServerAutorole").update({
				RoleID: role.id
			}).where({
				ServerID: server
			})
		} else {
			await db("ServerAutorole").insert({
				ServerID: server,
				RoleID: role.id
			})
		}

		return msg.channel.send(epsimpleembed(
			`le rôle ${role} sera désormais ajouté automatiquement pour les nouveaux venus !`,
			msg.author.id,
			"GREEN"
		))
	}
}

export default cmd
