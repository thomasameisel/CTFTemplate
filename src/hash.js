/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

var bcrypt = require('bcrypt');
const saltRounds = 12;

function hash(password, cb) {
  bcrypt.hash(password, saltRounds, cb);
}

function compare(password, hash, cb) {
  bcrypt.compare(password, hash, cb);
}

function hashPassword(req, res, password, cb) {
  hash(password, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send({ error: 'Error occurred' });
    } else if (cb) cb(data);
  });
}

function checkPassword(req, res, password, hash, cb) {
  compare(password, hash, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send({ error: 'Error occurred' });
    } else if (cb) cb(data);
  });
}

module.exports = {
  hashPassword: hashPassword,
  checkPassword: checkPassword,
  hash: hash,
  compare: compare
};
