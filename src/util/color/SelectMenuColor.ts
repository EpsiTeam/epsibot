import {
	ActionRowData,
	ColorResolvable,
	Colors,
	ComponentType,
	MessageActionRowComponentData,
	resolveColor,
	SelectMenuComponentOptionData
} from "discord.js";
import { EpsibotColor } from "./EpsibotColor.js";

const colors: [emoji: string, label: string, color: ColorResolvable][] = [
	["⚫", "Defaut", EpsibotColor.default],
	["🔴", "Rouge", Colors.Red],
	["🟤", "Rouge foncé", Colors.DarkRed],
	["🟠", "Orange", Colors.Orange],
	["🟠", "Orange foncé", Colors.DarkOrange],
	["🟡", "Jaune", Colors.Yellow],
	["🟡", "Or", Colors.Gold],
	["🟤", "Or foncé", Colors.DarkGold],
	["🟢", "Vert", Colors.Green],
	["🟢", "Vert foncé", Colors.DarkGreen],
	["🟢", "Turquoise", Colors.Aqua],
	["🟢", "Turquoise foncé", Colors.DarkAqua],
	["🔵", "Bleu", Colors.Blue],
	["🔵", "Bleu foncé", Colors.DarkBlue],
	["🔵", "Bleu marine", Colors.Navy],
	["🔵", "Bleu marine foncé", Colors.DarkNavy],
	["🟣", "Violet", Colors.Purple],
	["🟣", "Fushia", Colors.LuminousVividPink],
	["🟣", "Fushia foncé", Colors.DarkVividPink],
	["⚪", "Blanc", Colors.White],
	["⚪", "Gris clair", Colors.LightGrey],
	["⚪", "Gris", Colors.Grey],
	["⚫", "Gris foncé", Colors.DarkGrey],
	["⚫", "Gris très foncé", Colors.DarkerGrey],
	["⚫", "Noir", Colors.Default]
];

const colorOptions: SelectMenuComponentOptionData[] = colors.map(
	([emoji, colorName, color]) => {
		return {
			label: colorName,
			value: String(color),
			emoji
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

export function getColorFromColorValue(value: ColorResolvable) {
	const color = colors.find((color) => color[2] === resolveColor(value));

	if (!color) return null;
	return {
		emoji: color[0],
		label: color[1],
		value: color[2]
	};
}

export function getLabelFromColorValue(value: ColorResolvable) {
	const color = getColorFromColorValue(value);

	return color?.label ?? String(value);
}

export function getEmojiFromColorValue(value: ColorResolvable) {
	const color = getColorFromColorValue(value);

	return color?.emoji ?? null;
}
