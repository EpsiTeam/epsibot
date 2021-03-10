module.exports = {
	isSubCommand: true,
	baseCommand: "subtest",
	category: "Test des sous-commandes",

	subtest: require("./subtest")
}