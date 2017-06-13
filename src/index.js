const config = exports.config = require('./../config.json');

const http = require('http');
const favicon = require('serve-favicon');
const express = require('express');
const session = require('express-session');
const cookieSession = require('cookie-session');
const minify = require('express-minify');
const passport = require('passport');
const DiscordS = require('passport-discord').Strategy;
const bodyParser = require('body-parser');
const nodemon = require('nodemon');
const ejs = require('ejs');
const mysql = require('mysql');

const app = exports.app = express();
let connection;

const auth = exports.auth = require('./modules/auth');
const web = exports.web = require('./modules/web');
const api = exports.web = require('./modules/api');
const webhook = exports.webhook = require('./modules/webhook');

let utils = require('./utils');

try {

    connection = exports.db = mysql.createConnection({
        host: config.sql_host,
        user: config.sql_user,
        password: config.sql_pass,
        database: config.sql_db
    });

    let dd_options = {
        'response_code': true,
        'tags': ['app:my_app']
    }

    let connectDatadog = require('connect-datadog')(dd_options);

    app.use(connectDatadog);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static('Web'));
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'ejs');
    app.use(minify());
    app.use('/', express.static(`${__dirname}/static`));
    app.use(cookieSession({
        name: 'loginSession',
        keys: [config.clientID, config.session_secret],
        maxAge: 2 * 60 * 60 * 1000 // 48 hours
    }));

} catch (err) {

    console.error(`An error occurred during Web initialisation, Error: ${err.stack}`);
}

try {

    auth(config, app, passport, DiscordS);
    web(app, config);
    api.init(app);
    webhook.init();

    utils.createTable().catch(err => {
        console.err(err.stack)
    });
    utils.createUserTable().catch(err => {
        console.err(err.stack)
    });

} catch (err) {
    console.error(`An error occurred during module initialisation, Error: ${err.stack}`);
}

// Set up final server
try {
    const httpServer = http.createServer(app);
    httpServer.listen(config.server_port, (err) => {
        if (err) {
            console.error(`FAILED TO OPEN WEB SERVER, ERROR: ${err.stack}`);
            return;
        }
        console.info(`Successfully started server..listening on port ${config.server_port}`);
    })
}catch (err){
    console.error(`Error starting up server, Error: ${err.stack}`)
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception' + err.stack);
});