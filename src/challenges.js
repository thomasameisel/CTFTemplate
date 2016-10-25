/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let db = require('./db');

let checkAuthorized = require('./auth.js').checkAuthorized;

let start_time, end_time, flag_format;

db.db.all('SELECT * FROM conf', function(err, data) {
  if (!err && data.length > 0) {
    data.forEach(function(row) {
      switch (row.type) {
        case 'start_time': {
          start_time = row.value;
          break;
        }
        case 'end_time': {
          end_time = row.value;
          break;
        }
        case 'flag_format': {
          flag_format = row.value;
          break;
        }
      }
    });
  }
});

function formatStr(str, insertStr) {
  return str.replace('%s', insertStr);
}

function getChallenges(req, res) {
  // only return the challenges the user has not completed yet
  checkAuthorized(req, res, start_time, end_time, Date.now(), () => {
    db.dbAll(req, res, 'SELECT challenge_id, challenge_name, points FROM not_completed WHERE username=? ORDER BY points ASC',
      [req.session.username],
      function(data) {
        res.status(201).send(data);
      });
  });
}

function getChallenge(req, res) {
  checkAuthorized(req, res, start_time, end_time, Date.now(), () => {
    let challenge_id = req.query.challenge_id;
    if (!challenge_id) res.status(400).send({ error: 'Must provide challenge_id' });
    else {
      db.dbGet(req, res, 'SELECT rowid AS challenge_id, challenge_content FROM challenges WHERE rowid=?', [challenge_id],
        function(data) {
          res.status(201).send(data);
        });
    }
  });
}

function submitFlag(req, res) {
  checkAuthorized(req, res, start_time, end_time, Date.now(), () => {
    let challenge_id = req.body.challenge_id;
    let flag = req.body.flag;
    if (!challenge_id) res.status(400).send({ error: 'Must provide challenge_id' });
    else if (!flag) res.status(400).send({ error: 'Must provide flag' });
    else {
      db.dbGet(req, res, 'SELECT * FROM attempts WHERE correct=1 AND username=? AND challenge_id=?',
        [req.session.username, challenge_id],
        function(data) {
          let unixTime = Math.floor(new Date() / 1000);

          if (data) {
            db.dbRun(req, res, 'INSERT INTO attempts (username,challenge_id,attempt_time,attempt) ' +
              'VALUES (?,?,?,?)', [req.session.username, challenge_id, unixTime, flag], function() {
                res.status(401).send({ error: 'Already completed this challenge' });
              });
          } else {
            db.dbGet(req, res, 'SELECT flag FROM challenges WHERE rowid=?', [challenge_id], function(data) {
              let correct = data && data.flag &&
                (data.flag === flag ||
                (flag_format && (formatStr(flag_format, data.flag) === flag ||
                formatStr(flag_format, flag) === data.flag)));
              db.dbRun(req, res, 'INSERT INTO attempts (username,challenge_id,attempt_time,attempt,correct) ' +
                'VALUES (?,?,?,?,?)', [req.session.username, challenge_id, unixTime, flag, correct], function() {
                  if (!data || !data.flag) res.status(401).send({ error: 'challenge_id is not valid' });
                  // check if the given flag or flag in database is formatted
                  else if (correct) res.status(201).send({ msg: 'Correct answer!' });
                  else res.status(401).send({ error: 'flag is not correct' });
              });
            });
          }
        });
    }
  });
}

function getCompleted(req, res) {
  let username = req.query.username;
  if (!username) res.status(400).send({ error: 'Must provide username' });
  else {
    db.dbAll(req, res, 'SELECT challenge_name, points, attempt_time FROM completed WHERE username=? ORDER BY attempt_time DESC', [username],
      function(rows) {
        res.status(201).send({
          username: username,
          completed: rows
        });
      });
  }
}

function getAllCompleted(req, res) {
  db.dbAll(req, res, 'SELECT username, challenge_name, points, attempt_time FROM completed ORDER BY attempt_time DESC', [],
    function(rows) {
      res.status(201).send(rows);
    });
}

function setValue(type, value) {
  switch (type) {
    case 'start_time': {
      start_time = value;
      break;
    }
    case 'end_time': {
      end_time = value;
      break;
    }
    case 'flag_format': {
      flag_format = value;
      break;
    }
  }
}

module.exports = {
  getChallenges: getChallenges,
  getChallenge: getChallenge,
  submitFlag: submitFlag,
  getCompleted: getCompleted,
  getAllCompleted: getAllCompleted,
  setValue: setValue
};
