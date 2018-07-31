const express = require('express')
const path = require('path')
const session = require('express-session')
var bodyParser = require('body-parser')
var svgCaptcha = require('svg-captcha');

const PORT = process.env.PORT || 5000

function validate(req, res, next) {
	if (req.body.submit === "cancel") {
		next();
	}

	var valid = "is-valid"
	var invalid = "is-invalid"
	req.firstNameValid = (req.body.firstName == "") ? invalid : valid;
	req.lastNameValid = (req.body.lastName == "") ? invalid : valid;
	req.addressValid = (req.body.address == "") ? invalid : valid;
	req.educationValid = valid;
	req.incomeValid = valid;
	req.phoneValid = (req.body.phone == "") ? invalid : valid;
	req.emailValid = (req.body.email == "") ? invalid : valid;
	req.passwordValid = (req.body.password == "") ? invalid : valid;
	req.passwordRepeatValid = (req.body.passwordRepeat == "") ? invalid : valid;
	req.termsValid = (req.body.terms) ? valid : invalid;
	req.captchaValid = valid;

	req.body.isValid =  req.firstNameValid      == valid &&
						req.lastNameValid       == valid &&
						req.addressValid        == valid &&
						req.educationValid      == valid &&
						req.incomeValid         == valid &&
						req.phoneValid          == valid &&
						req.emailValid          == valid &&
						req.passwordValid       == valid &&
						req.passwordRepeatValid == valid &&
						req.termsValid          == valid &&
						req.captchaValid        == valid;

	console.log(req.body.isValid);
	next();
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
			firstName: "",
			firstNameValid: "",
			lastName: "",
			lastNameValid: "",
			address: "",
			addressValid: "",
			education: "",
			educationValid: "",
			income: "",
			incomeValid: "",
			phone: "",
			phoneValid: "",
			email: "",
			emailValid: "",
			passwordValid: "",
			passwordRepeatValid: "",
			termsValid: "",
			captchaValid: ""
		})
	})
	.post('/', validate, function(req, res) {

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
				password: req.body.password
			})
		} else {
			var captcha = svgCaptcha.create({
				color: true
			});
			req.session.captcha = captcha.text;
			console.log(captcha.text)


			if (req.passwordValid == "is-valid") {
				req.passwordValid = ""
			}
			if (req.passwordRepeatValid == "is-valid") {
				req.passwordRepeatValid = ""
			}

			res.render('pages/index', {
				data: captcha.data,
				firstName: req.body.firstName,
				firstNameValid: req.firstNameValid,
				lastName: req.body.lastName,
				lastNameValid: req.lastNameValid,
				address: req.body.address,
				addressValid: req.addressValid,
				education: req.body.education,
				educationValid: req.educationValid,
				income: req.body.income,
				incomeValid: req.incomeValid,
				phone: req.body.phone,
				phoneValid: req.phoneValid,
				email: req.body.email,
				emailValid: req.emailValid,
				passwordValid: req.passwordValid,
				passwordRepeatValid: req.passwordRepeatValid,
				termsValid: req.termsValid,
				captchaValid: req.captchaValid
			})
		}
	})
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))