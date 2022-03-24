import { ColorResolvable, MessageEmbed, Util } from "discord.js";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CustomEmbedCommand {
	static maxNameLength = 50;
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
	}

	@PrimaryColumn()
		guildId: string;

	@PrimaryColumn({
		type: "text",
		length: CustomEmbedCommand.maxNameLength
	})
		name: string;

	@Column({
		type: "text",
		length: CustomEmbedCommand.maxTitleLength
	})
		title: string;

	@Column({
		type: "text",
		length: CustomEmbedCommand.maxDescriptionLength
	})
		description: string;

	@Column()
		image: string;

	@Column()
		color: number;

	@Column()
		adminOnly: boolean;

	@Column()
		autoDelete: boolean;

	public createEmbed(): MessageEmbed {
		return new MessageEmbed({
			title: this.title,
			description: this.description,
			image: {
				url: this.image
			},
			color: this.color
		});
	}
}
