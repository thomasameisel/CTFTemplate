/*jslint esversion:6 */

function setHeaderButtonsVisibility(loggedIn) {
  let loggedInBtns = [
    'challenges_header', 'logout_header', 'profile_header', 'points_header', 'admin_header', 'all_attempts_header'
  ];
  let loggedOutBtns = [
    'login_header', 'signup_header'
  ];
  if (loggedIn) {
    loggedInBtns.forEach((id) => $('#' + id).show());
    loggedOutBtns.forEach((id) => $('#' + id).hide());
  } else {
    loggedOutBtns.forEach((id) => $('#' + id).show());
    loggedInBtns.forEach((id) => $('#' + id).hide());
  }
}

function updateUsernamePoints(data) {
  $('#profile_header').text(data.username);
  $('#points_header').text(data.points);
}

function populateHeaderLoggedIn(data, redirectToChallenges) {
  setHeaderButtonsVisibility(true);
  updateUsernamePoints(data);
  if (!data.is_admin) {
    $('#admin_header').hide();
    $('#all_attempts_header').hide();
  } else {
    $('#admin_header').show();
    $('#all_attempts_header').show();
  }
  if (redirectToChallenges) goToChallenges();
}

function populateHeaderLoggedOut() {
  setHeaderButtonsVisibility(false);
  $('#points_header').text('');
  $('#profile_header').text('');
}

function changeHeader() {
  ajaxGet('/v1/auth',
    (data) => populateHeaderLoggedIn(data, false),
    populateHeaderLoggedOut);
}

function updatePoints() {
  ajaxGet('/v1/points?username=' + $('#profile_header').text(),
    updateUsernamePoints,
    () => {});
}
