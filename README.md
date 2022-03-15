# Epsibot

v2 - Now with slash commands!
Still a work in progress tho

## Installation

Clone this project, then create a `.env` file at the root of the project (see [Environment variables](#environment-variables)).
Epsibot may scream at you if you didn't setup correctly some environment variables.

You need node v16 to run it:
```
npm i
npm run migrate
npm run build
```

Now everything should be ready to start Epsibot.<br>
You can do so with `npm start`.<br>
You can also run `npm run start:builded` if you don't wish to rebuild the binaries each time.

## Environment variables

Name			|	Type		|	Example value				|	Description
---				|	---			|	---							|	---
`PRODUCTION`	|	boolean		|	false						|	Not used for now
`DISCORD_TOKEN`	|	string		|	s0m3-s3cr37					|	The Discord token, get it from the [developer portal](https://discord.com/developers/applications) by creating an application
`OWNERS`		|	string[]	|	"discord_id1,discord_id2"	|	The owners of the bot, will be able to use some special commands
