/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let sqlite3 = require('sqlite3');

let db = new sqlite3.Database(__dirname + '/practice_ctf.db');

function dbGet(req, res, query, params, cb) {
  db.get(query, params, function(err, data) {
    if (err) {
      console.log(err);
      res.status(400).send({ error: 'Error occurred' });
    } else if (cb) cb(data);
  });
}

function dbAll(req, res, query, params, cb) {
  db.all(query, params, function(err, rows) {
    if (err) {
      console.log(err);
      res.status(400).send({ error: 'Error occured' });
    } else if (cb) cb(rows);
  });
}

function dbRun(req, res, query, params, cb) {
  db.run(query, params, function(err) {
    if (err) {
      console.log(err);
      res.status(400).send({ error: 'Error occured' });
    } else if (cb) cb();
  });
}

module.exports = {
  dbGet: dbGet,
  dbAll: dbAll,
  dbRun: dbRun,
  db: db
};
