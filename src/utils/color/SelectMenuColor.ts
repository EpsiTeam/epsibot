import { BaseMessageComponentOptions, ColorResolvable, MessageActionRowOptions, MessageSelectOptionData } from "discord.js";

const colors: [string, ColorResolvable][] = [
	["Rouge", "RED"],
	["Rouge foncé", "DARK_RED"],
	["Orange", "ORANGE"],
	["Orange foncé", "DARK_ORANGE"],
	["Jaune", "YELLOW"],
	["Or", "GOLD"],
	["Or foncé", "DARK_GOLD"],
	["Vert", "GREEN"],
	["Vert foncé", "DARK_GREEN"],
	["Turquoise", "AQUA"],
	["Turquoise foncé", "DARK_AQUA"],
	["Bleu", "BLUE"],
	["Bleu foncé", "DARK_BLUE"],
	["Bleu marine", "NAVY"],
	["Bleu marine foncé", "DARK_NAVY"],
	["Violet", "PURPLE"],
	["Fushia", "LUMINOUS_VIVID_PINK"],
	["Fushia foncé", "DARK_VIVID_PINK"],
	["Blanc", "WHITE"],
	["Gris clair", "LIGHT_GREY"],
	["Gris", "GREY"],
	["Gris foncé", "DARK_GREY"],
	["Gris très foncé", "DARKER_GREY"],
	["Noir", "DEFAULT"]
];

const colorOptions: MessageSelectOptionData[] =
	colors.map(([colorName, color]) => {
		return {
			label: colorName,
			value: String(color)
		};
	});

type ColorActionRow =
	Required<BaseMessageComponentOptions> & MessageActionRowOptions;

export class SelectMenuColor {
	static actionRow: ColorActionRow = {
		type: "ACTION_ROW",
		components: [{
			type: "SELECT_MENU",
			options: colorOptions,
			minValues: 1,
			maxValues: 1,
			customId: "selectColor"
		}]
	};
}
