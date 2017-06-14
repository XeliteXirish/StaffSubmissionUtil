const index = require('./index');

exports.createTable = function () {
  return new Promise((resolve, reject) => {

      let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.Submissions
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Username TEXT,
    UserID VARCHAR(30),
    Position TEXT,
    Age TEXT,
    TimeZone TEXT,
    Country TEXT,
    Experience TEXT,
    Reason TEXT,
    Date DATETIME,
    Removed TINYINT(1) DEFAULT 0,
    RemovedBy VARCHAR(30)
);`;

      index.db.query(query, function (err, rows, fields) {
          if (err){
              console.error(`Error while creating submissions table, Error: ${err.stack}`);
              console.error(`Error query: ${query}`);
              return reject(err);
          }
          resolve();
      })
  })
};

exports.createUserTable = function () {
    return new Promise((resolve, reject) => {

        let query = `CREATE TABLE IF NOT EXISTS ${index.config.sql_db}.Users
(
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Username TEXT,
    UserId VARCHAR(30),
    Email TEXT,
    Moderator TINYINT(1) DEFAULT 0,
    Banned TINYINT(1) DEFAULT 0
);`;

        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error trying to create database, Error ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }
            resolve();
        })
    });
};

exports.submitUsersToDb = function (userReq) {
    return new Promise((resolve, reject) => {

        // Insets new users only
        let checkQuery = `SELECT * FROM Users WHERE UserId=${index.db.escape(userReq.id)}`;
        index.db.query(checkQuery, function (err, rows, fields) {
            if (err) {
                console.error(`Error Query: ${checkQuery}`);
                return reject(err);
            }
            if (rows.length > 0) return resolve();

            let query = `INSERT INTO Users (Username, UserId, Email) VALUES (${index.db.escape(userReq.username)}, ${index.db.escape(userReq.id)}, ${index.db.escape(userReq.email)});`;
            index.db.query(query, function (err, rows, fields) {
                if (err) {
                    console.error(`Error submitting number, Error: ${err.stack}`);
                    console.error(`Error Query: ${query}`);
                    return reject(err);
                }

                resolve();
            })
        });
    });
};

exports.submitApplication = function (username, userId, position, age, timezone, country, experience, reason) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO Submissions (Username, UserID, Position, Age, TimeZone, Country, Experience, Reason, Date) VALUES (${index.db.escape(username)}, ${index.db.escape(userId)}, ${index.db.escape(position)}, ${index.db.escape(age)}, ${index.db.escape(timezone)}, ${index.db.escape(country)}, ${index.db.escape(experience)}, ${index.db.escape(reason)}, ${index.db.escape(new Date())});`
        index.db.query(query, function (err, rows, fields) {

            if (err) {
                console.error(`Error while creating submissions table, Error: ${err.stack}`);
                console.error(`Error query: ${query}`);
                return reject(err);
            }
            resolve();
        })
    });
};

/**
 * Check if the user has moderator perms
 * @param userId
 * @returns {Promise}
 */
exports.isUserModerator = function (userId) {
    return new Promise((resolve, reject) => {
        let query = `SELECT Moderator FROM Users WHERE UserId=${index.db.escape(userId)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error while checking if a user is a moderator, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            if (!rows[0]) return resolve(false);

            let isModerator = false;
            if (rows[0].Moderator === 1) isModerator = true;

            resolve(isModerator);
        })
    });
};

/**
 * Returns true if a user is banned from posting numbers
 * @param userId
 * @returns {Promise}
 */
exports.isUserBanned = function (userId) {
    return new Promise((resolve, reject) => {

        let query = `SELECT Banned FROM Users WHERE UserId=${index.db.escape(userId)}`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error while checking if a user is banned, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            let isBanned = false;
            if (rows.length > 0) {
                if (rows[0].Banned === 1) isBanned = true;
            }

            resolve(isBanned);
        })
    });
};

exports.fetchStaffApplications = function () {
    return new Promise((resolve, reject) => {

        let query = `SELECT * FROM Submissions;`;
        index.db.query(query, function (err, rows, fields) {
            if (err) {
                console.error(`Error while checking if a user is banned, Error: ${err.stack}`);
                console.error(`Error Query: ${query}`);
                return reject(err);
            }

            let results = [];
            for (let x = 0; x < rows.length; x++) {
                rows[x].Date = exports.getDateString(rows[x].Date);

                results.push(rows[x]);
            }

            resolve(results);
        })
    });
};

/**
 * Converts a date into a nice format
 * @param date
 * @returns {string}
 */
exports.getDateString = function (date) {
    return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
};