const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
function extractEmails (text) {
	return text.match(/([a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9_-]+)/gi);
  }
  
let contactController = {
	
	contactUs: async (req, res) => {
		let conversationData = req.body.conversationData;
		console.log(req.body);
		console.log("*****slotValues******",JSON.stringify(conversationData.slotValues));
		let nameMessage=conversationData.userMessage;
		const email=JSON.stringify(conversationData.slotValues).email;
		console.log("*******EMAIL*****",email)
		const name='';
		console.log(email);
		console.log("user message for name here",nameMessage);
		try {

			// // Ask email conditions 
			
			if(!email)
			{
				var responseObject = [];
            
			if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			let slotsData = { isSlotGiven: false, slotsAnswered: [] };

						responseObject = [
                            
            
                                
                                    {
                                        conditions: [
                                            {
                                                "conditionType": "askEmail",
                                                "conditionValue": [conversationData]
                                            }
                                        ],
										replaceMentValues: [
                                          
                                        ]
                                       
                                    }
                                
                            
                        ]
						
			// console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject);
			return res.status(result.statusCode).json(result);
			}
			else if(email) {
				var responseObject = [];
            
			if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			let slotsData = { isSlotGiven: false, slotsAnswered: [] };

						responseObject = [
                            
            
                                
                                    {
                                        conditions: [
                                            {
                                                "conditionType": "askName",
                                                "conditionValue": [conversationData]
                                            }
                                        ],
										replaceMentValues: [
										
                                        ]
                                    }
                                
                            
                        ]
						
			// console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject);
			return res.status(result.statusCode).json(result);
			}
			
			var responseObject = [];
            
			if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			let slotsData = { isSlotGiven: false, slotsAnswered: [] };

						responseObject = [
                            
            
                                
                                    {
                                        conditions: [
                                            {
                                                "conditionType": "condition",
                                                "conditionValue": [conversationData]
                                            }
                                        ],
                                        replaceMentValues: [
                                            {
                                                replaceKey: "$dynamicEmail",
                                                replaceIn: "message",
                                                replaceValue: "user"
                                            }
                                        ]
                                    }
                                
                            
                        ]
						
			// console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject);
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
