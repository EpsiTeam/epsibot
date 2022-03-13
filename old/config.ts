interface Config {
	prefix: string
	owners: string[]
	logTypeWidth: number
	logMsgWidth: number
}

const configLoader = (env: string): Config => {
	switch (env) {
		case "production":
			return {
				prefix: "!",
				owners: [
					"243425339768832000",
					"158264940526960640"
				],
			
				logTypeWidth: 13,
				logMsgWidth: 100
			}
		default: // development
			return {
				prefix: "!",
				owners: [
					"243425339768832000",
					"158264940526960640"
				],
			
				logTypeWidth: 13,
				logMsgWidth: 40
			}
	}
}

export type {Config}
export default configLoader
