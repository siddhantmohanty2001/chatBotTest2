const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
let contactController = {

    contactUs: async(req, res) => {
        let conversationData = req.body.conversationData;
        // console.log(JSON.stringify(conversationData, null, 4));
        // console.dir(JSON.stringify(conversationData.slotValues, null, 4));
        try {
            let responseObject = [];
            let allSlots = ["askName",  "askEmail"];
            let slotValues = conversationData.slotValues;
            let invalidData = []
            if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
            let slotsData = { isSlotGiven: false, slotsAnswered: [] };
            // let phoneNumberData = { isGiven: false, verifiedStatus: false, data: null };
            let emailData = { isGiven: false, verifiedStatus: false, isBusinessEmail: false, data: null };
            let nameData = { isGiven: false, data: null };
            // let jobSeekerData = { isGiven: false, data: false };
            if (!conversationData.userDetails) conversationData.userDetails = {};
            if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.contactUs") {
                let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
                return res.status(result.statusCode).json(result);
            }
            console.log(slotValues);
            for (let key in slotValues) {
                console.log({ key })
                switch (key) {
                    case "given-name":
                        console.log("****NAME***",JSON.stringify(slotValues[key].listValue.values));
                        if (slotValues[key].listValue.values.length !== 0) {
                            slotsData.isSlotGiven = true;
                            slotsData.slotsAnswered.push("askName");
                            conversationData.isNameAsked = false;
                            nameData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
                            conversationData.userDetails.name = nameData.data;
                        }
                        break;
                    case "email":
						console.log("****EMAIL***",JSON.stringify(slotValues[key].listValue.values));
                        if (slotValues[key].listValue.values.length !== 0) {
                            let isBusinessMail = validateBusinessEmail(slotValues[key].listValue.values[0].stringValue);
                            let emailVerifiedData = "";
                            if (isBusinessMail) emailVerifiedData = await verifyValidEmail(slotValues[key].listValue.values[0].stringValue).then((res) => { return res }).catch((err) => { return err })
                                //let isValidEmail = verifyValidEmail(slotValues[key].listValue.values[0].stringValue)
                            if (!isBusinessMail) {
                                invalidData.push("invalidBusinessEmail");
                                emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: false, data: slotValues[key].listValue.values[0].stringValue };
                            } else {
                                if (emailVerifiedData["smtpCheck"] === "true") {
                                    slotsData.isSlotGiven = true;
                                    slotsData.slotsAnswered.push("askEmail");
                                    conversationData.isEmailAsked = false;
                                    emailData = { isGiven: true, verifiedStatus: true, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
                                    conversationData.userDetails.email = emailData.data;
                                } else {
                                    console.log("here");
                                    conversationData.invailEmail = true;
                                    conversationData.discussionWithUserForEmailValidity = true;
                                    emailData = { isGiven: true, verifiedStatus: false, isBusinessEmail: true, data: slotValues[key].listValue.values[0].stringValue };
                                }
                            }
                        }
                        break;
                    
                    
                }
            }
            console.log(conversationData.userDetails, "conversationData.userDetails")
            let getSlotAnsweredData = slotData(conversationData.userDetails)
            console.log({ getSlotAnsweredData })
            conversationData.slotsAnswered = getSlotAnsweredData
            console.log(slotsData, conversationData.userDetails, conversationData.slotsAnswered);

            if (conversationData.slotsAnswered.length === 0) {
				console("****Slot answered length 0*****")
                conversationData.isNameAsked = true;
                responseObject = integrator.conditionCreater("askName");
                conversationData.previousIntentName = "agent.contactUs";
                conversationData.nameAskedFlag = true;
            } else {
				console("****Slot answered length greater than 0*****")
                let toAsk = slotFiller(conversationData.slotsAnswered, allSlots);
                if (invalidData.length == 2) {
                    toAsk = "askEmail";
                }
                if (invalidData.length == 1) {
                    toAsk = invalidData[0];
                }
                conversationData.previousIntentName = "agent.contactUs";
                switch (toAsk) {
                    case "askEmail":
                        conversationData.isEmailAsked = true;
                        break;
                   
                    case "askName":
                        conversationData.isNameAsked = true;
                        break;
                }
                // console.log(`before resume ${toAsk}`);
                // if (toAsk === "finalMessage" && conversationData.userDetails.jobSeeker && !conversationData.isResumeAsked) {
                //     toAsk = "askResume";
                //     conversationData.isResumeAsked = true;
                //     console.log(`resume ${toAsk}`);
                // }
                // responseObject = integrator.conditionCreater(toAsk);
                if (toAsk === "finalMessage") {
                    console.log(conversationData.userDetails, "1");
                    conversationData.leadInserted = true;
                    leadGenaratedLogs(conversationData.userDetails);
                    if (conversationData.userDetails.name) conversationData.userDetails.name = conversationData.userDetails.name.trim()
                    let mailData = mailComposeForSalesTeam(conversationData.userDetails);
                    sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
                    responseObject = integrator.singleValueReplacer(toAsk, "$userName", conversationData.userDetails.name, "message");
                } else {
                    console.log("wtf is going on!");
                    console.log(toAsk);
                    if (!conversationData.userDetails.name) responseObject = integrator.singleValueReplacer(toAsk, "$userName", "User", "oddMessages");
                    else responseObject = integrator.singleValueReplacer(toAsk, "$userName", conversationData.userDetails.name, "oddMessages");
                }
            }
            // responseObject = integrator.singleValueReplacer("askResume", "$userName", "derek", "oddMessages");
            let result = integrator.responseCreater(responseObject, conversationData);
            console.log("data starts");
            console.log(JSON.stringify(result.responseObject[0].Data, null, 4));
            console.log("data ends");
            return res.status(result.statusCode).json(result);
        } catch (error) {
            console.log(error);
            console.log("erorrr");
            let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
            res.status(result.statusCode).json(result);
        }
    },
    allSlots: ["askName", "askEmail"],
};


module.exports = contactController;