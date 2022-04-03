import { ColorResolvable, MessageEmbedOptions, Util } from "discord.js";
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
		title?: string,
		description?: string,
		image?: string,
		color?: ColorResolvable,
		adminOnly?: boolean,
		autoDelete?: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		if (title) this.title = title;
		if (description) this.description = description;
		if (image) this.image = image;
		if (color) this.color = Util.resolveColor(color);
		if (adminOnly !== undefined) this.adminOnly = adminOnly;
		if (autoDelete !== undefined) this.autoDelete = autoDelete;

		if (this.name && this.name.length > CustomEmbedCommand.maxNameLength) {
			throw Error("Name too long");
		}
		if (
			this.title && this.title.length > CustomEmbedCommand.maxTitleLength
		) {
			throw Error("Title too long");
		}
		if (
			this.description && this.description.length >
			CustomEmbedCommand.maxDescriptionLength
		) {
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

	public createEmbed(): MessageEmbedOptions {
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
