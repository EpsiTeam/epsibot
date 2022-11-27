```
 _____         _ _       _
|   __|___ ___|_| |_ ___| |_
|   __| . |_ -| | . | . |  _|
|_____|  _|___|_|___|___|_|  v2.5.0
      |_|
```

# A propos

Epsibot est un bot discord qui ne fait rien de mieux que tout ceux qui existent déjà, mais fait à notre sauce.<br>
Epsibot parle seulement français, mais tout le code et les commentaires sont en anglais.

# Installation

Clonez ce projet, et créez un fichier `.env` à la racine du projet contenant:

```env
PRODUCTION=false
DISCORD_TOKEN=<token>
OWNERS="<ownerId1>,<ownerId2>"
```

Remplissez `DISCORD_TOKEN` par un token d'application discord, et `OWNERS` par une liste de user ID discord.

Epsibot ne sera pas content si les variables d'environnement ne sont pas bien setup (voir [Variables d'environnement](#variables-denvironnement) pour le détail).

Il faut une version de node supérieur ou égal à 16.16.0 pour pouvoir lancer les commandes suivantes:

```sh
npm i
npm run migrate
```

Après ça, tout devrait être prêt pour lancer Epsibot.<br>
Vous pouvez le faire avec `npm start`.<br>
Vous pouvez aussi utiliser `npm run start:builded` pour lancer Epsibot sans régénérer les fichiers js, pour lancer le bot plus rapidement si aucune modification du code source n'a été faite.

D'autres script npm sont définis, faites `npm run` pour voir la liste disponible.

# Changelog

## v2.5.0

### Added

-   prettier `2.8.0` ajouté au projet pour garantir un formatage cohérent partout

### Changed

-   discord.js: `13.6.0` -> `14.6.0`
-   typeorm: `0.2.41` -> `0.3.10`

# Variables d'environnement

| Nom             | Type     | Exemple                   | Description                                                                                                                              |
| --------------- | -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `PRODUCTION`    | boolean  | false                     | Change la couleur des logs                                                                                                               |
| `DISCORD_TOKEN` | string   | s0m3-s3cr37               | Le token discord du bot, à récupérer depuis le [developer portal](https://discord.com/developers/applications) en créant une application |
| `OWNERS`        | string[] | "discord_id1,discord_id2" | Les ID discord des propriétaires de l'instance du bot, ces utilisateurs pourront utiliser certaines commandes spéciales                  |
