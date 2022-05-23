const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("../../orbital-falcon-351112-61a2b69d0022.json");
const doc = new GoogleSpreadsheet("1INBjPK92Y2bzNIhbp2JF_BnypQI1zn8W-ZJrcHYXeHw"); //Guru Inc
function currentTimestamp() {
	let dt = new Date();
	let currentOffSet = 330;
	let timeZoneOffSet = dt.getTimezoneOffset();
	dt = new Date(dt.getTime() + (currentOffSet + timeZoneOffSet) * 60000);
	//console.log(dt);
	return dt;
}

async function solutionLogs(conversationData, body) {
	await doc.useServiceAccountAuth({
		client_email: creds.client_email,
		private_key: creds.private_key,
	});
	let logger = {
		Email: conversationData.email,
		"Viewed Data": body,
		"Mail Status": conversationData.mailStatus,
		Timestamp: currentTimestamp(),
	};
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[1];
	sheet.addRow(logger);
}

async function conversationsLogs(userId, userMessage, intentName, responseObj) {
	await doc.useServiceAccountAuth({
		client_email: creds.client_email,
		private_key: creds.private_key,
	});

	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[2];

	let rowToLog = {
		"User Id": userId,
		"User Message": userMessage,
		"Intent Name": intentName,
		Timestamp: currentTimestamp(),
		"Response Object": JSON.stringify(responseObj),
	};
	console.log(":::::::::::::::::::::::::::::::::::::::::::::");
	console.dir(rowToLog, { depth: null, colors: true });
	// console.dir(JSON.stringify(responseObj), { depth: null, colors: true });
	console.log(":::::::::::::::::::::::::::::::::::::::::::::");

	if (userMessage !== "init") sheet.addRow(rowToLog);
}

async function loaderLogs(userMessage, responseObject) {
	await doc.useServiceAccountAuth({
		client_email: creds.client_email,
		private_key: creds.private_key,
	});

	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[3];
	//console.log(sheet, userMessage);
	const rowToLogInit = {
		"User Message": userMessage,
		Timestamp: currentTimestamp(),
		"Response Object": JSON.stringify(responseObject),
	};
	if (userMessage === "init") {
		sheet.addRow(rowToLogInit);
	}
}

async function analyticsLogs() {
	await doc.useServiceAccountAuth({
		client_email: creds.client_email,
		private_key: creds.private_key,
	});

	await doc.loadInfo();

	let leadsCount = doc.sheetsByIndex[0];
	let mailedCount = doc.sheetsByIndex[1];
	let numberOfConversations = doc.sheetsByIndex[2];
	let loaderCount = doc.sheetsByIndex[3];
	let result = {
		TimeStamp: currentTimestamp(),
		"Lead Count": (await leadsCount.getRows()).length,
		"Mailed Count": (await mailedCount.getRows()).length,
		Conversations: (await numberOfConversations.getRows()).length,
		"Number of Hits": (await loaderCount.getRows()).length,
	};
	return result;
}

async function leadGenaratedLogs(conversationData) {
	try{
		await doc.useServiceAccountAuth({
			client_email: creds.client_email,
			private_key: creds.private_key,
		});
	
		let logger = {
			"Name": conversationData.name,
			"Email": conversationData.email,
			"Timestamp": currentTimestamp(),
			"Phone number": conversationData.phoneNumber,
			"Lead type": "Bot Automation",
			"Description/Message": conversationData.description,
		};
		await doc.loadInfo();
		const sheet = doc.sheetsByIndex[0];
		sheet.addRow(logger);	
	}catch(error){
		console.log({error})
	}
}

module.exports = {
	solutionLogs,
	conversationsLogs,
	loaderLogs,
	analyticsLogs,
	leadGenaratedLogs,
};
