/*jslint esversion:6 */

function populateAllAttemptsTable(attempts) {
  let tmp = '';
  attempts.forEach(function(attempt) {
    tmp += '<tr>';
    tmp += createTableRow(attempt.username);
    tmp += createTableRow(attempt.challenge_name);
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
  $('#admin_response').text('');
  $('#challenge_delete').hide();
  $('#flags').empty().append( $('#default_flag_div').clone().show().attr('id', 'flag_div') );

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
  $('#flags').empty().append( $('#default_flag_div').clone().show().attr('id', 'flag_div') );
  $('#flag_div input').val(challenge.flags[0]);
  for (let i = 1; i < challenge.flags.length; ++i) {
    addFlag(challenge.flags[i]);
  }
  $('#admin_response').text('');
  $('#challenge_delete').show();

  $('#challenge_update').prop('disabled', false);
  $('#challenge_delete').prop('disabled', false);
  $('#add_edit_challenge').text('Edit Challenge');
  $('#challenge_update').text('Update challenge');
  $('#challenge_update').attr('onclick', 'editChallenge()');
}

function deleteFlag(id) {
  $('#' + id).remove();
}

function addFlag(flag) {
  let newFlagDiv = $('#flags div:last-child').clone();
  newFlagDiv.find('input').val('');
  newFlagDiv.attr('num', parseInt(newFlagDiv.attr('num'))+1);
  newFlagDiv.attr('id', 'flag_div_' + newFlagDiv.attr('num'));
  if (flag) newFlagDiv.find('input').val(flag);
  $('#flags').append(newFlagDiv);
  $('#flags div:nth-last-child(2) span button').text('Delete Flag')
    .attr('onclick', 'deleteFlag("' + $('#flags div:nth-last-child(2)').attr('id') + '")');
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
  challenge.flags = $('#flags input').map(function() {
    if ($(this).val() && $(this).val().length > 0) {
      return $(this).val();
    }
  }).get();

  ajaxPost(url, challenge,
    (data) => {
      changeAdminResponse(data);
      populateAdminChallenges();
      if (onSuccess) onSuccess();
    },
    (data) => changeAdminResponse(JSON.parse(data.responseText).error));
}

function deleteChallenge() {
  updateChallenge('/v1/admin/delete_challenge', () => {
    $('#challenge_update').prop('disabled', true);
    $('#challenge_delete').prop('disabled', true);
  });
}

function editChallenge() {
  updateChallenge('/v1/admin/edit_challenge');
}

function addChallenge() {
  updateChallenge('/v1/admin/add_challenge', showAddChallenge);
}

function populateConf() {
  ajaxGet('/v1/admin/get_conf',
    (rows) => {
      rows.forEach((row) => {
        let value = row.value;
        if (Number.isInteger(value)) {
          value = moment(value*1000).format('YYYY-MM-DDTHH:mm');
        }
        $('#' + row.type).val(value);
      });
    },
    () => {});
}

function setTimes() {
  let times = {
    start_time: moment($('#start_time').val()).unix(),
    end_time: moment($('#end_time').val()).unix()
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
