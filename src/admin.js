/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let fs = require('fs');
let moment = require('moment');

let checkAdmin = require('./auth').checkAdmin;
let setValue = require('./challenges').setValue;

let db = require('./db');

function getChallenges(req, res) {
  checkAdmin(req, res, () => {
    db.dbAll(req, res, 'SELECT rowid AS challenge_id, challenge_name, points FROM challenges ORDER BY points ASC', [],
      function(data) {
        res.status(201).send(data);
      });
  });
}

function getChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.query.challenge_id;
    if (!challenge_id) res.status(400).send({ error: 'Must provide challenge_id' });
    else {
      db.dbGet(req, res, 'SELECT rowid AS challenge_id, challenge_name, challenge_content, points, flag FROM challenges WHERE rowid=?',
        [challenge_id],
        function(data) {
          res.status(201).send(data);
        });
    }
  });
}

function addChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_name = req.body.challenge_name;
    let points = req.body.points;
    let flag = req.body.flag;
    let challenge_content = req.body.challenge_content;
    if (!challenge_name || !points || !flag || !challenge_content) {
      res.status(401).send({ error: 'Must provide all information' });
    } else {
      flag = flag.toLowerCase();
      db.dbRun(req, res, 'INSERT INTO challenges (challenge_name,points,flag,challenge_content)' +
        ' VALUES (?,?,?,?)', [challenge_name, points, flag, challenge_content], function() {
          res.status(201).send('Challenge added');
        });
    }
  });
}

function editChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.body.challenge_id;
    let challenge_name = req.body.challenge_name;
    let points = req.body.points;
    let flag = req.body.flag;
    let challenge_content = req.body.challenge_content;
    if (!challenge_id || !challenge_name || !points || !flag || !challenge_content) {
      res.status(401).send({ error: 'Must provide all information' });
    } else {
      db.dbRun(req, res, 'UPDATE challenges SET challenge_name=?, points=?, flag=?, challenge_content=?' +
        ' WHERE rowid=?', [challenge_name, points, flag, challenge_content, challenge_id], function() {
          res.status(201).send('Challenge updated');
        });
    }
  });
}

function deleteChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.body.challenge_id;
    if (!challenge_id) res.status(401).send({ error: 'Must provide challenge_id' });
    else {
      db.dbRun(req, res, 'DELETE FROM challenges WHERE rowid=?', [challenge_id], function() {
        res.status(201).send('Challenge deleted');
      });
    }
  });
}

function getConf(req, res) {
  checkAdmin(req, res, () => {
    db.dbAll(req, res, 'SELECT * FROM conf', [], (rows) => {
      if (rows.length === 0) res.status(401).send();
      else res.status(201).send(rows);
    });
  });
}

function setTimes(req, res) {
  checkAdmin(req, res, () => {
    let start_time = req.body.start_time;
    let end_time = req.body.end_time;
    let times = { 'start_time': start_time, 'end_time': end_time };
    db.db.run('BEGIN TRANSACTION');
    for (let type in times) {
      if (times[type]) {
        let unix = times[type];
        db.dbRun(req, res, 'INSERT OR REPLACE INTO conf (type, value) VALUES (?,?)',
          [type, unix], function() {
            setValue(type, unix);
            res.status(201).send();
          });
      }
    }
    db.db.run('END');
  });
}

function setFlagFormat(req, res) {
  checkAdmin(req, res, () => {
    let flag_format = req.body.flag_format.toLowerCase();
    if (flag_format.indexOf('%s') === -1) res.status(401).send({ error: 'Must contain %s' });
    else {
      db.dbRun(req, res, 'INSERT OR REPLACE INTO conf (type, value) VALUES (?,?)', ['flag_format', flag_format], function() {
        setValue('flag_format', flag_format);
        res.status(201).send();
      });
    }
  });
}

function getAllAttempts(req, res) {
  checkAdmin(req, res, () => {
    db.dbAll(req, res, 'SELECT username, challenge_name, attempt_time, attempt, correct FROM attempts JOIN challenges ON attempts.challenge_id=challenges.ROWID ORDER BY attempt_time DESC', [],
      function(rows) {
        res.status(201).send(rows);
      });
  });
}

module.exports = {
  getChallenges: getChallenges,
  getChallenge: getChallenge,
  addChallenge: addChallenge,
  editChallenge: editChallenge,
  deleteChallenge: deleteChallenge,
  getConf: getConf,
  setTimes: setTimes,
  setFlagFormat: setFlagFormat,
  getAllAttempts: getAllAttempts
};
