function nameRecognizer(conversationData) {
	let nameData = { isNameRecognized: false, name: "" };
	if (conversationData.slotValues["given-name"].listValue.values.length !== 0) {
		if (conversationData.slotValues["given-name"].listValue.values[0].stringValue !== "") {
			nameData.isNameRecognized = true;
			conversationData.isNameAsked = false;
			let name = conversationData.slotValues["given-name"].listValue.values[0].stringValue;
			let formatname = name.charAt(0).toUpperCase() + name.slice(1);
			nameData.name = formatname;
			return nameData;
		}
	} else {
		return nameData;
	}
}

function slotData(details){
	console.log({details})
	if(Object.keys(details).length === 0 && details.constructor === Object) return []
	else{
		let givenSlots = Object.keys(details);
		let slotArray = []
		for (const key of givenSlots) {
			slotArray.push(`ask${key.charAt(0).toUpperCase() + key.slice(1)}`)
		}
		return slotArray
	}
}

module.exports = { nameRecognizer,slotData };
