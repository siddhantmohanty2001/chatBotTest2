const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
let readMoreController = {

    readMore: async(req, res) => {
        let conversationData = req.body.conversationData;
        // // console.log(JSON.stringify(conversationData, null, 4));
        // // console.dir(JSON.stringify(conversationData.slotValues, null, 4));
        // try {
        //     let responseObject = [];
        //     let allSlots = ["serviceType",  "jobProfileType"];
        //     let slotValues = conversationData.slotValues;
        //     // let invalidData = []
        //     if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
        //     let slotsData = { isSlotGiven: false, slotsAnswered: [] };
        //     let serviceTypeData = { isGiven: false,  data: null };
        //     let jobProfileTypeData = { isGiven: false, data: null };
        //     // let phoneNumberData = { isGiven: false, verifiedStatus: false, data: null };
        //     // let emailData = { isGiven: false, verifiedStatus: false, isBusinessEmail: false, data: null };
        //     // let nameData = { isGiven: false, data: null };
        //     // let jobSeekerData = { isGiven: false, data: false };
        //     if (!conversationData.userDetails) conversationData.userDetails = {};
        //     if (conversationData.leadInserted && conversationData.intentNameByCordinator === "agent.readmore") {
        //         let result = integrator.responseCreater(integrator.conditionCreater("leadAlreadyCaptured"), conversationData);
        //         return res.status(result.statusCode).json(result);
        //     }
        //     console.log(slotValues);
        //     for (let key in slotValues) {
        //         console.log({ key })
        //         switch (key) {
        //             case "serviceType":
        //                 console.log("****ServiceType***",JSON.stringify(slotValues[key].listValue.values));
        //                 if (slotValues[key].listValue.values.length !== 0) {
        //                     slotsData.isSlotGiven = true;
        //                     slotsData.slotsAnswered.push("serviceType");
        //                     slotsData.slotsAnswered.push("jobProfileType");
        //                     // conversationData.isNameAsked = false;
        //                     serviceTypeData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
        //                     conversationData.userDetails.serviceType = serviceTypeData.data;
        //                 }
        //                 break;
        //                 case "jobProfileType":
        //                     console.log("****jobProfileType***",JSON.stringify(slotValues[key].listValue.values));
        //                     if (slotValues[key].listValue.values.length !== 0) {
        //                         slotsData.isSlotGiven = true;
        //                         slotsData.slotsAnswered.push("serviceType");
        //                         slotsData.slotsAnswered.push("jobProfileType");
        //                         // conversationData.isNameAsked = false;
        //                         nameData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
        //                         conversationData.userDetails.jobProfileType = jobProfileTypeData.data;
        //                     }
        //                     break;   
        //         }
        //     }
        //     console.log(conversationData.userDetails, "conversationData.userDetails")
        //     let getSlotAnsweredData = slotData(conversationData.userDetails)
        //     console.log({ getSlotAnsweredData })
        //     conversationData.slotsAnswered = getSlotAnsweredData
        //     console.log(slotsData, conversationData.userDetails, conversationData.slotsAnswered);

        //     if (conversationData.slotsAnswered.length === 0) {
		// 		console.log("****Slot answered length 0*****")
        //         conversationData.isjobTypeAsked = true;
        //         // responseObject = integrator.conditionCreater("askName");
        //         conversationData.previousIntentName = "agent.readmore";
        //         conversationData.jobTypeAskedFlag = true;
        //     } else {
		// 		console.log("****Slot answered length greater than 0*****")
        //         res.redirect('/https://www.gurus-inc.com/careers/');
        //         // let toAsk = slotFiller(conversationData.slotsAnswered, allSlots);
        //         // if (invalidData.length == 2) {
        //         //     toAsk = "invalidEmailAndPhone";
        //         // }
        //         // if (invalidData.length == 1) {
        //         //     toAsk = invalidData[0];
        //         // }
        //         conversationData.previousIntentName = "agent.readmore";
        //         // switch (toAsk) {
        //         //     case "askEmail":
        //         //         conversationData.isEmailAsked = true;
        //         //         break;
        //         //     case "askPhoneNumber":
        //         //         conversationData.isNumberAsked=true;
        //         //         break;
        //         //     case "askName":
        //         //         conversationData.isNameAsked = true;
        //         //         break;
        //         // }
        //         // console.log(`before resume ${toAsk}`);
        //         // if (toAsk === "finalMessage" && conversationData.userDetails.jobSeeker && !conversationData.isResumeAsked) {
        //         //     toAsk = "askResume";
        //         //     conversationData.isResumeAsked = true;
        //         //     console.log(`resume ${toAsk}`);
        //         // }
        //         // responseObject = integrator.conditionCreater(toAsk);
        //         // if (toAsk === "finalMessage") {
        //         //     console.log(conversationData.userDetails, "1");
        //         //     conversationData.leadInserted = true;
        //         //     leadGenaratedLogs(conversationData.userDetails);
        //         //     if (conversationData.userDetails.name) conversationData.userDetails.name = conversationData.userDetails.name.trim()
        //         //     let mailData = mailComposeForSalesTeam(conversationData.userDetails);
        //         //     sendMail(mailData.email, mailData.subject, mailData.body, [], conversationData);
        //         //     responseObject = integrator.singleValueReplacer(toAsk, "$userName", conversationData.userDetails.name, "message");
        //         // } else {
        //         //     console.log("wtf is going on!");
        //         //     console.log(toAsk);
        //         //     if (!conversationData.userDetails.name) responseObject = integrator.singleValueReplacer(toAsk, "$userName", "User", "oddMessages");
        //         //     else responseObject = integrator.singleValueReplacer(toAsk, "$userName", conversationData.userDetails.name, "oddMessages");
        //         // }
        //     }
        //     // responseObject = integrator.singleValueReplacer("askResume", "$userName", "derek", "oddMessages");
        //     let result = integrator.responseCreater(responseObject, conversationData);
        //     console.log("data starts");
        //     console.log(JSON.stringify(result.responseObject[0].Data, null, 4));
        //     console.log("data ends");
        //     return res.status(result.statusCode).json(result);
        // } catch (error) {
        //     console.log(error);
        //     console.log("erorrr");
        //     let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
        //     res.status(result.statusCode).json(result);
        // }
    },
    allSlots: ["serviceType",  "jobProfileType"],
};


module.exports = readMoreController;