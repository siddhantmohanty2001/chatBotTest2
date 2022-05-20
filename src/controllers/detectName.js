const integrator = require("is-integration-provider");
const { slotFiller } = require("../utils/slotFiller");
const { formatName } = require("../utils/verifier");
const { allSlots } = require("./contactUs");
const { leadGenaratedLogs } = require("../utils/logger.js");
const { nameRecognizer } = require("../utils/supporter");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");

let Controller = {
	detectName: async (req, res, next) => {
		let conversationData = req.body.conversationData;
		try {
			let responseObject = [];
			let nameData = nameRecognizer(conversationData);
			console.log(nameData);
			if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.contactUs") {
				let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (!conversationData.userDetails) conversationData.userDetails = {};
			if (conversationData.nameConfirmFlag) {
				conversationData.nameConfirmFlag = false;
				conversationData.nameAskedFlag = false;
				conversationData.slotsAnswered.push("askName");
				conversationData.isNameAsked = false;
				let formattedName = formatName(conversationData.userMessage);
				conversationData.userDetails.name = formattedName;
				let slot = slotFiller(conversationData.slotsAnswered, allSlots);
				switch (slot) {
					case "askEmail":
						conversationData.isEmailAsked = true;
						break;
					case "askPhoneNumber":
						conversationData.isPhoneNumberAsked = true;
						break;
					case "askName":
						conversationData.isNameAsked = true;
						break;
				}
				if (slot === "finalMessage") {
					if(conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim()
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
					console.log(conversationData.userDetails, "7");
					conversationData.leadInserted = true;
					leadGenaratedLogs(conversationData.userDetails);
					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
					sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
					let result = integrator.responseCreater(responseObject, conversationData);
					return res.status(result.statusCode).json(result);
				} else {
					responseObject = integrator.singleValueReplacer(slot, "$userName", formattedName, "oddMessages");
				}
				let result = integrator.responseCreater(responseObject, conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (conversationData.previousIntentName === "agent.contactUs") {
				if (!conversationData.userDetails.name) {
					if (nameData.isNameRecognized && nameData.name !== "") {
						conversationData.nameAskedFlag = false;
						conversationData.userDetails.name = nameData.name;
						conversationData.slotsAnswered.push("askName");
						conversationData.isNameAsked = false;
						console.log(conversationData.slotsAnswered);
						let slot = slotFiller(conversationData.slotsAnswered, allSlots);
						switch (slot) {
							case "askEmail":
								conversationData.isEmailAsked = true;
								break;
							case "askPhoneNumber":
								conversationData.isPhoneNumberAsked = true;
								break;
							case "askName":
								conversationData.isNameAsked = true;
								break;
						}
						if (slot === "finalMessage") {
							if(conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim()
							responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
							console.log(conversationData.userDetails, "8");
							conversationData.leadInserted = true;
							leadGenaratedLogs(conversationData.userDetails);
							let mailData = mailComposeForSalesTeam(conversationData.userDetails);
							sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
							let result = integrator.responseCreater(responseObject, conversationData);
							return res.status(result.statusCode).json(result);
						}
						responseObject = integrator.singleValueReplacer(slot, "$userName", nameData.name, "oddMessages");
						let result = integrator.responseCreater(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					} else {
						conversationData.nameAskedFlag = false;
						conversationData.nameConfirmFlag = true;
						responseObject = integrator.conditionCreater("askConfirmName");
					}
				} else {
					conversationData.slotsAnswered.push("askName");
					conversationData.isNameAsked = true;
					console.log(conversationData.slotsAnswered);
					let slot = slotFiller(conversationData.slotsAnswered, allSlots);
					switch (slot) {
						case "askEmail":
							conversationData.isEmailAsked = true;
							break;
						case "askPhoneNumber":
							conversationData.isPhoneNumberAsked = true;
							break;
						case "askName":
							conversationData.isNameAsked = true;
							break;
					}
					if (slot === "finalMessage") {
						if(conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim()
						responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
						console.log(conversationData.userDetails, "9");
						conversationData.leadInserted = true;
						leadGenaratedLogs(conversationData.userDetails);
						let mailData = mailComposeForSalesTeam(conversationData.userDetails);
						sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
						let result = integrator.responseCreater(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					}
					conversationData.nameAskedFlag = false;
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
				}
			} else {
				if (conversationData.userDetails.name) {
					responseObject = integrator.singleValueReplacer("nameGiven", "$userName", conversationData.userDetails.name, "message");
					let result = integrator.responseCreater(responseObject, conversationData);
					return res.status(result.statusCode).json(result);
				} else {
					if (nameData.isNameRecognized && nameData.name !== "") {
						conversationData.userDetails.name = nameData.name;
						responseObject = integrator.singleValueReplacer("nameGiven", "$userName", conversationData.userDetails.name, "message");
						let result = integrator.responseCreater(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					} else {
						conversationData.name = nameData.name;
						responseObject = integrator.conditionCreater("nameNotDetected");
						let result = integrator.responseCreater(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					}
				}
			}
			let result = integrator.responseCreater(responseObject, conversationData);
			res.status(result.statusCode).json(result);
		} catch (error) {
			console.log(error);
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
};

module.exports = Controller;
