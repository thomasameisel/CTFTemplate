/*jslint esversion: 6 */

function displayError() {
  $('#invalid-msg').css('display', 'inline');
}

function changeError(msg) {
  displayError();
  let responseText = JSON.parse(msg.responseText);
  $('#invalid-msg').text(responseText.error);
  return false;
}

function afterAuth(data) {
  populateHeaderLoggedIn(data, true);
}

function afterLogout() {
  populateHeaderLoggedOut();
  goToMain();
}

function logout() {
  ajaxGet('/v1/logout',
    afterLogout,
    afterLogout);
}

function submitLogin() {
  let info = inputToJSON('login');

  $('#login_btn').prop('disabled', true);
  document.body.style.cursor='wait';

  ajaxPost('/v1/login', info,
    (data) => {
      $('#login_btn').prop('disabled', false);
      document.body.style.cursor='default';
      afterAuth(data);
    },
    (data) => {
      $('#login_btn').prop('disabled', false);
      document.body.style.cursor='default';
      changeError(data);
    });
}

function submitSignup() {
  let info = inputToJSON('signup');
  info.non_competing = $('#non_competing').is(':checked');

  $('#signup_btn').prop('disabled', true);
  document.body.style.cursor='wait';

  ajaxPost('/v1/signup', info,
    (data) => {
      $('#signup_btn').prop('disabled', false);
      document.body.style.cursor='default';
      afterAuth(data);
    },
    (data) => {
      $('#signup_btn').prop('disabled', false);
      document.body.style.cursor='default';
      changeError(data);
    });
}
