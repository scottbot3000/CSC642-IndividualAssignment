const express = require('express')
const path = require('path')
const session = require('express-session')
var svgCaptcha = require('svg-captcha');

const PORT = process.env.PORT || 5000

express()
	.use(session({
		secret: 'csc648-stock-overflow',
		resave: false,
		saveUninitialized: true
	}))
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', function(req, res) {
		var captcha = svgCaptcha.create({color: true});
		req.session.captcha = captcha.text;
		console.log(captcha.text)
		res.render('pages/index', {
			data: captcha.data
		})
	})
	.get('/results', (req, res) => res.render('pages/results'))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`))