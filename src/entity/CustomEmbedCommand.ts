import { APIEmbed, ColorResolvable, resolveColor } from "discord.js";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { CustomCommand } from "./CustomCommand.js";

@Entity()
export class CustomEmbedCommand {
	static maxNameLength = CustomCommand.maxNameLength;
	static maxTitleLength = 256;
	static maxDescriptionLength = 4096;

	constructor(
		guildId: string,
		name: string,
		title: string,
		description: string,
		image: string,
		color: ColorResolvable,
		adminOnly: boolean,
		autoDelete: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		this.title = title;
		this.description = description;
		this.image = image;
		this.color = resolveColor(color);
		this.adminOnly = adminOnly;
		this.autoDelete = autoDelete;

		if (this.name.length > CustomEmbedCommand.maxNameLength) {
			throw Error("Name too long");
		}
		if (this.title.length > CustomEmbedCommand.maxTitleLength) {
			throw Error("Title too long");
		}
		if (this.description.length > CustomEmbedCommand.maxDescriptionLength) {
			throw Error("Description too long");
		}
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() name: string;

	@Column() title: string;

	@Column() description: string;

	@Column({ nullable: true }) image: string;

	@Column() color: number;

	@Column() adminOnly: boolean;

	@Column() autoDelete: boolean;

	public createEmbed(): APIEmbed {
		return {
			title: this.title,
			description: this.description,
			image: {
				url: this.image
			},
			color: this.color
		};
	}
}
