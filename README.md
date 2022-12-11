```
 _____         _ _       _
|   __|___ ___|_| |_ ___| |_
|   __| . |_ -| | . | . |  _|
|_____|  _|___|_|___|___|_|  v2.7.1
      |_|
```

# A propos

Epsibot est un bot discord qui ne fait rien de mieux que tout ceux qui existent déjà, mais fait à notre sauce !<br>
Epsibot parle seulement français, mais tout le code et les commentaires sont en anglais.

# Installation

Clonez ce projet, et créez un fichier `.env` à la racine du projet contenant:

```env
PRODUCTION=false
APPLICATION_ID=<app_id>
DEV_GUILD_ID=<server_id>
DISCORD_TOKEN=<token>
OWNERS="<ownerId1>,<ownerId2>"
```

Epsibot ne sera pas content si les variables d'environnement ne sont pas bien setup (voir [Variables d'environnement](#variables-denvironnement) pour le détail).

Il faut une version de node supérieur ou égal à 16.16.0 pour pouvoir lancer les commandes suivantes:

```sh
npm i
npm run migrate
npm run register
```

Après ça, tout devrait être prêt pour lancer Epsibot.<br>
Vous pouvez le faire avec `npm start`.<br>
Vous pouvez aussi utiliser `npm run start:builded` pour lancer Epsibot sans régénérer les fichiers js, pour lancer le bot plus rapidement si aucune modification du code source n'a été faite.

D'autres script npm sont définis, faites `npm run` pour voir la liste disponible.

# Changelog

## v2.7.1

### Changed

-   `better-sqlite3`: `7.6.2` -> `8.0.1`

## v2.7.0

### Changed

-   `/command add` on peut limiter ceux qui peuvent utiliser une commande custom par un rôle. Les admins peuvent toujours utiliser les commandes custom
-   `/command edit` a été modifié pour suivre les changements sur `/command add`

## v2.6.0

### Added

-   `/command edit` pour éditer une commande custom. Plus besoin d'avoir à supprimer et recréer une commande, on peut directement la modifier !

### Changed

-   `/command add` la sélection de couleur d'un embed a été revu pour être plus intuitive

## v2.5.1

### Fixed

-   `/shifumi play` ne fonctionnait plus depuis la version `2.5.0`, c'est maintenant corrigé
-   `/command list` était aussi cassé

## v2.5.0

### Added

-   `/command help` pour voir l'aide sur les paramètres des commandes custom
-   Ce changelog a été ajouté au readme
-   `prettier` `2.8.0` ajouté au projet pour garantir un formatage cohérent partout

### Changed

-   `/command add` utilise maintenant les modals, on peut donc ajouter une commande custom sans n'avoir à envoyer aucun message
-   Epsibot peut deployer ses commandes sur un seul serveur ou globalement, suivant si il est en mode production ou non
-   `discord.js`: `13.6.0` -> `14.6.0`
-   `typeorm`: `0.2.41` -> `0.3.10`

# Variables d'environnement

| Nom              | Type     | Exemple                   | Description                                                                                                                              |
| ---------------- | -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `PRODUCTION`     | boolean  | false                     | Change comment sont déployé les commandes et la couleur des logs                                                                         |
| `APPLICATION_ID` | string   | 867545446879866466        | L'application ID du bot, à récupérer depuis le [developer portal](https://discord.com/developers/applications) en créant une application |
| `DISCORD_TOKEN`  | string   | s0m3-s3cr37               | Le token discord du bot, à récupérer depuis le [developer portal](https://discord.com/developers/applications) en créant une application |
| `DEV_GUILD_ID`   | string   | 684654654685479884        | L'ID du serveur discord de développement (peut être vide si `PRODUCTION = true`)                                                         |
| `OWNERS`         | string[] | "discord_id1,discord_id2" | Les ID discord des propriétaires de l'instance du bot, ces utilisateurs pourront utiliser certaines commandes spéciales                  |
