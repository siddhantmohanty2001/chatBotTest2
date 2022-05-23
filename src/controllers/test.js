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
		console.log(req.body);
		const roles=["Program Management","Project Management","Risk Management","Software Quality Management","Configuration Management"]
		try {
            
		
		
			let responseObject = [];
            
			// if (!Array.isArray(conversationData.slotsAnswered)) conversationData.slotsAnswered = [];
			// let slotsData = { isSlotGiven: false, slotsAnswered: [] };

						responseObject = [
                            
            
                                
                                    {
                                        conditions: [
                                            {
                                                "conditionType": "Role",
                                                "conditionValue": [conversationData]
                                            }
                                        ],
                                        replaceMentValues: [
                                            {
                                                replaceKey: "$Role",
                                                replaceIn: "message",
                                                replaceValue: roles
                                            }
                                        ]
                                    }
                                
                            
                        ]
						
			// // console.dir(responseObject, { depth: null, colors: true });
			let result = integrator.responseCreater(responseObject);
			return res.status(result.statusCode).json(result);
		} catch (error) {
			console.log(error);
			let result = integrator.responseCreater(integrator.conditionCreater("Default response"), conversationData);
			res.status(result.statusCode).json(result);
		}
	},
	// allSlots: ["askName", "askEmail", "askPhoneNumber"],
};


module.exports = contactController;
