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
const mysql = require('mysql');

const app = exports.app = express();
let connection;

const web = require('./modules/web');
const auth = require('./modules/auth');
const utils = require('./utils');

try {

    connection = exports.db = mysql.createConnection({
        host: config.sql_host,
        user: config.sql_user,
        password: config.sql_pass,
        database: config.sql_db
    });

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
        maxAge: 12 * 60 * 60 * 1000 // 48 hours
    }));

    const httpServer = http.createServer(app);
    httpServer.listen(config.server_port, (err) => {
        if (err) {
            console.error(`FAILED TO OPEN WEB SERVER, ERROR: ${err.stack}`);
            return;
        }
        console.info(`Successfully started server..listening on port ${config.server_port}`);
    })

    utils.createTable();
    utils.createUserTable();

    web(app, config);
    auth(config, app, passport, DiscordS);

    console.log(` ~ Successfully started all application services! ~ `)

}catch (err){
    console.error(`An error occurred during Web initialisation, Error: ${err.stack}`);
}