import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QueueElement {
	static maxRequesterLength = 200 as const;
	static maxRequestLength = 1000 as const;
	static maxInformationLength = 100 as const;
	static maxElements = 20 as const;

	constructor(
		guildId: string,
		position: number,
		requester: string,
		request: string,
		hiddenInformation: string
	) {
		this.guildId = guildId;
		this.position = position;
		this.requester = requester;
		this.request = request;
		this.hiddenInformation = hiddenInformation;

		if (this.requester?.length > QueueElement.maxRequesterLength)
			throw Error("Requester too long");
		if (this.request?.length > QueueElement.maxRequestLength)
			throw Error("Request too long");
		if (this.hiddenInformation?.length > QueueElement.maxInformationLength)
			throw Error("Hidden information too long");
	}

	@PrimaryGeneratedColumn("uuid") id: number;

	@Column() guildId: string;

	// Position of the queue element, starting at 1
	@Column() position: number;

	@Column() requester: string;

	@Column() request: string;

	@Column() hiddenInformation: string;
}
