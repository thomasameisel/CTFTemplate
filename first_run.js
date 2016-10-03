/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let prompt = require('prompt');

let hash = require('./hash');

let db = require('./db').db;
db.run('CREATE TABLE IF NOT EXISTS users (username TEXT, hash TEXT, is_admin BOOLEAN, competing BOOLEAN)');
db.run('CREATE TABLE IF NOT EXISTS completed (username TEXT, challenge_id INT, time_completed INT)');
db.run('CREATE TABLE IF NOT EXISTS challenges (challenge_name TEXT, points INT, flag TEXT, challenge_content TEXT)');
db.run('CREATE TABLE IF NOT EXISTS times (type TEXT PRIMARY KEY, time INT)');
db.run('CREATE VIEW IF NOT EXISTS total_points AS SELECT users.username, users.competing, COALESCE(sum(points), 0) AS total_points FROM users LEFT OUTER JOIN (challenges JOIN completed ON challenges.ROWID=completed.challenge_id) ON users.username=completed.username GROUP BY users.username');
db.run('CREATE VIEW IF NOT EXISTS not_completed AS SELECT users.username, challenges.rowid AS challenge_id, challenges.challenge_name, challenges.points FROM users, challenges WHERE challenges.rowid NOT IN (SELECT challenge_id FROM completed WHERE completed.username=users.username)');

prompt.message = undefined;
prompt.colors = false;

let properties = [
  {
    name: 'add_admin',
    description: 'Add admin account (Y/N)'
  }
];

function adminExists(cb) {
  db.get('SELECT * FROM users WHERE is_admin=1', (err, data) => {
    if (err) cb(err);
    else cb(undefined, data !== undefined);
  });
}

function firstRun() {
  adminExists((err, exists) => {
    if (err || !exists) {
      prompt.start();
      prompt.get(properties, (err, result) => {
        if (result.add_admin === 'Y' || result.add_admin === 'y') {
          prompt.get(['Username', {name: 'Password', hidden:true}], (err, result) => {
            let username = result.Username;
            let password = result.Password;
            hash.hashPassword(password, (err, hash) => {
              if (err) console.log('Error occured');
              else {
                db.run('INSERT INTO users (username,hash,is_admin,competing) VALUES (?,?,1,0)', username, hash);
                console.log('admin account added:', username);
              }
            });
          });
        }
      });
    }
  });
}

module.exports = {
  firstRun: firstRun
};
