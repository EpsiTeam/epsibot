# Changelog

Ce changelog essaie de suivre le format de [keepachangelog.com](https://keepachangelog.com/en/1.0.0/)<br>
Les versions essaient de respecter le [semver](https://semver.org/)

## [2.10.0] - 2023-03-05

### Added

-   `npm run cmd:check` lance un checkup complet des slash commandes, pour être sûr qu'elles sont enregistré au bon endroit suivant les variables d'environnement

### Changed

-   Du ménage a été fait dans les scripts npm, dans le but que tout soit plus clair. Si c'est pas plus clair, c'est que c'est raté
-   Le changelog est désormais dans un fichier séparé pour éviter de polluer le readme

### Fixed

-   Epsibot pouvait planter en voulant log son propre départ :/

## [2.9.0] - 2023-02-26 [#139](https://github.com/EpsiTeam/epsibot/pull/139)

### Fixed

-   Toutes les slash commandes étaient en double lorsqu'on invitait Epsibot sur un nouveau serveur...
-   `/command list`, `/command add` et `/command edit` avait un bug d'affichage sur le role @everyone si il était spécifié à la main

### Added

-   Script pour supprimer toutes les slash commandes enregistrées

### Changed

-   `/shifumi play` a maintenant une limite de 10 rounds, sinon les games étaient un peu trop longues
-   Update de dépendances mineures

## [2.8.1] - 2023-01-14 [#104](https://github.com/EpsiTeam/epsibot/pull/104)

### Changed

-   Update de dépendances mineures

## [2.8.0] - 2022-12-12 [#85](https://github.com/EpsiTeam/epsibot/pull/85)

### Added

-   `/queue edit` pour éditer un élément de la file

### Fixed

-   `/queue add` était complètement cassé depuis un moment, ça devrait être résolu

## [2.7.1] - 2022-12-11

### Changed

-   `better-sqlite3`: `7.6.2` -> `8.0.1`

## [2.7.0] - 2022-12-09

### Changed

-   `/command add` on peut limiter ceux qui peuvent utiliser une commande custom par un rôle. Les admins peuvent toujours utiliser les commandes custom
-   `/command edit` a été modifié pour suivre les changements sur `/command add`

## [2.6.0] - 2022-12-08

### Added

-   `/command edit` pour éditer une commande custom. Plus besoin d'avoir à supprimer et recréer une commande, on peut directement la modifier !

### Changed

-   `/command add` la sélection de couleur d'un embed a été revu pour être plus intuitive

## [2.5.1] - 2022-12-06

### Fixed

-   `/shifumi play` ne fonctionnait plus depuis la version `2.5.0`, c'est maintenant corrigé
-   `/command list` était aussi cassé

## [2.5.0] - 2022-12-05

### Added

-   `/command help` pour voir l'aide sur les paramètres des commandes custom
-   Ce changelog a été ajouté au readme
-   `prettier` `2.8.0` ajouté au projet pour garantir un formatage cohérent partout

### Changed

-   `/command add` utilise maintenant les modals, on peut donc ajouter une commande custom sans n'avoir à envoyer aucun message
-   Epsibot peut deployer ses commandes sur un seul serveur ou globalement, suivant si il est en mode production ou non
-   `discord.js`: `13.6.0` -> `14.6.0`
-   `typeorm`: `0.2.41` -> `0.3.10`
