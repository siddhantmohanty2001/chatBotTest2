const Verifier = require("email-verifier");
const emailValidtaor = require("email-validator");
let verifier = new Verifier("at_xqc0qsyZ444nJLdlZNuFo85np3r1f");
let verifier1 = new Verifier("at_kigsyQNvhgWBQ73Kr6JTXwwfbgTx0");
let verifier2 = new Verifier("at_A7NCfFfHB5k74Y2xVWdDmVWuFt3ve");
//at_A7NCfFfHB5k74Y2xVWdDmVWuFt3ve ===> 844 avaliable // email : ravikiran.d@polynomial.ai
//at_kigsyQNvhgWBQ73Kr6JTXwwfbgTx0  ===> 990 avaliable // email : ravikiranmd7090@gmail.com
//at_xqc0qsyZ444nJLdlZNuFo85np3r1f  ===> 1000 avaliable // email : ravikiranmd8660@gmail.com

async function verifyValidEmail(email) {
	try {
		return new Promise((resolve, reject) => {
			verifier.verify(email, async(err, data) => {
				if(err) {
					let result = await verifyValidEmailBackup1(email).then((res)=>{return res}).catch((err)=>{return err})
					reject(result)
				}
				else{
					resolve(data);
				}
			});
		});
	} catch (e) {
		return new Promise((resolve, reject) => {
			verifier1.verify(email, (err, data) => {
				if (err) reject(err);
				resolve(data);
			});
		});
	}
}

async function verifyValidEmailBackup1(email){
	return new Promise((resolve, reject) => {
		verifier1.verify(email,async(err, data) => {
			if(err) {
				let result = await verifyValidEmailBackup2(email).then((res)=>{return res}).catch((err)=>{return err})
				reject(result)
			}
			else{
				resolve(data);
			}
		});
	});
}

async function verifyValidEmailBackup2(email){
	return new Promise((resolve, reject) => {
		verifier2.verify(email, (err, data) => {
			if (err) reject({emailAddress: email, smtpCheck: emailValidtaor.validate(email).toString()});
			resolve(data);
		});
	});
}
// function verifyValidEmail(email){
//     return emailValidtaor.validate(email);
// }

function checkValidPhoneNumber(phoneNumber) {
	//const startingNumberValidation = /^[67890]/;
	if(phoneNumber.includes("+e") || phoneNumber.includes("e+")) {
		return { isValid: false, condition: "phoneTotalDigits", data: null };
	}
	else{
		let verifiedData = { isValid: false, condition: "", data: null };
		if (phoneNumber.length > 7 && phoneNumber.length <= 15) {
			verifiedData.isValid = true;
			(verifiedData.condition = "Valid"), (verifiedData.data = phoneNumber);
		} 
		//else if (!phoneNumber.match(startingNumberValidation)) {
		// 	verifiedData.isValid = false;
		// 	verifiedData.condition = "phoneStartingDigits";
		// } 
		if (phoneNumber.length > 15) {
			verifiedData.isValid = false;
			verifiedData.condition = "phoneTotalDigits";
		} 
		if (phoneNumber.length <= 7) {
			verifiedData.isValid = false;
			verifiedData.condition = "phoneLessDigits";
		}
		return verifiedData;
	}
}

function formatName(name) {
	let nameSplitted = name.split(" ");
	nameSplitted = nameSplitted.filter(
		(ele) =>
			ele.toLowerCase() !== "my" &&
			ele.toLowerCase() !== "name" &&
			ele.toLowerCase() !== "is" &&
			ele.toLowerCase() !== "the" &&
			ele.toLowerCase() !== "here" &&
			ele.toLowerCase() !== "are" &&
			ele.toLowerCase() !== "i" &&
			ele.toLowerCase() !== "am" &&
			ele.toLowerCase() !== "i'am" &&
			ele.toLowerCase() !== "this"
	);

	return nameSplitted.join(" ");
}

function validateBusinessEmail(email) {
	// let getDomain = email.split("@")[1].split(".")[0];
	// console.log(getDomain);
	// if (getDomain === "gmail"){
	// 	return false;
	// }
	// else if( getDomain.length <= 1) return false
	// else return true;
	return emailValidtaor.validate(email);
}

module.exports = { verifyValidEmail, checkValidPhoneNumber, formatName, validateBusinessEmail };
