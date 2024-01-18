"use strict";
exports.__esModule = true;
// Install express server
// tslint:disable:quotemark
const express = require('express');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const sslRedirect = require('heroku-ssl-redirect');
const helmet = require('helmet');
const noCache = require('nocache')
const port = process.env.PORT || 8080;
const app = express();
require('dotenv').config();
const environment = require("./src/environments/environment");
app.use(function (req, res, next) {
    res.locals.nonce = environment.nonce;
    next();
});
app.use(helmet());
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     baseUri: ["'self'"],
//     defaultSrc: ["'none'"], // by default, not specifying default-src = '*'
//     mediaSrc: ["'self'"],
//     fontSrc: ["'self' data:", 'fonts.googleapis.com', 'd1atm7a2stxxbt.cloudfront.net', 'fonts.gstatic.com', 'https:'],
//     imgSrc: [
//       "'self' data:", 'https://d1atm7a2stxxbt.cloudfront.net', 'img.youtube.com',
//       'www.google-analytics.com', 'www.facebook.com', 'blob:',
//       'https://ssl.gstatic.com/'
//     ],
//     scriptSrc: [
//       "'self' 'unsafe-eval'", 'www.googletagmanager.com', 'tagmanager.google.com',
//       'www.google-analytics.com', 'sjs.bizographics.com',
//       'fullstory.com', 'connect.facebook.net', 'cdnjs.cloudflare.com',
//       (req, res) => `'nonce-${res.locals.nonce}'`
//     ],
//     styleSrc: ["'self' 'unsafe-inline'", 'fonts.googleapis.com', 'tagmanager.google.com'],
//     'object-src': ["'none'"],
//     connectSrc: [ "'self'", process.env.API_URL],
//     manifestSrc: ["'self'"],
//     frameSrc: ["'none'"], // instead of deprecated child-src
//     workerSrc: ["'self'"], // instead of deprecated child-src
//     upgradeInsecureRequests: true
//   },
//   browserSniff: false // assumes a modern browser, but allows CDN in front
// }));
app.use(noCache());
app.use(helmet.referrerPolicy({
    policy: 'strict-origin-when-cross-origin'
}));
app.use(compression());
app.use(sslRedirect());
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/aprintis-frontend'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/aprintis-frontend/index.html'));
});
// Start the app by listening on the default Heroku port
app.listen(port, function (err) {
    if (err) {
        throw new Error(err);
    }
    console.log("Server UP and listening to port " + port);
});
