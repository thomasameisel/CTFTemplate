/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let fs = require('fs');
let logger = require('morgan');
let session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);

let admin = require('./src/admin');
let auth = require('./src/auth');
let challenges = require('./src/challenges');
let points = require('./src/points');

require('./src/first_run').firstRun();

let app = express();
app.use(express.static('public'));
app.use(logger('common', {
    stream: fs.createWriteStream('./access.log', {flags: 'a'})
}));
app.use(logger('dev'));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  store: new SQLiteStore,
  secret: 'CTFC0Mpetition',
  resave: false,
  saveUninitialized: false
}));

app.get('/v1/completed', challenges.getCompleted);

app.get('/v1/all_completed', challenges.getAllCompleted);

app.post('/v1/login', auth.login);

app.post('/v1/signup', auth.signup);

app.get('/v1/auth', auth.auth);

app.get('/v1/logout', auth.logout);

app.get('/v1/leaderboard', points.getLeaderboard);

app.get('/v1/points', points.getPoints);

app.get('/v1/leaderboard_all_completed', points.getLeaderboardAllCompleted);

// routes that require login

app.get('/v1/game/*', challenges.checkAuthorizedTimes);

app.get('/v1/game/challenges', challenges.getChallenges);

app.get('/v1/game/challenge', challenges.getChallenge);

app.post('/v1/game/flag', challenges.submitFlag);

// routes that require admin

app.get('/v1/admin/*', auth.checkAdmin);

app.get('/v1/admin/challenges', admin.getChallenges);

app.get('/v1/admin/challenge', admin.getChallenge);

app.post('/v1/admin/add_challenge', admin.addChallenge);

app.post('/v1/admin/edit_challenge', admin.editChallenge);

app.post('/v1/admin/delete_challenge', admin.deleteChallenge);

app.get('/v1/admin/get_conf', admin.getConf);

app.post('/v1/admin/set_times', admin.setTimes);

app.post('/v1/admin/set_flag_format', admin.setFlagFormat);

app.get('/v1/admin/all_attempts', admin.getAllAttempts);

let server = app.listen(8080, function() {
  console.log('CTF server listening on ' + server.address().port);
});
