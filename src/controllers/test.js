const integrator = require("is-integration-provider");
const { verifyValidEmail, checkValidPhoneNumber, validateBusinessEmail } = require("../utils/verifier");
const { slotFiller } = require("../utils/slotFiller");
const { leadGenaratedLogs } = require("../utils/logger");
const { mailComposeForSalesTeam } = require("../utils/mailComposer");
const { sendMail } = require("../utils/mailer");
const { slotData } = require('../utils/supporter')
let testController = {
	
	test: async (req, res) => {
		let conversationData = req.body.conversationData;
		console.log(req.body);
		// const roles=["Program Management","Project Management","Risk Management","Software Quality Management","Configuration Management"]
		const keys = [['Job Profile', 'Vacancy'],['Job Profile', 'Vacancy'],['Job Profile', 'Vacancy'],['Job Profile', 'Vacancy']]
const values = [['Project Management', '3'], ['Risk Management', '2'], ['Program Management', '2'], ['Software Quality Management', '10']]
const title = [['Project Manager'], ['SDE 2'], ['SDE 3'], ['SDE 1']]
		try {
            		
			let responseObject = [];

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
                                                replaceKey: "$title",
												position:"title",
                                                replaceIn: "ticketCard",
                                                replaceValue: title
                                            },
                                            {
                                                replaceKey: "$key",
												position:"key",
                                                replaceIn: "ticketCard",
                                                replaceValue: keys
                                            },
											{
                                                replaceKey: "$value",
												position:"value",
                                                replaceIn: "ticketCard",
                                                replaceValue: values
                                            },
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
	
};


module.exports = testController;
