import { MessageActionRow, MessageSelectMenu } from "discord.js";

export const selectMenuColorId = "selectColor";

export const selectMenuColor = new MessageSelectMenu({
	type: "SELECT_MENU",
	options: [{
		label: "Défaut",
		value: "DEFAULT"
	}, {
		label: "Turquoise",
		value: "AQUA"
	}, {
		label: "Turquoise foncé",
		value: "DARK_AQUA"
	}, {
		label: "Vert",
		value: "GREEN"
	}, {
		label: "Vert foncé",
		value: "DARK_GREEN"
	}, {
		label: "Bleu",
		value: "BLUE"
	}, {
		label: "Bleu foncé",
		value: "DARK_BLUE"
	}, {
		label: "Violet",
		value: "DARK_PURPLE"
	}, {
		label: "Fushia",
		value: "LUMINOUS_VIVID_PINK"
	}, {
		label: "Fushia foncé",
		value: "DARK_VIVID_PINK"
	}, {
		label: "Or",
		value: "GOLD"
	}, {
		label: "Or foncé",
		value: "DARK_GOLD"
	}, {
		label: "Orange",
		value: "ORANGE"
	}, {
		label: "Orange foncé",
		value: "DARK_ORANGE"
	}, {
		label: "Rouge",
		value: "RED"
	}, {
		label: "Rouge foncé",
		value: "DARK_RED"
	}, {
		label: "Gris",
		value: "GREY"
	}, {
		label: "Gris foncé",
		value: "DARK_GREY"
	}, {
		label: "Gris très foncé",
		value: "DARKER_GREY"
	}, {
		label: "Gris clair",
		value: "LIGHT_GREY"
	}, {
		label: "Bleu marine",
		value: "NAVY"
	}, {
		label: "Bleu marine foncé",
		value: "DARK_NAVY"
	}, {
		label: "Jaune",
		value: "YELLOW"
	}],
	minValues: 1,
	maxValues: 1,
	customId: selectMenuColorId
});

export const actionRowColor =
	new MessageActionRow().addComponents(selectMenuColor);
