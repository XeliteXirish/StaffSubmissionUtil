const index = require('../index');
const utils = require('../utils');
const fs = require('fs');

module.exports = function (app, config) {

    app.use(function (req, res, next) {
        req.session.redirect = req.path || '/';
        next();
    });

    app.get('/', checkAuth, (req, res) => {
        try {
            res.render('index', {
                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user || false,
                moderationOpen: config.moderationOpen,
                serverName: config.serverName,
                serverInvite: config.serverInvite
            })
        } catch (err) {
            console.error(`Error loading index page, Error: ${err.stack}`);
            renderErrorPage(req, res, err);
        }
    });

    app.get('/applications', checkAuth, checkModerator, (req, res) => {
        try {

            utils.fetchStaffApplications().then(staffApplications => {
                res.render('applications', {
                    loggedInStatus: req.isAuthenticated(),
                    userRequest: req.user || false,
                    moderationOpen: config.moderationOpen,
                    staffApplications: staffApplications,
                    serverName: config.serverName,
                    serverInvite: config.serverInvite
                })
            })

        } catch (err) {
            console.error(`Error loading applications page, Error: ${err.stack}`);
            renderErrorPage(req, res, err);
        }
    });

    //404 Error page (Must be the last route!)
    app.use(function (req, res, next) {
        try {
            res.render('error', {
                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user || false,
                serverName: config.serverName,
                serverInvite: config.serverInvite,
                error_code: 404,
                error_text: "The page you requested could not be found or rendered. Please check your request URL for spelling errors and try again. If you believe this error is faulty, please contact a system administrator."

            })
        } catch (err) {
            console.error(`An error has occurred trying to load the 404 page, Error: ${err.stack}`);
            renderErrorPage(req, res, err);
        }
    })
};

function checkAuth(req, res, next) {
    try {

        if (req.isAuthenticated()) return next();

        req.session.redirect = req.path;
        res.status(403);
        res.render('badLogin', {

            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            serverName: index.config.serverName,
            serverInvite: index.config.serverInvite
        });
    } catch (err) {
        console.error(`An error has occurred trying to check auth, Error: ${err.stack}`);
        renderErrorPage(req, res, err);
    }
}

function checkModerator(req, res, next) {
    try {

        utils.isUserModerator(req.user.id).then(isModerator => {
            if (isModerator) return next();

            req.session.redirect = req.path;
            res.status(403);
            res.render('unauthorised', {

                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user || false,
                serverName: index.config.serverName,
                serverInvite: index.config.serverInvite
            });
        }).catch(err => {
            console.error(`Error checking mod status, Error: ${err.stack}`);
            renderErrorPage(req, res, err);
        })

    } catch (err) {
        console.error(`An error has occurred trying to check auth, Error: ${err.stack}`);
        renderErrorPage(req, res, err);
    }
}

function renderErrorPage(req, res, err, errorText) {

    if (err) {
        console.error(`An error has occurred in Web.js, Error: ${err.stack}`);
        res.render('error', {
            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            error_code: 500,
            error_text: err,
            serverName: index.config.serverName,
            serverInvite: index.config.serverInvite
        })
    } else {
        res.render('error', {
            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            error_code: 500,
            error_text: errorText,
            serverName: index.config.serverName,
            serverInvite: index.config.serverInvite
        })
    }
}