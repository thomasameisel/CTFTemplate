/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let db = require('./db');

function getLeaderboard(req, res) {
  db.dbAll(req, res, 'SELECT username, total_points AS points FROM total_points WHERE competing=1 ORDER BY total_points DESC', [], function(data) {
    res.status(201).send(data);
  });
}

function getPoints(req, res) {
  let username = req.query.username;
  if (!username) res.status(400).send({ error: 'Must provide username' });
  else {
    db.dbGet(req, res, 'SELECT total_points FROM total_points WHERE username=?', [username],
      function(data) {
        res.status(201).send({
          username: username,
          points: data.total_points
        });
      });
  }
}

function getLeaderboardAllCompleted(req, res) {
  db.dbAll(req, res, 'SELECT username, total_points AS points FROM total_points WHERE competing=1 ORDER BY total_points DESC', [], function(leaderboard) {
    db.dbAll(req, res, 'SELECT username, challenge_name, points, attempt_time FROM completed ORDER BY attempt_time DESC', [],
      function(all_completed) {
        res.status(201).send({
          leaderboard: leaderboard,
          all_completed: all_completed
        });
      });
  });
}

module.exports = {
  getLeaderboard: getLeaderboard,
  getPoints: getPoints,
  getLeaderboardAllCompleted: getLeaderboardAllCompleted
};
