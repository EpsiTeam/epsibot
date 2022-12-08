import { Colors, resolveColor } from "discord.js";

export class EpsibotColor {
	static default = resolveColor("#2F3136");
	static success = Colors.Green;
	static error = Colors.Red;
	static warning = Colors.Yellow;
	static question = Colors.Blue;
	static info = Colors.White;
}
