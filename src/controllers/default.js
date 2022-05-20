const integrator = require("is-integration-provider");
const { formatName } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { allSlots } = require("./contactUs");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");

let defaultController = {
	defaultFallBack: async (req, res) => {
		let conversationData = req.body.conversationData;
		try {
			let responseObject = [];
			console.log(conversationData, "check conditions that are asked", conversationData.previousIntentName);
			if (conversationData.conditionAsked === "askEmailIdForShareDoc" && conversationData.previousIntentName === "agent.specific.shareSolution") {
				let result = integrator.responseCreater(integrator.conditionCreater("manageUser_Email"), conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.specific.contactUs") {
				let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (!conversationData.userDetails) conversationData.userDetails = {};
			if (conversationData.nameAskedFlag) {
				conversationData.nameAskedFlag = false;
				conversationData.nameConfirmFlag = true;
				let result = integrator.responseCreater(integrator.conditionCreater("askConfirmName"), conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (conversationData.nameConfirmFlag) {
				conversationData.nameConfirmFlag = false;
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
					if (conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim();
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
					console.log(conversationData.userDetails, "6");
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
			// if(conversationData.isNameAsked){
			//     if(conversationData.userDetails.name !== undefined) conversationData.isNameAsked = false;
			//     let result = integrator.responseCreater( integrator.conditionCreater("manageUser_Name"),conversationData);
			//     return res.status(result.statusCode).json(result)
			// }
			// if(conversationData.isEmailAsked){
			//     if(conversationData.userDetails.email !== undefined) conversationData.isEmailAsked = false;
			//     let result = integrator.responseCreater( integrator.conditionCreater("manageUser_Email"),conversationData);
			//     return res.status(result.statusCode).json(result)
			// }
			// if(conversationData.isPhoneNumberAsked){
			//     if(conversationData.userDetails.phoneNumber !== undefined) conversationData.isPhoneNumberAsked = false;
			//     let result = integrator.responseCreater( integrator.conditionCreater("manageUser_PhoneNumber"),conversationData);
			//     return res.status(result.statusCode).json(result)
			// }
			responseObject = integrator.conditionCreater("Default Message");
			console.dir(responseObject, { depth: null, colors: true });
			conversationData.confirmNameByYesNo = true;
			console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject, conversationData);
			res.status(result.statusCode).json(result);
		} catch (error) {
			console.log(error);
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
};

module.exports = defaultController;
