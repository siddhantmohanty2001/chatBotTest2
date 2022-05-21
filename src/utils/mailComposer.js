function mailComposer(userDetails, email, solutionName) {
	console.log(userDetails,email)
	let name = "";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		name = email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	return {
		email,
		subject: `Case Study on ${solutionName}`,
		body: `Hi ${name},<br><br>
              Please find the requested document attached.<br><br>
              Best Regards,<br>
              Guru Inc`
	};
}

// function mailComposerForLink(userDetails, email, solutionName) {
// 	let name = "";
// 	if (userDetails.name !== undefined) name = userDetails.name;
// 	else {
// 		name = email.split("@")[0];
// 		name = name.charAt(0).toUpperCase() + name.slice(1);
// 	}
// 	return {
// 		email,
// 		subject: `Case Study Link of ${solutionName}`,
// 		body: `Hi ${name},<br><br>
//               Please find the requested link attached.<br>
//               ${userDetails.urlToBeEmailed}<br><br>
//               Best Regards,<br>
//               Guru Inc`,
// 	};
// }

function mailComposerForLink(userDetails, email, solutionName) {
	let name = "";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		if(email) name = email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	return {
		email,
		subject: `Please find the more details for the requested info:`,
		body: `Hi,<br><br>
              Please find the requested link attached.<br>
              ${userDetails.urlToBeEmailed}<br><br>
              Best Regards,<br>
              Guru Inc`,
		// body: `Hi ${name},<br><br>
        //       Please find the requested link attached.<br>
        //       ${userDetails.urlToBeEmailed}<br><br>
        //       Best Regards,<br>
        //       Guru Inc`,
	};
}

function mailComposeForSalesTeam(userDetails) {
	let name = "";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		name = userDetails.email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	return {
		email: "bot.leadmanager@gmail.com",
		subject: `Guru Inc - Sales Lead`,
		body: `Hi Team,<br><br>
              Got a new lead now. Find the details below:<br><br>
              <b>Name:</b> ${name}<br>
              <b>Email:</b> ${userDetails.email}<br>
              <b>Phone Number:</b> ${userDetails.phoneNumber}<br><br>
              Thanks,<br>
              Guru Inc`,
	};
}

function mailComposerForIndustries(userDetails, email, industries, url) {
	let name = "";
	let subject = "Read about Kanerika";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		name = email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	if (industries === "Healthcare and Pharma") subject = "The Impact of Digital Transformation in Healthcare";
	else subject = `Impact of Digital Transformation in ${industries}`;
	return {
		email,
		subject,
		body: `Hi ${name},<br><br>
              Greetings. Please find the requested link below:<br>
              ${url}<br><br>
              With regards,<br>
              Guru Inc`,
	};
}

function mailComposerForTechExcellence(userDetails, email, techExcellence, url) {
	let name = "";
	let subject = "";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		name = email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	if (techExcellence === "KOMPASS") subject = `Read More on KOMPASS`;
	else subject = `Read More on ${techExcellence}`;
	return {
		email,
		subject,
		body: `Hi ${name},<br><br>
              Greetings. Please find the requested link below:<br>
              ${url}<br><br>
              With regards,<br>
              Guru Inc`,
	};
}

function mailComposerForGeneral(userDetails, email, filler, url) {
	let name = "";
	let subject = "";
	if (userDetails.name !== undefined) name = userDetails.name;
	else {
		name = email.split("@")[0];
		name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	return {
		email,
		subject: `Read More on ${filler}`,
		body: `Hi ${name},<br><br>
              Greetings. Please find the requested link below:<br>
              ${url}<br><br>
              With regards,<br>
              Guru Inc`,
	};
}

module.exports = { mailComposer, mailComposeForSalesTeam, mailComposerForLink, mailComposerForGeneral, mailComposerForTechExcellence, mailComposerForIndustries };
