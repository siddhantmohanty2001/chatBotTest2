const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const {
	mailComposer,
	mailComposeForSalesTeam,
	mailComposerForLink,
	mailComposerForGeneral,
	mailComposerForTechExcellence,
	mailComposerForIndustries,
} = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotFiller } = require("../utils/slotFiller");
const { allSlots } = require("./contactUs");
const { leadGenaratedLogs } = require("../utils/logger.js");
// const { technologiesExcellence, innovationLabs, urlsForIndustries, digitalCounsulting } = require("./solutions");
const { slotData } = require("../utils/supporter");

let generalQueryController = {
	emailAndPhone: async (req, res) => {
		let conversationData = req.body.conversationData;
		try {
			let responseObject = [];
			//let conversationData = req.body.conversationData;
			if (conversationData.previousIntentName === undefined) conversationData.previousIntentName = "agent.contactUs";
			let slotValues = conversationData.slotValues;
			console.log(JSON.stringify(slotValues));
			let phoneNumberData = { isGiven: false, verifiedStatus: false, data: null };
			let emailData = { isGiven: false, verifiedStatus: false, isBusinessEmail: false, data: null };
			if (!conversationData.userDetails) conversationData.userDetails = {};
			console.log(conversationData.slotsAnswered, "conversationData.slotsAnswered top")
			if (!conversationData.slotsAnswered) conversationData.slotsAnswered = [];
			if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.contactUs") {
				let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);

				return res.status(result.statusCode).json(result);
			}
			for (let key in slotValues) {
				switch (key) {
					case "email":
						if (slotValues[key].listValue.values.length !== 0) {
							console.log(slotValues[key].listValue.values[0].stringValue);
							let isBusinessMail = validateBusinessEmail(slotValues[key].listValue.values[0].stringValue);
							let emailVerifiedData = "";
							if (isBusinessMail) emailVerifiedData = await verifyValidEmail(slotValues[key].listValue.values[0].stringValue).then((res) => { return res }).catch((err) => { return err })
							emailVerifiedData["smtpCheck"] = "true"
							// let isValidEmail = verifyValidEmail(slotValues[key].listValue.values[0].stringValue)
							// console.log(isValidEmail)
							if (emailVerifiedData === "" && !isBusinessMail) {
								emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: false, data: slotValues[key].listValue.values[0].stringValue };
							} else {
								if (emailVerifiedData["smtpCheck"] === "true") {
									emailData = { isGiven: true, verifiedStatus: true, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
									conversationData.isEmailAsked = false;
									conversationData.userDetails.email = emailData.data;
								} else {
									conversationData.invailEmail = true;
									conversationData.discussionWithUserForEmailValidity = true;
									emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
								}
							}
						}
						break;
					case "phone-number":
						if (slotValues[key].listValue.values.length !== 0) {
							let phoneVerifiedData = await checkValidPhoneNumber(slotValues[key].listValue.values[0].stringValue);
							if (phoneVerifiedData.isValid) {
								conversationData.isPhoneNumberAsked = false;
								phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
								conversationData.userDetails.phoneNumber = phoneNumberData.data;
							} else phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
						}
						break;
					case "number":
						if (slotValues["number"].numberValue !== undefined) {
							let phoneVerifiedData = await checkValidPhoneNumber(slotValues["number"].numberValue.toString());
							if (phoneVerifiedData.isValid) {
								conversationData.isPhoneNumberAsked = false;
								phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
								conversationData.userDetails.phoneNumber = phoneNumberData.data;
							} else phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
						}
						break;
				}
			}
			let getSlotAnsweredData = slotData(conversationData.userDetails);
			console.log({ getSlotAnsweredData });
			conversationData.slotsAnswered = getSlotAnsweredData;
			console.log(conversationData.userDetails, conversationData.slotsAnswered);
			if (conversationData.previousIntentName === "agent.contactUs") {
			console.log({ emailData, phoneNumberData })
			if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail) {
				conversationData.slotsAnswered.push("askEmail");
				conversationData.isEmailAsked = false;
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
					console.log(conversationData.userDetails, "10");
					conversationData.leadInserted = true;
					leadGenaratedLogs(conversationData.userDetails);
					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
					sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
					let result = integrator.responseCreater(responseObject, conversationData);
					return res.status(result.statusCode).json(result);
				}
				if (conversationData.userDetails !== undefined)
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
				let result = integrator.responseCreater(responseObject, conversationData);
				return res.status(result.statusCode).json(result);
			}
			if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail && phoneNumberData.isGiven && phoneNumberData.verifiedStatus) {
				conversationData.slotsAnswered.push("askEmail");
				conversationData.isEmailAsked = false;
				conversationData.slotsAnswered.push("askPhoneNumber");
				conversationData.isPhoneNumberAsked = false;
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
					conversationData.leadInserted = true;
					leadGenaratedLogs(conversationData.userDetails);
					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
					sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
					let result = integrator.responseCreater(responseObject, conversationData);

					return res.status(result.statusCode).json(result);
				}
				if (conversationData.userDetails !== undefined)
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
				let result = integrator.responseCreater(responseObject, conversationData);
				return res.status(result.statusCode).json(result);
			} else if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail && !phoneNumberData.isGiven) {
				conversationData.isEmailAsked = false;
				conversationData.slotsAnswered.push("askEmail");
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
					console.log(conversationData.userDetails, "11");
					leadGenaratedLogs(conversationData.userDetails);
					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
					sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
					conversationData.leadInserted = true;
					let result = integrator.responseCreater(responseObject, conversationData);

					return res.status(result.statusCode).json(result);
				}
				if (conversationData.userDetails !== undefined)
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
				let result = integrator.responseCreater(responseObject, conversationData);
				return res.status(result.statusCode).json(result);
			} else if (emailData.isGiven && emailData.verifiedStatus === false && !phoneNumberData.isGiven) {
				if (!emailData.isBusinessEmail) {
					responseObject = integrator.conditionCreater("invalidBusinessEmail");
					let result = integrator.responseCreater(responseObject, conversationData);

					return res.status(result.statusCode).json(result);
				} else {
					responseObject = integrator.conditionCreater("invalidEmail");
					let result = integrator.responseCreater(responseObject, conversationData);

					return res.status(result.statusCode).json(result);
				}
			} else if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus && !emailData.isGiven) {
				conversationData.slotsAnswered.push("askPhoneNumber");
				conversationData.isPhoneNumberAsked = false;
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
					console.log(conversationData.userDetails, "12");
					conversationData.leadInserted = true;
					leadGenaratedLogs(conversationData.userDetails);
					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
					sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
					let result = integrator.responseCreater(responseObject, conversationData);

					return res.status(result.statusCode).json(result);
				}
				if (conversationData.userDetails !== undefined)
					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
				let result = integrator.responseCreater(responseObject, conversationData);

				return res.status(result.statusCode).json(result);
			} else if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus === false && !emailData.isGiven) {
				responseObject = integrator.conditionCreater(phoneNumberData.condition);
				let result = integrator.responseCreater(responseObject, conversationData);

				return res.status(result.statusCode).json(result);
			} else if (emailData.isGiven && emailData.verifiedStatus == false && emailData.isBusinessEmail === false && phoneNumberData.isGiven) {
				conversationData.slotsAnswered.push("askPhoneNumber");
				conversationData.isPhoneNumberAsked = false;
				conversationData.userDetails.phoneNumber = phoneNumberData.data;
				if (!emailData.isBusinessEmail) {
					responseObject = integrator.conditionCreater("invalidBusinessEmail");
					let result = integrator.responseCreater(responseObject, conversationData);
					return res.status(result.statusCode).json(result);
				}
			}
			}else if(conversationData.previousIntentName === "agent.readMore"){
				if (!conversationData.userDetails) conversationData.userDetails = {};
				conversationData.userDetails.urlToBeEmailed = "https://online24x7.net/";
				let mailData = mailComposerForLink(conversationData.userDetails,conversationData?.userDetails?.email);
				sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
				responseObject = integrator.conditionCreater("sendLinkToMail");
			}else{
				responseObject = integrator.conditionCreater("Default response");
			};
			console.log({ responseObject })
			responseObject.map((ele) => {
				console.log(ele.conditions, "conditions");
				console.log(ele.replaceMentValues, "replaceMentValues");
			});
			let result = integrator.responseCreater(responseObject, conversationData);

			res.status(result.statusCode).json(result);
		} catch (e) {
			console.log({ e });
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	skip: async (req, res) => {
		try {
			const conversationData = req?.body?.conversationData;
			if (conversationData.previousIntentName = "agent.contactUs") {
				responseObject = integrator.singleValueReplacer("skipPhoneNo", "$userName", conversationData?.userDetails?.name, "message");
				// delete conversationData?.userDetails;
			} else {
				responseObject = integrator.conditionCreater("Default response");
			};
			let result = integrator.responseCreater(responseObject, conversationData);
			res.status(result.statusCode).json(result);
		} catch (error) {
			const conversationData = req?.body?.conversationData;
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	no: async (req, res) => {
		try {
			const conversationData = req?.body?.conversationData;
			if (conversationData.previousIntentName = "agent.contactUs") {
				responseObject = integrator.singleValueReplacer("skipPhoneNo", "$userName", conversationData?.userDetails?.name, "message");
				// delete conversationData?.userDetails;
			} else {
				responseObject = integrator.conditionCreater("Default response");
			};
			let result = integrator.responseCreater(responseObject, conversationData);
			res.status(result.statusCode).json(result);
		} catch (error) {
			const conversationData = req?.body?.conversationData;
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	readMore: async (req, res) => {
		try {
			const conversationData = req?.body?.conversationData;
			if (!conversationData.userDetails) conversationData.userDetails = {};
			conversationData.userDetails.urlToBeEmailed = "https://online24x7.net/";
			if (conversationData?.userDetails?.email) {
				let mailData = mailComposerForLink(conversationData.userDetails,conversationData?.userDetails?.email);
				sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
				responseObject = integrator.conditionCreater("sendLinkToMail");
			} else {
				responseObject = integrator.conditionCreater("askMail");
				conversationData.previousIntentName = "agent.readMore";
			};
			let result = integrator.responseCreater(responseObject, conversationData);
			res.status(result.statusCode).json(result);
		} catch (error) {
			const conversationData = req?.body?.conversationData;
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	// emailAndPhone: async (req, res) => {
	// 	let conversationData = req.body.conversationData;
	// 	try {
	// 		let responseObject = [];
	// 		//let conversationData = req.body.conversationData;
	// 		if (conversationData.previousIntentName === undefined) conversationData.previousIntentName = "agent.contactUs";
	// 		let slotValues = conversationData.slotValues;
	// 		console.log(JSON.stringify(slotValues));
	// 		let phoneNumberData = { isGiven: false, verifiedStatus: false, data: null };
	// 		let emailData = { isGiven: false, verifiedStatus: false, isBusinessEmail: false, data: null };
	// 		if (!conversationData.userDetails) conversationData.userDetails = {};
	// 		if (!conversationData.slotsAnswered) conversationData.slotsAnswered = [];
	// 		if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.contactUs") {
	// 			let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
	// 			
	// 			return res.status(result.statusCode).json(result);
	// 		}
	// 		for (let key in slotValues) {
	// 			switch (key) {
	// 				case "email":
	// 					if (slotValues[key].listValue.values.length !== 0) {
	// 						console.log(slotValues[key].listValue.values[0].stringValue);
	// 						let isBusinessMail = validateBusinessEmail(slotValues[key].listValue.values[0].stringValue);
	// 						let emailVerifiedData = "";
	// 						if (isBusinessMail) emailVerifiedData = await verifyValidEmail(slotValues[key].listValue.values[0].stringValue).then((res)=>{return res}).catch((err)=>{return err})
	// 						// let isValidEmail = verifyValidEmail(slotValues[key].listValue.values[0].stringValue)
	// 						// console.log(isValidEmail)
	// 						if (emailVerifiedData === "" && !isBusinessMail) {
	// 							emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: false, data: slotValues[key].listValue.values[0].stringValue };
	// 						} else {
	// 							if (emailVerifiedData["smtpCheck"] === "true") {
	// 								emailData = { isGiven: true, verifiedStatus: true, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
	// 								conversationData.isEmailAsked = false;
	// 								conversationData.userDetails.email = emailData.data;
	// 							} else {
	// 								conversationData.invailEmail = true;
	// 								conversationData.discussionWithUserForEmailValidity = true;
	// 								emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
	// 							}
	// 						}
	// 					}
	// 					break;
	// 				case "phone-number":
	// 					if (slotValues[key].listValue.values.length !== 0) {
	// 						let phoneVerifiedData = await checkValidPhoneNumber(slotValues[key].listValue.values[0].stringValue);
	// 						if (phoneVerifiedData.isValid) {
	// 							conversationData.isPhoneNumberAsked = false;
	// 							phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
	// 							conversationData.userDetails.phoneNumber = phoneNumberData.data;
	// 						} else phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
	// 					}
	// 					break;
	// 				case "number":
	// 					if (slotValues["number"].numberValue !== undefined) {
	// 						let phoneVerifiedData = await checkValidPhoneNumber(slotValues["number"].numberValue.toString());
	// 						if (phoneVerifiedData.isValid) {
	// 							conversationData.isPhoneNumberAsked = false;
	// 							phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
	// 							conversationData.userDetails.phoneNumber = phoneNumberData.data;
	// 						} else phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
	// 					}
	// 					break;
	// 			}
	// 		}
	// 		let getSlotAnsweredData = slotData(conversationData.userDetails);
	// 		console.log(getSlotAnsweredData);
	// 		conversationData.slotsAnswered = getSlotAnsweredData;
	// 		console.log(conversationData.userDetails, conversationData.slotsAnswered);
	// 		if (conversationData.previousIntentName === "agent.shareSolution" && conversationData.readOnlineAskedOnIndustries) {
	// 			if (conversationData.readSelector === "Online" && emailData.isGiven) {
	// 				if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 					conversationData.readOnlineAskedOnIndustries = false;
	// 					conversationData.isEmailVerified = true;
	// 					conversationData.userDetails.email = emailData.data;
	// 					conversationData.isEmailAsked = false;
	// 					conversationData.slotsAnswered.push("askEmail");
	// 					conversationData.slotsAnswered;
	// 					let mailData = mailComposerForIndustries(
	// 						conversationData.userDetails,
	// 						emailData.data,
	// 						conversationData.industrySelected,
	// 						""
	// 						// urlsForIndustries[conversationData.industrySelected]
	// 					);
	// 					// // sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					conversationData.askEmailFlag = false;
	// 					responseObject = integrator.conditionCreater("validEmailForIndustries");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (!emailData.isBusinessMail) {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 				} else {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidEmail");
	// 				}
	// 			} else {
	// 				responseObject = integrator.conditionCreater("askEmailAgain");
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.shareSolution" && conversationData.frameworkServicesForReadOnline) {
	// 			if (conversationData.readSelector === "Online" && emailData.isGiven) {
	// 				if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 					conversationData.frameworkServicesForReadOnline = false;
	// 					conversationData.isEmailVerified = true;
	// 					conversationData.userDetails.email = emailData.data;
	// 					conversationData.isEmailAsked = false;
	// 					conversationData.slotsAnswered.push("askEmail");
	// 					conversationData.slotsAnswered;
	// 					let mailData = mailComposerForGeneral(
	// 						conversationData.userDetails,
	// 						emailData.data,
	// 						conversationData.frameworkServices,
	// 						""
	// 						// digitalCounsulting[conversationData.frameworkServices]
	// 					);
	// 					// // sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					conversationData.askEmailFlag = false;
	// 					responseObject = integrator.conditionCreater("validEmailForIndustries");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (!emailData.isBusinessMail) {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 				} else {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidEmail");
	// 				}
	// 			} else {
	// 				responseObject = integrator.conditionCreater("askEmailAgain");
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.shareSolution" && conversationData.technologyExcellenceForReadOnline) {
	// 			if (conversationData.readSelector === "Online" && emailData.isGiven) {
	// 				if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 					conversationData.technologyExcellenceForReadOnline = false;
	// 					conversationData.isEmailVerified = true;
	// 					conversationData.userDetails.email = emailData.data;
	// 					conversationData.isEmailAsked = false;
	// 					conversationData.slotsAnswered.push("askEmail");
	// 					conversationData.slotsAnswered;
	// 					let mailData = mailComposerForTechExcellence(
	// 						conversationData.userDetails,
	// 						emailData.data,
	// 						conversationData.technologyExcellenceGiven,
	// 						""
	// 						// technologiesExcellence[conversationData.technologyExcellenceGiven]
	// 					);
	// 					// // sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					conversationData.askEmailFlag = false;
	// 					responseObject = integrator.conditionCreater("validEmailForKompass");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (!emailData.isBusinessMail) {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 				} else {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidEmail");
	// 				}
	// 			} else {
	// 				responseObject = integrator.conditionCreater("askEmailAgain");
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.shareSolution" && conversationData.innovationServicesForReadOnline) {
	// 			if (conversationData.readSelector === "Online" && emailData.isGiven) {
	// 				if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 					conversationData.innovationServicesForReadOnline = false;
	// 					conversationData.isEmailVerified = true;
	// 					conversationData.userDetails.email = emailData.data;
	// 					conversationData.isEmailAsked = false;
	// 					conversationData.slotsAnswered.push("askEmail");
	// 					conversationData.slotsAnswered;
	// 					let mailData = mailComposerForGeneral(
	// 						conversationData.userDetails,
	// 						emailData.data,
	// 						conversationData.innovationServices,
	// 						""
	// 						// innovationLabs[conversationData.innovationServices]
	// 					);
	// 					// // sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					conversationData.askEmailFlag = false;
	// 					responseObject = integrator.conditionCreater("validEmailForIndustries");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (!emailData.isBusinessMail) {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 				} else {
	// 					conversationData.isEmailVerified = false;
	// 					responseObject = integrator.conditionCreater("invalidEmail");
	// 				}
	// 			} else {
	// 				responseObject = integrator.conditionCreater("askEmailAgain");
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.shareSolution" && conversationData.captureEmailForShareSolution) {
	// 			if (conversationData.readSelector === "PDF") {
	// 				if (emailData.isGiven) {
	// 					if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 						conversationData.captureEmailForShareSolution = false;
	// 						let solutionname = conversationData.solutionName;
	// 						conversationData.isEmailVerified = true;
	// 						conversationData.userDetails.email = emailData.data;
	// 						let attachments = conversationData.solutionSharedPdfAsked;
	// 						conversationData.isEmailAsked = false;
	// 						conversationData.slotsAnswered.push("askEmail");
	// 						conversationData.slotsAnswered;
	// 						let mailData = mailComposer(conversationData.userDetails, emailData.data, solutionname);
	// 						// // sendMail(mailData.email, mailData.subject, mailData.body, attachments, conversationData);
	// 						conversationData.askEmailFlag = false;
	// 						responseObject = integrator.conditionCreater("validEmail");
	// 					} else {
	// 						if (!emailData.isBusinessMail) {
	// 							conversationData.isEmailVerified = false;
	// 							responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 						} else {
	// 							conversationData.isEmailVerified = false;
	// 							responseObject = integrator.conditionCreater("invalidEmail");
	// 						}
	// 					}
	// 				} else {
	// 					responseObject = integrator.conditionCreater("askEmailAgain");
	// 				}
	// 			}
	// 			if (conversationData.readSelector === "Online" && emailData.isBusinessEmail) {
	// 				if (emailData.isGiven) {
	// 					if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 						conversationData.captureEmailForShareSolution = false;
	// 						let solutionname = conversationData.solutionName;
	// 						conversationData.isEmailVerified = true;
	// 						conversationData.userDetails.email = emailData.data;
	// 						conversationData.isEmailAsked = false;
	// 						conversationData.slotsAnswered.push("askEmail");
	// 						conversationData.slotsAnswered;
	// 						let mailData = mailComposerForLink(conversationData.userDetails, emailData.data, solutionname);
	// 						// // sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 						conversationData.askEmailFlag = false;
	// 						responseObject = integrator.conditionCreater("validEmail");
	// 					} else {
	// 						if (!emailData.isBusinessMail) {
	// 							conversationData.isEmailVerified = false;
	// 							responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 						} else {
	// 							conversationData.isEmailVerified = false;
	// 							responseObject = integrator.conditionCreater("invalidEmail");
	// 						}
	// 					}
	// 				} else {
	// 					responseObject = integrator.conditionCreater("askEmailAgain");
	// 				}
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.contactUs") {
	// 			if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 				conversationData.slotsAnswered.push("askEmail");
	// 				conversationData.isEmailAsked = false;
	// 				let slot = slotFiller(conversationData.slotsAnswered, allSlots);
	// 				switch (slot) {
	// 					case "askEmail":
	// 						conversationData.isEmailAsked = true;
	// 						break;
	// 					case "askPhoneNumber":
	// 						conversationData.isPhoneNumberAsked = true;
	// 						break;
	// 					case "askName":
	// 						conversationData.isNameAsked = true;
	// 						break;
	// 				}
	// 				if (slot === "finalMessage") {
	// 					if (conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim();
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
	// 					console.log(conversationData.userDetails, "10");
	// 					conversationData.leadInserted = true;
	// 					leadGenaratedLogs(conversationData.userDetails);
	// 					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
	// 					// sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (conversationData.userDetails !== undefined)
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
	// 				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
	// 				let result = integrator.responseCreater(responseObject, conversationData);
	// 				return res.status(result.statusCode).json(result);
	// 			}
	// 			if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail && phoneNumberData.isGiven && phoneNumberData.verifiedStatus) {
	// 				conversationData.slotsAnswered.push("askEmail");
	// 				conversationData.isEmailAsked = false;
	// 				conversationData.slotsAnswered.push("askPhoneNumber");
	// 				conversationData.isPhoneNumberAsked = false;
	// 				let slot = slotFiller(conversationData.slotsAnswered, allSlots);
	// 				switch (slot) {
	// 					case "askEmail":
	// 						conversationData.isEmailAsked = true;
	// 						break;
	// 					case "askPhoneNumber":
	// 						conversationData.isPhoneNumberAsked = true;
	// 						break;
	// 					case "askName":
	// 						conversationData.isNameAsked = true;
	// 						break;
	// 				}
	// 				if (slot === "finalMessage") {
	// 					if (conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim();
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
	// 					console.log(conversationData.userDetails, "10");
	// 					conversationData.leadInserted = true;
	// 					leadGenaratedLogs(conversationData.userDetails);
	// 					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
	// 					// sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (conversationData.userDetails !== undefined)
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
	// 				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
	// 				let result = integrator.responseCreater(responseObject, conversationData);
	// 				
	// 				return res.status(result.statusCode).json(result);
	// 			} else if (emailData.isGiven && emailData.verifiedStatus && emailData.isBusinessEmail && !phoneNumberData.isGiven) {
	// 				conversationData.isEmailAsked = false;
	// 				conversationData.slotsAnswered.push("askEmail");
	// 				let slot = slotFiller(conversationData.slotsAnswered, allSlots);
	// 				switch (slot) {
	// 					case "askEmail":
	// 						conversationData.isEmailAsked = true;
	// 						break;
	// 					case "askPhoneNumber":
	// 						conversationData.isPhoneNumberAsked = true;
	// 						break;
	// 					case "askName":
	// 						conversationData.isNameAsked = true;
	// 						break;
	// 				}
	// 				if (slot === "finalMessage") {
	// 					if (conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim();
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
	// 					console.log(conversationData.userDetails, "11");
	// 					leadGenaratedLogs(conversationData.userDetails);
	// 					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
	// 					// sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					conversationData.leadInserted = true;
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (conversationData.userDetails !== undefined)
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
	// 				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
	// 				let result = integrator.responseCreater(responseObject, conversationData);
	// 				return res.status(result.statusCode).json(result);
	// 			} else if (emailData.isGiven && emailData.verifiedStatus === false && !phoneNumberData.isGiven) {
	// 				if (!emailData.isBusinessEmail) {
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				} else {
	// 					responseObject = integrator.conditionCreater("invalidEmail");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 			} else if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus && !emailData.isGiven) {
	// 				conversationData.slotsAnswered.push("askPhoneNumber");
	// 				conversationData.isPhoneNumberAsked = false;
	// 				let slot = slotFiller(conversationData.slotsAnswered, allSlots);
	// 				switch (slot) {
	// 					case "askEmail":
	// 						conversationData.isEmailAsked = true;
	// 						break;
	// 					case "askPhoneNumber":
	// 						conversationData.isPhoneNumberAsked = true;
	// 						break;
	// 					case "askName":
	// 						conversationData.isNameAsked = true;
	// 						break;
	// 				}
	// 				if (slot === "finalMessage") {
	// 					if (conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim();
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
	// 					console.log(conversationData.userDetails, "12");
	// 					conversationData.leadInserted = true;
	// 					leadGenaratedLogs(conversationData.userDetails);
	// 					let mailData = mailComposeForSalesTeam(conversationData.userDetails);
	// 					// sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 				if (conversationData.userDetails !== undefined)
	// 					responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
	// 				else responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
	// 				let result = integrator.responseCreater(responseObject, conversationData);
	// 				
	// 				return res.status(result.statusCode).json(result);
	// 			} else if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus === false && !emailData.isGiven) {
	// 				responseObject = integrator.conditionCreater(phoneNumberData.condition);
	// 				let result = integrator.responseCreater(responseObject, conversationData);
	// 				
	// 				return res.status(result.statusCode).json(result);
	// 			} else if (emailData.isGiven && emailData.verifiedStatus == false && emailData.isBusinessEmail === false && phoneNumberData.isGiven) {
	// 				conversationData.slotsAnswered.push("askPhoneNumber");
	// 				conversationData.isPhoneNumberAsked = false;
	// 				conversationData.userDetails.phoneNumber = phoneNumberData.data;
	// 				if (!emailData.isBusinessEmail) {
	// 					responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 					let result = integrator.responseCreater(responseObject, conversationData);
	// 					
	// 					return res.status(result.statusCode).json(result);
	// 				}
	// 			}
	// 		}
	// 		if (conversationData.previousIntentName === "agent.showSolutions") {
	// 			if (emailData.isGiven) {
	// 				if (emailData.verifiedStatus && emailData.isBusinessEmail) {
	// 					let solutionname = conversationData.solutionName;
	// 					conversationData.isEmailVerified = true;
	// 					conversationData.userDetails.email = emailData.data;
	// 					let attachments = conversationData.solutionSharedPdfAsked;
	// 					conversationData.isEmailAsked = false;
	// 					conversationData.slotsAnswered.push("askEmail");
	// 					conversationData.slotsAnswered;
	// 					let mailData = mailComposer(conversationData.userDetails, emailData.data, solutionname);
	// 					// sendMail(mailData.email, mailData.subject, mailData.body, attachments, conversationData);
	// 					conversationData.askEmailFlag = false;
	// 					responseObject = integrator.conditionCreater("validEmail");
	// 				} else {
	// 					if (!emailData.isBusinessMail) {
	// 						conversationData.isEmailVerified = false;
	// 						responseObject = integrator.conditionCreater("invalidBusinessEmail");
	// 					} else {
	// 						conversationData.isEmailVerified = false;
	// 						responseObject = integrator.conditionCreater("invalidEmail");
	// 					}
	// 				}
	// 			} else {
	// 				responseObject = integrator.conditionCreater("askEmailAgain");
	// 			}
	// 		}
	// 		responseObject.map((ele) => {
	// 			console.log(ele.conditions, "conditions");
	// 			console.log(ele.replaceMentValues, "replaceMentValues");
	// 		});
	// 		let result = integrator.responseCreater(responseObject, conversationData);
	// 		
	// 		res.status(result.statusCode).json(result);
	// 	} catch (e) {
	// 		console.log(e);
	// 		let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
	// 		res.status(result.statusCode).json(result);
	// 	}
	// },
};

module.exports = generalQueryController;
