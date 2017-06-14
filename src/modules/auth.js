const utils = require('./../utils');

module.exports = function (config, app, passport, DiscordS) {

    const scopes = [
        'identify',
        'guilds',
        'email'
    ];

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    passport.use(new DiscordS({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: `${config.host}/login/callback`,
        scopes: scopes

    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => {
            return done(null, profile);
        });
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/login', (req, res, next) => {
        if (req.query.redirection) req.session.redirect = req.query.redirection;
        passport.authenticate('discord', {scope: scopes, callbackURL: `${config.host}/login/callback`})(req, res, next);
    });

    app.get('/login/callback', passport.authenticate('discord', {failureRedirect: '/error'}), (req, res) => {
        console.log(`- ${req.user.username} has logged on.`);

        utils.submitUsersToDb(req.user).catch(err => {
            console.error(err.stack)
        });
        if (!req.session.redirect) {
            res.render('error', {
                discord_server: 'SSL - Staff Application',
                config: config,
                loggedInStatus: req.isAuthenticated(),
                userRequest: req.user,
                error_code: "801",
                error_text: `A redirection error has occurred; your session did not store a required redirection URL, and your oauth request could not fully be completed. You are logged in, please <a href='/'>return to the home page.</a>`
            });
            return;
        }
        if (req.session.redirect === `/favicon-32x32.png`) {
            res.redirect('/');
            return;
        }

        res.redirect('/'); // Ah who cares
    });

    app.get('/info', checkAuth, (req, res) => {
        res.json(req.user);
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect(req.session.redirect);
    })
};

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.json('Sorry it appears you arnt logged in!');
}


