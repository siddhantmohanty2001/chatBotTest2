async function commonResponse(success, statusCode, statusMessage, data) {
	const responseObject = {
		success,
		statusCode,
		statusMessage,
		data,
	};
	return responseObject;
}

async function phoneValidater(key, values) {
	if (key === "phone-number") {
		const startingNumberValidation = /^[6789]/;
		const tenDigitNumber = /d{9}$/;
		const phoneno = /^[0]?[6789]\d{9}$/;
		const phoneNumber = values[0];
		let resultFlag = false;
		if (phoneNumber.match(phoneno)) {
			resultFlag = true;
		} else if (!phoneNumber.match(startingNumberValidation)) {
			resultFlag = false;
			return { resultFlag, condition: "wrongPhoneNoStartingDigits" };
		} else if (!phoneNumber.match(tenDigitNumber)) {
			resultFlag = false;
			return { resultFlag, condition: "wrongPhoneNoDigits" };
		}
		return {
			success: resultFlag,
			condition: "phoneNumberPresent",
		};
	}
}

module.exports = { commonResponse, phoneValidater };
