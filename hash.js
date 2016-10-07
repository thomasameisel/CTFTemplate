/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

var bcrypt = require('bcrypt');
const saltRounds = 10;

function hashPassword(req, res, password, cb) {
  bcrypt.hash(password, saltRounds, (err, data) => {
    if (err) res.status(400).send({ error: 'Error occurred' });
    else if (cb) cb(data);
  });
}

function checkPassword(req, res, password, hash, cb) {
  bcrypt.compare(password, hash, (err, data) => {
    if (err) res.status(400).send({ error: 'Error occurred' });
    else if (cb) cb(data);
  });
}

module.exports = {
  hashPassword: hashPassword,
  checkPassword: checkPassword
};
