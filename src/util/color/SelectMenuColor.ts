import {
	ActionRowData,
	ColorResolvable,
	ComponentType,
	MessageActionRowComponentData,
	SelectMenuComponentOptionData
} from "discord.js";

const colors: [string, ColorResolvable][] = [
	["Rouge", "Red"],
	["Rouge foncé", "DarkRed"],
	["Orange", "Orange"],
	["Orange foncé", "DarkOrange"],
	["Jaune", "Yellow"],
	["Or", "Gold"],
	["Or foncé", "DarkGold"],
	["Vert", "Green"],
	["Vert foncé", "DarkGreen"],
	["Turquoise", "Aqua"],
	["Turquoise foncé", "DarkAqua"],
	["Bleu", "Blue"],
	["Bleu foncé", "DarkBlue"],
	["Bleu marine", "Navy"],
	["Bleu marine foncé", "DarkNavy"],
	["Violet", "Purple"],
	["Fushia", "LuminousVividPink"],
	["Fushia foncé", "DarkVividPink"],
	["Blanc", "White"],
	["Gris clair", "LightGrey"],
	["Gris", "Grey"],
	["Gris foncé", "DarkGrey"],
	["Gris très foncé", "DarkerGrey"],
	["Noir", "Default"]
];

const colorOptions: SelectMenuComponentOptionData[] = colors.map(
	([colorName, color]) => {
		return {
			label: colorName,
			value: String(color)
		};
	}
);

export class SelectMenuColor {
	static actionRow: ActionRowData<MessageActionRowComponentData> = {
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.StringSelect,
				options: colorOptions,
				minValues: 1,
				maxValues: 1,
				customId: "selectColor"
			}
		]
	};
}
