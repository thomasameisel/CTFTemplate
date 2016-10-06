/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let moment = require('moment');

let hash = require('./hash');

let db = require('./db');

function checkLoggedIn(req, res, cb) {
  if (!req.session.username) {
    res.status(401).send({ error: 'Must be logged in' });
  } else if (cb) cb();
}

function checkTimes(req, res, start_time, end_time, now, cb) {
  let time = Math.floor(now / 1000);
  if ((!start_time || time >= start_time) && (!end_time || time <= end_time)) {
    cb();
  } else if (start_time && time < start_time) {
    res.status(401).send({ error: 'Competition starts at ' + moment.unix(start_time).format('hh:mm A') });
  } else if (end_time && time > end_time) {
    res.status(401).send({ error: 'Competition ended at ' + moment.unix(end_time).format('hh:mm A') });
  } else {
    // should not happen
    res.status(401).send();
  }
}

function checkAuthorized(req, res, start_time, end_time, now, cb) {
  checkLoggedIn(req, res, () => {
    checkTimes(req, res, start_time, end_time, now, cb);
  });
}

function checkAdmin(req, res, cb) {
  if (!req.session.admin) {
    res.status(401).send({ error: 'Not authorized' });
  } else if (cb) cb();
}

function login(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    res.status(400).send({ error: 'Must provide username and password' });
  } else {
    db.dbGet(req, res, 'SELECT users.username, users.hash, users.is_admin, total_points FROM users LEFT OUTER JOIN total_points ON users.username = total_points.username WHERE users.username=?',
      [username],
      function(data) {
        if (!data) res.status(401).send({ error: 'Username and password are not correct' });
        else {
          hash.checkPassword(password, data.hash, (err, correct) => {
            if (err) res.status(400).send({ error: 'Error occurred' });
            else if (!correct) res.status(401).send({ error: 'Username and password are not correct' });
            else {
              req.session.username = username;
              req.session.admin = data.is_admin === 1;
              res.status(201).send({
                username: username,
                is_admin: req.session.admin,
                points: data.total_points
              });
            }
          });
        }
      });
  }
}

function signup(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let non_competing = req.body.non_competing;
  if (!username || !password) {
    res.status(400).send({ error: 'Must provide username and password' });
  } else {
    db.dbGet(req, res, 'SELECT username FROM users WHERE username=?', [username], (data) => {
      if (data) res.status(401).send({ error: 'Username already exists' });
      else {
        hash.hashPassword(password, (err, hash) => {
          if (err) res.status(401).send({ error: 'Error occurred' });
          else {
            db.dbRun(req, res, 'INSERT INTO users (username,hash,is_admin,competing) VALUES (?,?,0,?)',
              [username, hash, !non_competing],
              function() {
                req.session.username = username;
                req.session.admin = false;
                res.status(201).send({
                  username: username,
                  is_admin: false,
                  points: 0
                });
              });
          }
        });
      }
    });
  }
}

function auth(req, res) {
  checkLoggedIn(req, res, () => {
    db.dbGet(req, res, 'SELECT total_points FROM total_points WHERE username=?', [req.session.username],
      function(data) {
        res.status(201).send({
          username: req.session.username,
          is_admin: req.session.admin,
          points: data.total_points
        });
      });
  });
}

function logout(req, res) {
  req.session.admin = false;
  req.session.username = undefined;
  res.status(201).send();
}

module.exports = {
  login: login,
  signup: signup,
  auth: auth,
  logout: logout,
  checkAuthorized: checkAuthorized,
  checkAdmin: checkAdmin
};
