/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let fs = require('fs');
let moment = require('moment');

let checkAdmin = require('./auth').checkAdmin;
let setTime = require('./challenges').setTime;

let db = require('./db').db;

function getAdmin(req, res) {
  checkAdmin(req, res, () => {
    fs.readFile('admin.html', function(err, data) {
      if (err) res.status(401).send('Error occurred');
      else res.status(201).send(data);
    });
  });
}

function getChallenges(req, res) {
  checkAdmin(req, res, () => {
    db.all('SELECT rowid AS challenge_id, challenge_name, points FROM challenges ORDER BY points ASC',
      function(err, data) {
        if (err) res.status(401).send({ error: 'Error with database' });
        else res.status(201).send(data);
      });
  });
}

function getChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.query.challenge_id;
    if (!challenge_id) res.status(400).send({ error: 'Must provide challenge_id' });
    else {
      db.get('SELECT rowid AS challenge_id, challenge_name, challenge_content, points, flag FROM challenges WHERE rowid=?', challenge_id,
        function(err, data) {
          if (err) res.status(401).send({ error: 'Error with database' });
          else res.status(201).send(data);
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
      db.run('INSERT INTO challenges (challenge_name,points,flag,challenge_content)' +
        ' VALUES (?,?,?,?)', challenge_name, points, flag, challenge_content);
      res.status(201).send('Challenge added');
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
      db.run('UPDATE challenges SET challenge_name=?, points=?, flag=?, challenge_content=?' +
        ' WHERE rowid=?', challenge_name, points, flag, challenge_content, challenge_id);
      res.status(201).send('Challenge updated');
    }
  });
}

function deleteChallenge(req, res) {
  checkAdmin(req, res, () => {
    let challenge_id = req.body.challenge_id;
    if (!challenge_id) res.status(401).send({ error: 'Must provide challenge_id' });
    else {
      db.run('DELETE FROM challenges WHERE rowid=?', challenge_id);
      res.status(201).send('Challenge deleted');
    }
  });
}

function getTimes(req, res) {
  checkAdmin(req, res, () => {
    db.all('SELECT * FROM times', (err, data) => {
      if (err) res.status(400).send({ error: 'Error with database' });
      else if (data.length === 0) res.status(401).send();
      else {
        let times = {};
        data.forEach((row) => {
          times[row.type] = moment.unix(row.time).format('YYYY-MM-DDTHH:MM');
        });
        res.status(201).send(times);
      }
    });
  });
}

function setTimes(req, res) {
  checkAdmin(req, res, () => {
    let start_time = req.body.start_time;
    let end_time = req.body.end_time;
    let times = { 'start_time': start_time, 'end_time': end_time };
    for (let type in times) {
      if (times[type] && times[type].length > 0) {
        let unix = moment(times[type]).unix();
        db.run('INSERT OR REPLACE INTO times (type, time) VALUES (?,?)',
          type, unix);
        setTime(type, unix);
      }
    }
    res.status(201).send();
  });
}

module.exports = {
  getAdmin: getAdmin,
  getChallenges: getChallenges,
  getChallenge: getChallenge,
  addChallenge: addChallenge,
  editChallenge: editChallenge,
  deleteChallenge: deleteChallenge,
  getTimes: getTimes,
  setTimes: setTimes
};
