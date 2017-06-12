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
                userRequest: req.user || false
            })
        } catch (err) {
            console.error(`Error loading index page, Error: ${err.stack}`);
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
            userRequest: req.user || false
        });
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
            error_text: err
        })
    } else {
        res.render('error', {
            loggedInStatus: req.isAuthenticated(),
            userRequest: req.user || false,
            error_code: 500,
            error_text: errorText
        })
    }
}