/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let prompt = require('prompt');

let hash = require('./hash');

let db = require('./db').db;

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
  db.run('CREATE TABLE IF NOT EXISTS attempts (username TEXT, challenge_id INT, attempt_time INT, attempt TEXT, correct BOOLEAN)'); // ROWID is primary key
  db.run('CREATE TABLE IF NOT EXISTS challenges (challenge_name TEXT, points INT, flag TEXT, challenge_content TEXT)'); // ROWID is primary key
  db.run('CREATE TABLE IF NOT EXISTS conf (type TEXT PRIMARY KEY, value INT)');
  db.run('CREATE VIEW IF NOT EXISTS total_points AS SELECT users.username, users.competing, COALESCE(sum(points), 0) AS total_points FROM users LEFT OUTER JOIN (SELECT * FROM challenges JOIN attempts ON challenges.ROWID=attempts.challenge_id WHERE attempts.correct=1) AS tmp ON users.username=tmp.username GROUP BY users.username');
  db.run('CREATE VIEW IF NOT EXISTS completed AS SELECT users.username AS username, challenge_name, points, attempt_time FROM users NATURAL JOIN (attempts JOIN challenges ON attempts.challenge_id=challenges.ROWID) WHERE attempts.correct=1 AND users.competing=1');
  db.run('CREATE VIEW IF NOT EXISTS not_completed AS SELECT users.username, challenges.rowid AS challenge_id, challenges.challenge_name, challenges.points FROM users, challenges WHERE challenges.rowid NOT IN (SELECT challenge_id FROM attempts WHERE attempts.correct=1 AND attempts.username=users.username)');

  db.run('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, hash TEXT, is_admin BOOLEAN, competing BOOLEAN)', function(err) {
    if (err) console.log(err);
    else {
      adminExists((err, exists) => {
        if (err) console.log(err);
        else if (!exists) {
          prompt.start();
          prompt.get(properties, (err, result) => {
            if (result.add_admin === 'Y' || result.add_admin === 'y') {
              prompt.get(['Username', {name: 'Password', hidden:true}], (err, result) => {
                let username = result.Username;
                let password = result.Password;
                hash.hash(password, (err, hash) => {
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
  });
}

module.exports = {
  firstRun: firstRun
};
