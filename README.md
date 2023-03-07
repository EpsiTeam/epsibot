```
 _____         _ _       _
|   __|___ ___|_| |_ ___| |_
|   __| . |_ -| | . | . |  _|
|_____|  _|___|_|___|___|_|  v2.10.1
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

Il faut une version de node supérieur ou égal à 16.16.0 pour pouvoir lancer Epsibot.
Pour le lancer la première fois, utilisez ces commandes:

```sh
npm ci
npm run init
```

Cela va créer la DB, enregistrer les slash commandes sur discord (en global si PRODUCTION=true, sur le serveur de dev (DEV_GUILD_ID) sinon) et lancer le bot.

Après ça, tout pouvez lancer Epsibot avec juste `npm start`.<br>
Vous pouvez aussi utiliser `npm run start:builded` pour lancer Epsibot sans régénérer les fichiers js, pour lancer le bot plus rapidement si aucune modification du code source n'a été faite.

D'autres script npm sont définis, faites `npm run` pour voir la liste disponible.

# Changelog

Voir le fichier CHANGELOG.md

# Variables d'environnement

| Nom              | Type     | Exemple                   | Description                                                                                                                              |
| ---------------- | -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `PRODUCTION`     | boolean  | false                     | Change comment sont déployé les commandes et la couleur des logs                                                                         |
| `APPLICATION_ID` | string   | 867545446879866466        | L'application ID du bot, à récupérer depuis le [developer portal](https://discord.com/developers/applications) en créant une application |
| `DISCORD_TOKEN`  | string   | s0m3-s3cr37               | Le token discord du bot, à récupérer depuis le [developer portal](https://discord.com/developers/applications) en créant une application |
| `DEV_GUILD_ID`   | string   | 684654654685479884        | L'ID du serveur discord de développement (peut être vide si `PRODUCTION = true`)                                                         |
| `OWNERS`         | string[] | "discord_id1,discord_id2" | Les ID discord des propriétaires de l'instance du bot, ces utilisateurs pourront utiliser certaines commandes spéciales                  |
