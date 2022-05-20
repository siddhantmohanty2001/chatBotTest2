// function getIconUrl(condition){
//     let url = "";
//     let baseUrl = `https://polynomialservices.blob.core.windows.net/stores/`;
//     switch(condition){
//         case "About us": url = `${baseUrl}bot (1).png`;break;
//         case "readMore": url = `${baseUrl}readMoress.png`;break;
//         case "solutions": url = `${baseUrl}solutions1.png`;break;
//         case "services" : url = `${baseUrl}service.jpg`;break;
//         case "Why kanerika?" : url = `${baseUrl}bot (1).png`;break;
//         case "readByUrl": url = "";break;
//         case "Core Values" : url = `${baseUrl}corevalues.png`;break;
//         case "Carrers" : url = `${baseUrl}careers.jpg`;break;
//         case "Reach us" : url =`${baseUrl}contact-use.png`;break;
//         case "Data Management":url = `${baseUrl}3-icons-2_optimized-1.png`;break;
//         case "AI & ML":url = `${baseUrl}3-icons-4_optimized.png`;break;
//         case "Business Intelligence":url = `${baseUrl}3-icons-1_optimized.png`;break;
//         case "Data Analytics":url = `${baseUrl}2-icons-3_optimized (1).png`;break;
//         case "Product Engineering":url = `${baseUrl}3-icons-6_optimized.png`;break;
//         case "Remote Process Automation":url = `${baseUrl}3-icons-5_optimized.png`;break;
//         case "Data Governance for Security Compliance":url = `${baseUrl}DataGovernanceforSecurity.png`;break;
//         case "Dr. Reddys" : url = `${baseUrl}Reddy's.png`;break;
//         case "Global Healthcare Provider":url = `${baseUrl}healthCare.png`;break;
//         case "Global Digital Healthcare Leader":url = `${baseUrl}healthCare1.png`;break;
//         case "IPTV Network Provider":url = `${baseUrl}iptv.png`;break;
//         case "Leading AgroManufracturer":url = `${baseUrl}agro.png`;break;
//         case "Leading Retail Chain":url = `${baseUrl}retails.png`;break;
//         case "Sealink Travel Group":url = `${baseUrl}travel.png`;break;
//         case "Trax":url = `${baseUrl}trax.png`;break;
//         case "Power BI":url = `${baseUrl}PowerBI-Icon-Transparent.png`;break;
//         case "Mission of kanerika":url = `${baseUrl}mission.png`;break;
//         case "Vision of kanerika": url =`${baseUrl}vision.jpg`;break;
//         default : url = `${baseUrl}solutions1.png`;
//     }
//     return url;
// }

function getDynamicReplies(data, justAnswered) {
	let suggestion = [];
	for (const values of data) {
		if (!values.flag) {
			suggestion.push(values);
		}
	}
	if (suggestion.length >= 2) {
		let plainQuickReplies = [];
		if (justAnswered === "Remote Process Automation") {
			plainQuickReplies.push({ text: `Case Studies`, value: `Case Studies` });
		} else {
			if (justAnswered === "Business Intelligence") justAnswered = "BI";
			plainQuickReplies.push({ text: `Case Studies on ${justAnswered}`, value: `Case Studies Related to ${justAnswered}` });
		}
		for (let i = 0; i < 2; i++) {
			let modifiedName = suggestion[i].serviceName;
			if (modifiedName === "Remote Process Automation") modifiedName = "RPA Services";
			if (modifiedName === "Business Intelligence") modifiedName = "BI Services";
			plainQuickReplies.push({
				text: modifiedName,
				value: suggestion[i].serviceName,
			});
		}
		return plainQuickReplies;
	} else {
		let plainQuickReplies = [];
		if (justAnswered === "Remote Process Automation") plainQuickReplies.push({ text: `Case Studies`, value: `Case Studies` });
		else plainQuickReplies.push({ text: `Case Studies on ${justAnswered}`, value: `Case Studies related to ${justAnswered}` });
		for (const data of suggestion) {
			let modifiedName = data.serviceName;
			if (modifiedName === "Remote Process Automation") modifiedName = "RPA Services";
			if (modifiedName === "Business Intelligence") modifiedName = "BI Services";
			plainQuickReplies.push({
				text: modifiedName,
				value: data.serviceName,
			});
		}
		return plainQuickReplies;
	}
}

function getDynamicRepliesForServices(service) {
	let plainQuickReplies = [];
	if (service === "Data Management") {
		plainQuickReplies.push({ text: `Data Governance `, value: `Case Studies on Data Governance for Security Compliance` });
		plainQuickReplies.push({ text: `Trax`, value: `Case Studies on Trax Technologies` });
	}
	if (service === "Data Analytics") {
		plainQuickReplies.push({ text: `Dr. Reddy’s`, value: `Case Studies on Dr. Reddy’s` });
		plainQuickReplies.push({ text: `AgroManufacturer`, value: `Case Studies on Leading Agro Manufacturer` });
		plainQuickReplies.push({ text: `Retail Chain`, value: `Case Studies on Leading Retail Chain` });
		plainQuickReplies.push({ text: `Sealink`, value: `Case Studies on Sealink Travel Group` });
	}
	if (service === "Product Engineering") {
		plainQuickReplies.push({ text: `IPTV Network`, value: `Case Studies on IPTV Network Provider` });
		plainQuickReplies.push({ text: `Power BI`, value: `Case Studies on Power BI` });
	}
	if (service === "Business Intelligence") {
		plainQuickReplies.push({ text: `Sealink`, value: `Case Studies on Sealink Travel Group` });
		plainQuickReplies.push({ text: `Healthcare Provider`, value: `Case Studies on Global Healthcare Provider` });
		plainQuickReplies.push({ text: `Digital Healthcare`, value: `Case Studies on Global Digital Healthcare Leader` });
	}
	if (service === "AI & ML") {
		plainQuickReplies.push({ text: `Dr. Reddy’s`, value: `Case Studies on Dr. Reddy’s` });
		plainQuickReplies.push({ text: `Retail Chain`, value: `Case Studies on Leading Retail Chain` });
	}
	return plainQuickReplies;
}

function getSolutionsDynamicReplies(data) {
	let suggestion = [];
	let plainQuickReplies = [];
	for (const values of data) {
		if (!values.flag) {
			suggestion.push(values);
		}
	}
	for (const solutionActions of suggestion) {
		let modifiedName = solutionActions.solutionName;
		if (modifiedName === "Data Governance for Security Compliance") modifiedName = "Data Governance";
		if (modifiedName === "Global Healthcare Provider") modifiedName = "Healthcare Provider";
		if (modifiedName === "Global Digital Healthcare Leader") modifiedName = "Healthcare Leader";
		if (modifiedName === "The Leading Retail Chain") modifiedName = "Retail Chain";
		if (modifiedName === "IPTV Network Provider") modifiedName = "IPTV Network";
		if (modifiedName === "Sealink Travel Group") modifiedName = "Sealink";
		if (modifiedName === "Leading AgroManufacturer") modifiedName = "Agro Manufacturer";
		plainQuickReplies.push({
			text: modifiedName,
			value: `Case Studies on ${solutionActions.solutionName}`,
		});
	}
	return plainQuickReplies;
}

function dynamicRepliesForServices(condition) {
	let plainQuickReplies = [];
	switch (condition) {
		case "KOMPASS":
			plainQuickReplies.push({ text: `Benefits of Kompass`, value: `Benefits of Kompass` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text: "Case Studies", value: `Case Studies` });
			plainQuickReplies.push({ text :"Partners", value: "Partners"});
			plainQuickReplies.push({ text: `Reach Us`, value: `Reach Us` });
			break;
		case "Business Intelligence":
			plainQuickReplies.push({ text: `Read More`, value: `Read online on Business Intelligence and Analytics` });
			plainQuickReplies.push({ text: `Case Studies on BI and Analytics`, value: `Case Studies on BI and Analytics` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text :"Partners", value: "Partners"});
			plainQuickReplies.push({ text: `Reach Us`, value: `Reach Us` });
			break;
		case "Data Management":
			plainQuickReplies.push({ text: `Read More`, value: `Read online on ${condition}` });
			plainQuickReplies.push({ text: `Case Studies on Data Mangement`, value: `Case Studies on Data Mangement` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text: "Reach Us", value: `Reach us` });
			plainQuickReplies.push({ text: "Partners", value: `Partners` });
			break;
	    case "productEngineering":
			plainQuickReplies.push({ text: `Services`, value: `Services` });
			plainQuickReplies.push({ text: `Case Studies on Product Engineering`, value: `Case studies on Product Engineering` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text: "Reach Us", value: `Reach us` });
			plainQuickReplies.push({ text: "Partners", value: `Partners` });
			break;
		case "AI&ML":
			plainQuickReplies.push({ text: `Services`, value: `Services` });
			plainQuickReplies.push({ text: `Case Studies on AI & ML`, value: `Case studies on AI & ML` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text: "Reach Us", value: `Reach us` });
			plainQuickReplies.push({ text: "Partners", value: `Partners` });
			break;
		default:
			plainQuickReplies.push({ text: `Read More`, value: `Read online on ${condition}` });
			plainQuickReplies.push({ text: "Case Studies", value: `Case Studies` });
			plainQuickReplies.push({ text: `Industries`, value: `Industries` });
			plainQuickReplies.push({ text :"Partners", value: "Partners"});
			plainQuickReplies.push({ text: "Reach Us", value: "Reach us" });
	}
	return plainQuickReplies;
}

function getSuggestionForIndustries(industries) {
	let plainQuickReplies = [];
	switch (industries) {
		case "Logistics and Supply Chain":
			plainQuickReplies.push({ text: `Trax`, value: `Case study on Trax Technologies` });
			plainQuickReplies.push({ text: `Sealink`, value: `Case study on Sealink Travel Group` });
			break;
		case "Manufacturing":
			plainQuickReplies.push({ text: `Data Governance `, value: `Case study on  Data Governance for Security Compliance` });
			plainQuickReplies.push({ text: `AgroManufacturer`, value: `Case study on  Leading Agro Manufacturer` });
			break;
		case "Retail and FMCG":
			plainQuickReplies.push({ text: `Retail Chain`, value: `Case study on Leading Retail Chain` });
			break;
		case "Telecom":
			plainQuickReplies.push({ text: `IPTV Network`, value: `Case study on IPTV Network Provider` });
			break;
		case "Healthcare and Pharma":
			plainQuickReplies.push({ text: "Dr. Reddy's", value: "Case study on Dr.Reddy's" });
			plainQuickReplies.push({ text: `Healthcare Provider`, value: `Case study on Global Healthcare Provider` });
			plainQuickReplies.push({ text: `Digital Healthcare`, value: `Case study on Global Digital Healthcare Leader` });
			break;
		default:
			plainQuickReplies.push({ text: "Reach us", value: "Reach us" });
	}
	return plainQuickReplies;
}

module.exports = { getDynamicReplies, getDynamicRepliesForServices, getSolutionsDynamicReplies, dynamicRepliesForServices, getSuggestionForIndustries };
