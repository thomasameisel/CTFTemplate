/*jslint esversion: 6 */

function changeResponse(msg) {
  $('#response').text(msg);
}

function addChallengeToContent(challenge) {
  $('#challenge').empty();
  $('#response').text('');
  $('#flag').val('');
  $('#submit').show();

  let challengeDiv = document.getElementById('challenge');
  let challengeContent = challenge.challenge_content;
  let lines = challengeContent.split("\n");
  let tmp = '';
  lines.forEach(function(line) {
    if (line.length === 0) tmp += '<br />';
    else tmp += '<p>' + line + '</p>';
  });
  challengeDiv.innerHTML = tmp;
  $('#challenge_id').val(challenge.challenge_id);
}

function addChallengesToChallengesList(challenges) {
  $('#challenges').empty();

  if (challenges.length === 0) {
    let allDone = document.createElement('p');
    allDone.innerHTML = 'All done!';
    document.getElementById('challenges').appendChild(allDone);
  } else {
    addChallengesToList(challenges, populateChallenge);
  }
}

function createError(res) {
  let error = document.createElement('p');
  let response = JSON.parse(res.responseText).error;
  error.innerHTML = formatTimeResponse(response);
  return error;
}

function populateChallenge(challengeId) {
  $('#loading').css('display', 'block');
  $('#challenge_content').hide();
  ajaxGet('/v1/challenge?challenge_id=' + challengeId,
    (data) => {
      $('#loading').css('display', 'none');
      $('#challenge_content').show();
      $('#response').show();
      $('#flag').show();
      $('#submit').show();
      addChallengeToContent(data);
    },
    (data) => {
      $('#loading').css('display', 'none');
      $('#challenge_content').show();
      $('#challenge').empty();
      $('#response').hide();
      $('#flag').hide();
      $('#submit').hide();
      let error = createError(data);
      document.getElementById('challenge').appendChild(error);
    });
}

function populateChallenges() {
  ajaxGet('/v1/challenges',
    addChallengesToChallengesList,
    (data) => {
      let error = createError(data);
      document.getElementById('challenges').appendChild(error);
    });
}

function submitFlag() {
  let inputs = inputToJSON();
  if (!inputs.flag || inputs.flag.length === 0) changeResponse('Must provide flag');
  else {
    $('#submit_btn').prop('disabled', true);
    document.body.style.cursor='wait';

    ajaxPost('/v1/flag', inputs,
      (data) => {
        $('#submit_btn').prop('disabled', false);
        document.body.style.cursor='default';

        changeResponse(data.msg);
        populateChallenges();
        updatePoints();
      },
      (data) => {
        $('#submit_btn').prop('disabled', false);
        document.body.style.cursor='default';

        changeResponse(formatTimeResponse(JSON.parse(data.responseText).error));
      });
  }
}
