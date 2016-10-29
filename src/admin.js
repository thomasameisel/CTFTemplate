/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let async = require('async');
let fs = require('fs');
let moment = require('moment');

let checkAdmin = require('./auth').checkAdmin;
let setValue = require('./challenges').setValue;

let db = require('./db');

function getChallenges(req, res) {
  checkAdmin(req, res, () => {
    db.dbAll(req, res, 'SELECT ROWID AS challenge_id, challenge_name, points FROM challenges ORDER BY points ASC', [],
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
      db.dbAll(req, res, 'SELECT challenge_id, challenge_name, challenge_content, points, flag FROM challenges_flags WHERE challenge_id=?',
        [challenge_id],
        function(rows) {
          let challenge = {
            challenge_id: rows[0].challenge_id,
            challenge_name: rows[0].challenge_name,
            challenge_content: rows[0].challenge_content,
            points: rows[0].points,
            flags: []
          };
          rows.map((row) => challenge.flags.push(row.flag));
          res.status(201).send(challenge);
        });
    }
  });
}

function addChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_name = req.body.challenge_name;
    let points = req.body.points;
    let flags = req.body.flags;
    let challenge_content = req.body.challenge_content;
    if (!challenge_name || !points || !flags || flags.length === 0 || flags[0].length === 0 || !challenge_content) {
      res.status(401).send({ error: 'Must provide all information' });
    } else {
      flags = flags.map((flag) => flag.toLowerCase());
      db.dbRun(req, res, 'INSERT INTO challenges (challenge_name,points,challenge_content)' +
        ' VALUES (?,?,?)', [challenge_name, points, challenge_content], function(row) {
        async.eachSeries(flags,
          (flag, cb) => {
            if (flag.length > 0) {
              db.db.run('INSERT INTO flags (challenge_id,flag) VALUES (?,?)',
                [row.lastID, flag.toLowerCase()], cb);
            } else cb();
          },
          (err) => {
            if (err) res.status(400).send({ error: 'Error occurred' });
            else res.status(201).send('Challenge added');
          });
      });
    }
  });
}

function editChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.body.challenge_id;
    let challenge_name = req.body.challenge_name;
    let points = req.body.points;
    let flags = req.body.flags;
    let challenge_content = req.body.challenge_content;
    if (!challenge_name || !points || !flags || flags.length === 0 || flags[0].length === 0 || !challenge_content) {
      res.status(401).send({ error: 'Must provide all information' });
    } else {
      db.dbRun(req, res, 'UPDATE challenges SET challenge_name=?, points=?, challenge_content=?' +
        ' WHERE ROWID=?', [challenge_name, points, challenge_content, challenge_id], function() {
        db.dbRun(req, res, 'DELETE FROM flags WHERE challenge_id=?', [challenge_id], function() {
          async.eachSeries(flags,
            (flag, cb) => {
              if (flag.length > 0) {
                db.db.run('INSERT INTO flags (challenge_id,flag) VALUES (?,?)',
                  [challenge_id, flag.toLowerCase()], cb);
              } else cb();
            },
            (err) => {
              if (err) res.status(400).send({ error: 'Error occurred' });
              else res.status(201).send('Challenge updated');
            });
        });
      });
    }
  });
}

function deleteChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.body.challenge_id;
    if (!challenge_id) res.status(401).send({ error: 'Must provide challenge_id' });
    else {
      db.dbRun(req, res, 'DELETE FROM challenges WHERE ROWID=?', [challenge_id], function() {
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
