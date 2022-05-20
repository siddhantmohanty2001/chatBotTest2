const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
let contactController = {
	
	contactUs: async (req, res) => {
		let conversationData = req.body.conversationData;
		console.log(conversationData);
		try {
			let responseObject = [];
			let allSlots = ["askName", "askPhoneNumber", "askEmail"];
			let slotValues = conversationData.slotValues;
			if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			let slotsData = { isSlotGiven: false, slotsAnswered: [] };
			let phoneNumberData = { isGiven: false, verifiedStatus: false, data: null };
			let emailData = { isGiven: false, verifiedStatus: false, isBusinessEmail: false, data: null };
			let nameData = { isGiven: false, data: null };
			if (!conversationData.userDetails) conversationData.userDetails = {};
			if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.contactUs") {
				let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
				return res.status(result.statusCode).json(result);
			}
			for (let key in slotValues) {
				switch (key) {
					case "given-name":
						if (slotValues[key].listValue.values.length !== 0) {
							slotsData.isSlotGiven = true;
							slotsData.slotsAnswered.push("askName");
							conversationData.isNameAsked = false;
							nameData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
							conversationData.userDetails.name = nameData.data;
						}
						break;
					case "email":
						if (slotValues[key].listValue.values.length !== 0) {
							let isBusinessMail = validateBusinessEmail(slotValues[key].listValue.values[0].stringValue);
							let emailVerifiedData = "";
							if (isBusinessMail) emailVerifiedData = await verifyValidEmail(slotValues[key].listValue.values[0].stringValue).then((res)=>{return res}).catch((err)=>{return err})
							//let isValidEmail = verifyValidEmail(slotValues[key].listValue.values[0].stringValue)
							if (!isBusinessMail && emailVerifiedData === "") {
								emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: false, data: slotValues[key].listValue.values[0].stringValue };
							} else {
								if (emailVerifiedData["smtpCheck"] === "true") {
									slotsData.isSlotGiven = true;
									slotsData.slotsAnswered.push("askEmail");
									conversationData.isEmailAsked = false;
									emailData = { isGiven: true, verifiedStatus: true, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
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
								slotsData.isSlotGiven = true;
								conversationData.isPhoneNumberAsked = false;
								slotsData.slotsAnswered.push("askPhoneNumber");
								phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
								conversationData.userDetails.phoneNumber = phoneNumberData.data;
							} else {
								phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
							}
						}
						break;
					case "number" :
							if(slotValues["number"].numberValue !== undefined){
								let phoneVerifiedData = await checkValidPhoneNumber(slotValues["number"].numberValue.toString());
								if (phoneVerifiedData.isValid) {
									slotsData.isSlotGiven = true;
									conversationData.isPhoneNumberAsked = false;
									slotsData.slotsAnswered.push("askPhoneNumber");
									phoneNumberData = { isGiven: true, verifiedStatus: true, data: phoneVerifiedData.data };
									conversationData.userDetails.phoneNumber = phoneNumberData.data;
								} else phoneNumberData = { isGiven: true, verifiedStatus: false, condition: phoneVerifiedData.condition, data: phoneVerifiedData.data };
							}
							break;
				}
			}
			// for (const data of slotsData.slotsAnswered) {
			// 	conversationData.slotsAnswered.push(data);
			// }
            console.log(conversationData.userDetails,"conversationData.userDetails")
			let getSlotAnsweredData = slotData(conversationData.userDetails)
			console.log({getSlotAnsweredData})
			conversationData.slotsAnswered = getSlotAnsweredData
			console.log(slotsData, conversationData.userDetails, conversationData.slotsAnswered);
			if (!slotsData.isSlotGiven) {
				if (conversationData.slotsAnswered.length === 0) {
					conversationData.isNameAsked = true;
					responseObject = integrator.conditionCreater("askName");
					conversationData.previousIntentName = "agent.contactUs";
					conversationData.nameAskedFlag = true;
				} 
				if (conversationData.slotsAnswered.length === 1 && conversationData.slotsAnswered[0] === "askEmail") {	
					conversationData.isNameAsked = true;
					responseObject = integrator.conditionCreater("askName");
					conversationData.previousIntentName = "agent.contactUs";
					conversationData.nameAskedFlag = true;
				}
				if (conversationData.slotsAnswered.length === 2 && 
					conversationData.slotsAnswered.includes("askEmail") && 
					conversationData.slotsAnswered.includes("askUrlToBeEmailed")) {	
					conversationData.isNameAsked = true;
					responseObject = integrator.conditionCreater("askName");
					conversationData.previousIntentName = "agent.contactUs";
					conversationData.nameAskedFlag = true;
				} 
				else {
					let slot = slotFiller(conversationData.slotsAnswered, allSlots);
					if (slot !== "finalMessage") conversationData.slotsAnswered.push(slot);
					if(conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim()
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
						console.log(conversationData.userDetails, "1");
						conversationData.leadInserted = true;
						leadGenaratedLogs(conversationData.userDetails);
						if(conversationData.userDetails.name !== undefined) conversationData.userDetails.name = conversationData.userDetails.name.trim()
						let mailData = mailComposeForSalesTeam(conversationData.userDetails);
						sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
						responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
					} else {
						if (!conversationData.userDetails.name) responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
						else responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
					}
				}
			} else {
				if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus && emailData.isGiven && emailData.isBusinessEmail && emailData.verifiedStatus && nameData.isGiven) {
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
						console.log(conversationData.userDetails, "2");
						conversationData.leadInserted = true;
						leadGenaratedLogs(conversationData.userDetails);
						let mailData = mailComposeForSalesTeam(conversationData.userDetails);
						sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
						let result = integrator.responseCreaetr(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					} else if (slot === "askName") {
						conversationData.nameAskedFlag = true;
						responseObject = integrator.singleValueReplacer(slot, "$userName", "User", "oddMessages");
					}
				} else {
					if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus === false && emailData.isGiven && emailData.verifiedStatus === false && nameData.isGiven) {
						responseObject = integrator.conditionCreater("invalidEmailAndPhone");
						conversationData.previousIntentName = "agent.contactUs";
					}
					if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus === false) {
						responseObject = integrator.conditionCreater(phoneNumberData.condition);
						conversationData.previousIntentName = "agent.contactUs";
					}
					if (emailData.isGiven && emailData.verifiedStatus === false && !emailData.isBusinessEmail && nameData.isGiven) {
						responseObject = integrator.conditionCreater("invalidBusinessEmail");
						conversationData.previousIntentName = "agent.contactUs";
					}
					if (
						emailData.isGiven &&
						emailData.verifiedStatus === false &&
						!emailData.isBusinessEmail &&
						nameData.isGiven &&
						phoneNumberData.isGiven &&
						phoneNumberData.verifiedStatus
					) {
						responseObject = integrator.conditionCreater("invalidBusinessEmail");
						conversationData.previousIntentName = "agent.contactUs";
					}
					if (nameData.isGiven && emailData.verifiedStatus && phoneNumberData.verifiedStatus) {
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
							console.log(conversationData.userDetails, "3");
							conversationData.leadInserted = true;
							leadGenaratedLogs(conversationData.userDetails);
							let mailData = mailComposeForSalesTeam(conversationData.userDetails);
							sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
							let result = integrator.responseCreater(responseObject, conversationData);
							conversationData.previousIntentName = "agent.contactUs";
							return res.status(result.statusCode).json(result);
						}
						responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
					}
					if (phoneNumberData.isGiven && phoneNumberData.verifiedStatus && !nameData.isGiven) {
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
							responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "message");
							console.log(conversationData.userDetails, "4");
							conversationData.leadInserted = true;
							leadGenaratedLogs(conversationData.userDetails);
							let mailData = mailComposeForSalesTeam(conversationData.userDetails);
							sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
							let result = integrator.responseCreater(responseObject, conversationData);
							return res.status(result.statusCode).json(result);
						}
						responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
						let result = integrator.responseCreater(responseObject, conversationData);
						conversationData.previousIntentName = "agent.contactUs";
						return res.status(result.statusCode).json(result);
					}
					if (conversationData.userDetails.name && conversationData.userDetails.phoneNumber && !conversationData.userDetails.email) {
						responseObject = integrator.singleValueReplacer("askEmailWithSlotAdded", "$userName", conversationData.userDetails.name, "oddMessages");
						let result = integrator.responseCreater(responseObject, conversationData);
						conversationData.previousIntentName = "agent.contactUs";
						return res.status(result.statusCode).json(result);
					}
					if (!conversationData.userDetails.name && conversationData.userDetails.phoneNumber && conversationData.userDetails.email) {
						responseObject = integrator.singleValueReplacer("askNameWithSlotAdded", "$userName", "User", "oddMessages");
						let result = integrator.responseCreater(responseObject, conversationData);
						conversationData.previousIntentName = "agent.contactUs";
						return res.status(result.statusCode).json(result);
					}
					if (conversationData.userDetails.name && !conversationData.userDetails.phoneNumber && conversationData.userDetails.email) {
						responseObject = integrator.singleValueReplacer("askPhoneNumberWithSlotAdded", "$userName", conversationData.userDetails.name, "oddMessages");
						let result = integrator.responseCreater(responseObject, conversationData);
						conversationData.previousIntentName = "agent.contactUs";
						return res.status(result.statusCode).json(result);
					}
					if (!nameData.isGiven) {
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
							console.log(conversationData.userDetails, "5");
							conversationData.leadInserted = true;
							leadGenaratedLogs(conversationData.userDetails);
							let mailData = mailComposeForSalesTeam(conversationData.userDetails);
							sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
							let result = integrator.responseCreater(responseObject, conversationData);
							return res.status(result.statusCode).json(result);
						}
						responseObject = integrator.singleValueReplacer(slot, "$userName", conversationData.userDetails.name, "oddMessages");
						conversationData.previousIntentName = "agent.contactUs";
						let result = integrator.responseCreater(responseObject, conversationData);
						return res.status(result.statusCode).json(result);
					}
				}
			}
			conversationData.previousIntentName = "agent.contactUs";
			console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject, conversationData);
			console.log("HELLLLLLLLLLLLLLLLLLLO");
			console.log(result);
			return res.status(result.statusCode).json(result);
		} catch (error) {
			console.log(error);
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	allSlots: ["askName", "askEmail", "askPhoneNumber"],
};


module.exports = contactController;