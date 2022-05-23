const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
let contactController = {
	
	test: async (req, res) => {
		let conversationData = req.body.conversationData;
		// console.log(req.body);
		// console.log(conversationData.slotValues);
		let slotValues=conversationData.slotValues;
		console.log("slot values here",slotValues);
		try {
            for (let key in slotValues) {
                console.log({ key })
		
                switch (key) {
                    case "serviceType":
                        console.log("****ServiceType***",JSON.stringify(slotValues[key].listValue.values));
                        if (slotValues[key].listValue.values.length !== 0) {
                            // slotsData.isSlotGiven = true;
                            // slotsData.slotsAnswered.push("serviceType");
                            // slotsData.slotsAnswered.push("jobProfileType");
                            // conversationData.isNameAsked = false;
                            // serviceTypeData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
                            // conversationData.userDetails.serviceType = serviceTypeData.data;
							res.redirect('/https://www.gurus-inc.com/services/');
                        }
                        break;
                        case "jobProfileType":
                            console.log("****jobProfileType***",JSON.stringify(slotValues[key].listValue.values));
                            if (slotValues[key].listValue.values.length !== 0) {
                                // slotsData.isSlotGiven = true;
                                // slotsData.slotsAnswered.push("serviceType");
                                // slotsData.slotsAnswered.push("jobProfileType");
                                // conversationData.isNameAsked = false;
                                // nameData = { isGiven: true, data: slotValues[key].listValue.values[0].stringValue };
                                // conversationData.userDetails.jobProfileType = jobProfileTypeData.data;
								res.redirect('/https://www.gurus-inc.com/careers/');
                            }
                            break;   
                }
            }
			// // Ask email conditions 
			// if(slotValues.given-name.listValue.values.length()>0){
			// 	let slotsData = { isSlotGiven: false, slotsAnswered: [] };
		
			// 			responseObject = [
                            
            
                                
            //                         {
            //                             conditions: [
            //                                 {
            //                                     "conditionType": "askEmail",
            //                                     "conditionValue": [conversationData]
            //                                 }
            //                             ],
                                        
            //                         }
                                
                            
            //             ]
						
			// // console.dir(responseObject, { depth: null, colors: true });
			// let result = integrator.responseCreater(responseObject);
			// return res.status(result.statusCode).json(result);
			// }
			// //confirm name and email
			// else if(slotValues.email.listValue.values.length()>0)
			// {
			// 	let slotsData = { isSlotGiven: false, slotsAnswered: [] };
		
			// 			responseObject = [
                            
            
                                
            //                         {
            //                             conditions: [
            //                                 {
            //                                     "conditionType": "nameEmailConfirm",
            //                                     "conditionValue": [conversationData]
            //                                 }
            //                             ],
                                       
            //                         }
                                
                            
            //             ]
						
			// console.dir(responseObject, { depth: null, colors: true });
			// let result = integrator.responseCreater(responseObject);
			// return res.status(result.statusCode).json(result);
			// }
			// else{
			// 	let slotsData = { isSlotGiven: false, slotsAnswered: [] };
		
			// 			responseObject = [
                            
            
                                
            //                         {
            //                             conditions: [
            //                                 {
            //                                     "conditionType": "askName",
            //                                     "conditionValue": [conversationData]
            //                                 }
            //                             ]
            //                         }
                                
                            
            //             ]
						
			// // console.dir(responseObject, { depth: null, colors: true });
			// let result = integrator.responseCreater(responseObject);
			// return res.status(result.statusCode).json(result);
			// }
			// let responseObject = [];
            
			// if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			// let slotsData = { isSlotGiven: false, slotsAnswered: [] };

			// 			responseObject = [
                            
            
                                
            //                         {
            //                             conditions: [
            //                                 {
            //                                     "conditionType": "condition",
            //                                     "conditionValue": [conversationData]
            //                                 }
            //                             ],
            //                             replaceMentValues: [
            //                                 {
            //                                     replaceKey: "$dynamicEmail",
            //                                     replaceIn: "message",
            //                                     replaceValue: "user"
            //                                 }
            //                             ]
            //                         }
                                
                            
            //             ]
						
			// // console.dir(responseObject, { depth: null, colors: true });
			// let result = integrator.responseCreater(responseObject);
			// return res.status(result.statusCode).json(result);
		} catch (error) {
			console.log(error);
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	// allSlots: ["askName", "askEmail", "askPhoneNumber"],
};


module.exports = contactController;
