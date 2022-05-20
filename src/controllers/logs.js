const { conversationsLogs, loaderLogs, analyticsLogs, careerLogs } = require("../utils/logger.js");

let logController = {
	conversations: async (req, res) => {
		console.log(req.body, req.query)
		let { userId, userMessage, intentName, responseObject } = req.body;
		await conversationsLogs(userId, userMessage, intentName, responseObject);
		res.status(200).json({ message: "success" });
	},

	loader: async (req, res) => {
		let { userMessage, responseObject } = req.body;
		await loaderLogs(userMessage, responseObject);
		res.status(200).json({ message: "success" });
	},

	analytics: async (req, res) => {
		res.status(200).json({ message: "success", data: await analyticsLogs() });
	},
};

module.exports = logController;
