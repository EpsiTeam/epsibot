module.exports = ({
	adminOnly = false,
	autoDelete = false,
	response = ""
}) => {
	return {
		adminOnly,
		autoDelete,
		response,

		execute({msg, args}) {
			let argResponse = this.response;
			for (let i = 0; i < 5; i++) {
				argResponse = argResponse.replaceAll(`$${i}`, args[i]);
			}

			return msg.channel.send(argResponse);
		}
	}
};