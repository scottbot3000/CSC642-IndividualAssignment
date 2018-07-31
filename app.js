const express = require('express')
const path = require('path')
const session = require('express-session')
var bodyParser = require('body-parser')
var svgCaptcha = require('svg-captcha');
var NodeGeocoder = require('node-geocoder');
var options = {
	provider: 'google',
	apiKey: 'AIzaSyBJFb4ebK3wNtSWpt83Ha4HUOWaft55GUY',
};
var geocoder = NodeGeocoder(options);

const PORT = process.env.PORT || 5000

function validate(req, res, next) {
	if (req.body.submit === "cancel") {
		next();
	}


	var valid = "is-valid"
	var invalid = "is-invalid"
	//Validate First Name
	if (req.body.firstName == "") {
		req.firstNameValid = invalid;
		req.firstNameMessage = "First Name is a required field.";
	} else if (req.body.firstName.length >= 40) {
		req.firstNameValid = invalid;
		req.firstNameMessage = "First Name must be no more than 40 characters long.";
	} else if (!req.body.firstName.match(/^[a-zA-Z]+$/)) {
		req.firstNameValid = invalid;
		req.firstNameMessage = "First Name must contain only English alphabet characters.";
	} else {
		req.firstNameValid = valid;
	}
	//Validate Last Name
	if (req.body.lastName == "") {
		req.lastNameValid = invalid;
		req.lastNameMessage = "Last Name is a required field.";
	} else if (req.body.lastName.length > 40) {
		req.lastNameValid = invalid;
		req.lastNameMessage = "Last Name must be no more than 40 characters long.";
	} else if (!req.body.lastName.match(/^[a-zA-Z]+$/)) {
		req.lastNameValid = invalid;
		req.lastNameMessage = "Last Name must contain only English alphabet characters.";
	} else {
		req.lastNameValid = valid;
	}
	//Validate Address
	if (req.body.address == "") {
		req.addressValid = invalid;
		req.addressMessage = "Address is a required field.";
	} else if (req.body.address.length > 40) {
		req.addressValid = invalid;
		req.addressMessage = "Address must be no more than 40 characters.";
	} else {
		req.addressValid = valid;
	}
	//Validate education and income
	if (req.body.education === "")
		req.body.education = "Not specified"
	req.educationValid = valid;
	if (req.body.income === "")
		req.body.income = "Not specified"
	req.incomeValid = valid;
	//Validate Phone number
	if (req.body.phone == "") {
		req.phoneValid = invalid;
		req.phoneMessage = "Phone Number is a required field.";
	} else if (!req.body.phone.match(/^[0-9]+$/)) {
		req.phoneValid = invalid;
		req.phoneMessage = "Phone Number must contain only digits. Ex: 1234567";
	} else if (req.body.phone.length != 7) {
		req.phoneValid = invalid;
		req.phoneMessage = "Phone Number must only contain 7 digits. Ex: 1234567";
	} else {
		req.phoneValid = valid;
	}
	//Validate email
	if (req.body.email == "") {
		req.body.email = "Not specified"
		req.emailValid = valid;
	} else if (req.body.email.match(/^[^@]+@[^@\.]+\.[^@\.]+$/)) {
		req.emailValid = valid;
	} else {
		req.emailValid = invalid;
		req.emailMessage = "Email must have a valid format of email@domain.extension"
	}
	//Validate password
	console.log(req.body.password, req.body.passwordRepeat)
	if (req.body.password == "") {
		req.passwordValid = invalid;
		req.passwordRepeatValid = invalid;
		req.passwordMessage = "Password is a required field."
	} else if (req.body.passwordRepeat == "") {
		req.passwordValid = invalid;
		req.passwordRepeatValid = invalid;
		req.passwordRepeatMessage = "Password must be reentered to confirm."
	} else if (req.body.password != req.body.passwordRepeat) {
		req.passwordValid = invalid;
		req.passwordRepeatValid = invalid;
		req.passwordRepeatMessage = "Passwords do not match."
	} else if (req.body.password.length > 40) {
		req.passwordValid = invalid;
		req.passwordRepeatValid = invalid;
		req.passwordMessage = "Passwords must contain no more than 40 characters."
	} else if (!req.body.password.match(/^[0-9a-zA-z]+$/)) {
		req.passwordValid = invalid;
		req.passwordRepeatValid = invalid;
		req.passwordMessage = "Passwords must contain only alphanumeric characters."
	} else {
		req.passwordValid = valid;
		req.passwordRepeatValid = valid;
	}
	//Validate Terms and Conditions
	req.termsValid = (req.body.terms) ? valid : invalid;
	//Validate Captcha
	if (!req.body.captcha) {
		req.body.captcha = ""
	}
	req.captchaValid = (req.session.captcha.toLowerCase() == req.body.captcha.toLowerCase()) ? valid : invalid;

	req.body.isValid = req.firstNameValid == valid &&
		req.lastNameValid == valid &&
		req.addressValid == valid &&
		req.educationValid == valid &&
		req.incomeValid == valid &&
		req.phoneValid == valid &&
		req.emailValid == valid &&
		req.passwordValid == valid &&
		req.passwordRepeatValid == valid &&
		req.termsValid == valid &&
		req.captchaValid == valid;

	console.log(req.body.isValid);
	next();
}

function address(req, res, next) {
	if (req.addressValid == "is-invalid") {next();}
	geocoder.geocode(req.body.address, function(err, res) {
		if (err) {
			console.log(err);
			req.addressValid = "is-invalid";
			req.addressMessage = "Please enter a valid address"
			req.body.isValid = false;
			next();
		} else {
			req.addressValid = "is-valid";
			req.map = res[0];
			next();
		}
	});
}

express()
	.use(session({
		secret: 'csc648-stock-overflow',
		resave: false,
		saveUninitialized: true
	}))
	.use(express.static(path.join(__dirname, 'public')))
	.use(bodyParser.urlencoded({
		extended: false
	}))
	.use(bodyParser.json())
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', function(req, res) {
		var captcha = svgCaptcha.create({
			color: true
		});
		req.session.captcha = captcha.text;
		console.log(captcha.text)
		res.render('pages/index', {
			data: captcha.data,
			//First Name
			firstName: "",
			firstNameValid: "",
			firstNameMessage: "",
			//Last Name
			lastName: "",
			lastNameValid: "",
			lastNameMessage: "",
			//Address
			address: "",
			addressValid: "",
			addressMessage: "",
			//Education and Income
			education: "",
			educationValid: "",
			income: "",
			incomeValid: "",
			//Phone
			phone: "",
			phoneValid: "",
			phoneMessage: "",
			//email
			email: "",
			emailValid: "",
			emailMessage: "",
			//Password
			passwordValid: "",
			passwordMessage: "",
			passwordRepeatValid: "",
			passwordRepeatMessage: "",
			//terms
			termsValid: "",
			//captcha
			captcha: captcha.data,
			captchaValid: ""
		})
	})
	.post('/', validate, address, function(req, res) {

		if (req.body.education === "")
			req.body.education = "Not specified"
		if (req.body.income === "")
			req.body.income = "Not specified"

		if (req.body.submit === "cancel") {
			res.redirect('/')
		} else if (req.body.isValid) {
			res.render('pages/results', {
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				address: req.body.address,
				education: req.body.education,
				income: req.body.income,
				phone: req.body.phone,
				email: req.body.email,
				password: req.body.password,
				map: req.map
			})
		} else {
			var captcha = svgCaptcha.create({
				color: true
			});
			req.session.captcha = captcha.text;
			console.log(captcha.text)



			//These fields must be filled in every time regardless of success on previous submission
			if (req.passwordValid == "is-valid") {
				req.passwordValid = ""
			}
			if (req.passwordRepeatValid == "is-valid") {
				req.passwordRepeatValid = ""
			}
			if (req.captchaValid == "is-valid") {
				req.captchaValid = ""
			}

			res.render('pages/index', {
				//First Name
				firstName: req.body.firstName,
				firstNameValid: req.firstNameValid,
				firstNameMessage: req.firstNameMessage,
				//Last Name
				lastName: req.body.lastName,
				lastNameValid: req.lastNameValid,
				lastNameMessage: req.lastNameMessage,
				//Address
				address: req.body.address,
				addressValid: req.addressValid,
				addressMessage: req.addressMessage,
				//Education and Income
				education: req.body.education,
				educationValid: req.educationValid,
				income: req.body.income,
				incomeValid: req.incomeValid,
				//Phone
				phone: req.body.phone,
				phoneValid: req.phoneValid,
				phoneMessage: req.phoneMessage,
				//email
				email: req.body.email,
				emailValid: req.emailValid,
				emailMessage: req.emailMessage,
				//Password
				passwordValid: req.passwordValid,
				passwordMessage: req.passwordMessage,
				passwordRepeatValid: req.passwordRepeatValid,
				passwordRepeatMessage: req.passwordRepeatMessage,
				//terms
				termsValid: req.termsValid,
				//captcha
				captcha: captcha.data,
				captchaValid: req.captchaValid
			})
		}
	})
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))