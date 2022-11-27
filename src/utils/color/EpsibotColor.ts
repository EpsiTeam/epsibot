import { resolveColor } from "discord.js";

export class EpsibotColor {
	static default	= resolveColor("#2F3136");
	static success	= resolveColor("Green");
	static error	= resolveColor("Red");
	static warning	= resolveColor("Yellow");
	static question	= resolveColor("Blue");
	static info		= resolveColor("White");
}
