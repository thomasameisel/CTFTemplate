/*jslint esversion:6 */

function populateAllAttemptsTable(attempts) {
  let tmp = '';
  attempts.forEach(function(attempt) {
    tmp += '<tr>';
    tmp += createTableRow(attempt.username);
    tmp += createTableRow(attempt.challenge_id);
    tmp += createTableRow(unixTimeToRegular(attempt.attempt_time));
    tmp += createTableRow(attempt.attempt);
    tmp += createTableRow(attempt.correct);
    tmp += '</tr>';
  });
  $('#attempts').append(tmp);
}

function changeAdminResponse(msg) {
  $('#admin_response').text(msg);
}

function showAddChallenge() {
  $('#challenge_name').val('');
  $('#challenge_id').val('');
  $('#challenge_content').val('');
  $('#points').val('');
  $('#flag').val('');
  $('#admin_response').text('');
  $('#challenge_delete').hide();

  $('#challenge_update').prop('disabled', false);
  $('#challenge_delete').prop('disabled', false);
  $('#add_edit_challenge').text('Add Challenge');
  $('#challenge_update').text('Add challenge');
  $('#challenge_update').attr('onclick', 'addChallenge()');
  $('#challenges').children('a').each(function() {
    this.style['font-weight'] = 'normal';
  });
}

function addAdminChallengeToContent(challenge) {
  $('#challenge_name').val(challenge.challenge_name);
  $('#challenge_id').val(challenge.challenge_id);
  $('#challenge_content').val(challenge.challenge_content);
  $('#points').val(challenge.points);
  $('#flag').val(challenge.flag);
  $('#admin_response').text('');
  $('#challenge_delete').show();

  $('#challenge_update').prop('disabled', false);
  $('#challenge_delete').prop('disabled', false);
  $('#add_edit_challenge').text('Edit Challenge');
  $('#challenge_update').text('Update challenge');
  $('#challenge_update').attr('onclick', 'editChallenge()');
}

function populateAdminChallenge(challenge_id) {
  ajaxGet('/v1/admin/challenge?challenge_id=' + challenge_id,
    addAdminChallengeToContent,
    () => {});
}

function populateAdminChallenges() {
  ajaxGet('/v1/admin/challenges',
    (data) => addChallengesToList(data, populateAdminChallenge),
    () => {});
}

function updateChallenge(url, onSuccess) {
  let challenge = inputToJSON();
  challenge.challenge_content = $('#challenge_content').val();

  ajaxPost(url, challenge,
    (data) => {
      changeAdminResponse(data);
      if (onSuccess) onSuccess();
    },
    (data) => changeAdminResponse(JSON.parse(data.responseText).error));
}

function deleteChallenge() {
  updateChallenge('/v1/admin/delete_challenge', () => {
    $('#challenge_update').prop('disabled', true);
    $('#challenge_delete').prop('disabled', true);
    populateAdminChallenges();
  });
}

function editChallenge() {
  updateChallenge('/v1/admin/edit_challenge');
}

function addChallenge() {
  updateChallenge('/v1/admin/add_challenge', () => {
    populateAdminChallenges();
    showAddChallenge();
  });
}

function populateConf() {
  ajaxGet('/v1/admin/get_conf',
    (data) => {
      for (let type in data) {
        $('#' + type).val(data[type]);
      }
    },
    () => {});
}

function setTimes() {
  let times = {
    start_time: $('#start_time').val(),
    end_time: $('#end_time').val()
  };

  ajaxPost('/v1/admin/set_times', times,
    () => $('#times_msg').text(''),
    (data) => $('#times_msg').text(JSON.parse(data.reponseText).error));
}

function setFlagFormat() {
  let flag_format = $('#flag_format').val();

  ajaxPost('/v1/admin/set_flag_format',
    { flag_format: flag_format },
    () => $('#flag_format_msg').text(''),
    (data) => $('#flag_format_msg').text(JSON.parse(data.responseText).error));
}

function populateAllAttempts() {
  ajaxGet('/v1/admin/all_attempts',
    populateAllAttemptsTable,
    () => {});
}
