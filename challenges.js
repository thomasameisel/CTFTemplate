/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let db = require('./db').db;

let checkAuthorized = require('./auth.js').checkAuthorized;

let start_time, end_time;

db.all('SELECT * FROM times', function(err, data) {
  if (!err && data.length > 0) {
    data.forEach(function(row) {
      if (row.type === 'start_time') start_time = row.time;
      else if (row.type === 'end_time') end_time = row.time;
    });
  }
});

function getChallenges(req, res) {
  // only return the challenges the user has not completed yet
  checkAuthorized(req, res, start_time, end_time, Date.now(), () => {
    db.all('SELECT challenge_id, challenge_name, points FROM not_completed WHERE username=? ORDER BY points ASC',
      req.session.username,
      function(err, data) {
        if (err) res.status(401).send({ error: 'Error with database' });
        else res.status(201).send(data);
      });
  });
}

function getChallenge(req, res) {
  checkAuthorized(req, res, start_time, end_time, Date.now(), () => {
    let challenge_id = req.query.challenge_id;
    if (!challenge_id) res.status(400).send({ error: 'Must provide challenge_id' });
    else {
      db.get('SELECT rowid AS challenge_id, challenge_content FROM challenges WHERE rowid=?', challenge_id,
        function(err, data) {
          if (err) res.status(401).send({ error: 'Error with database' });
          else res.status(201).send(data);
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
      db.get('SELECT flag FROM challenges WHERE rowid=?', challenge_id,
        function(err, data) {
          db.run('BEGIN TRANSACTION');
          let unixTime = Math.floor(new Date() / 1000);
          db.run('INSERT OR IGNORE INTO attempts (username,challenge_id,time_completed,attempt) ' +
            'VALUES (?,?,?,?)', req.session.username, challenge_id, unixTime, flag);

          if (err) res.status(400).send({ error: 'Error with database' });
          else if (!data || !data.flag) res.status(401).send({ error: 'challenge_id is not valid' });
          else if (data.flag === flag || '_FLAG_(' + data.flag + ')' === flag || data.flag === '_FLAG_(' + flag + ')') {
            db.run('INSERT OR IGNORE INTO completed (username,challenge_id,time_completed) ' +
              'VALUES (?,?,?)', req.session.username, challenge_id, unixTime);
            res.status(201).send({ msg: 'Correct answer!' });
          } else res.status(401).send({ error: 'flag is not correct' });
          db.run('END');
        });
    }
  });
}

function getCompleted(req, res) {
  let username = req.query.username;
  if (!username) res.status(400).send({ error: 'Must provide username' });
  else {
    db.all('SELECT challenge_name, points, time_completed FROM completed, challenges WHERE completed.challenge_id = challenges.rowid AND username=? ORDER BY time_completed DESC', username,
      function(err, rows) {
        if (err) res.status(401).send({ error: 'Error with database' });
        else res.status(201).send({
          username: username,
          completed: rows
        });
      });
  }
}

function getAllCompleted(req, res) {
  db.all('SELECT users.username AS username, challenge_name, points, time_completed FROM users NATURAL JOIN (completed JOIN challenges ON completed.challenge_id=challenges.ROWID) WHERE users.competing=1 ORDER BY time_completed DESC',
    function(err, rows) {
      if (err) res.status(401).send({ error: 'Error with database' });
      else res.status(201).send(rows);
    });
}

function setTime(type, time) {
  switch (type) {
    case 'start_time': {
      start_time = time;
      break;
    }
    case 'end_time': {
      end_time = time;
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
  setTime: setTime
};
