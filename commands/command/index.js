module.exports = {
	isSubCommand: true,
	baseCommand: "list",
	category: "Commandes personnalisées",

	list: require("./list"),

	add: require("./add"),

	remove: require("./remove")
}