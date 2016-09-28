/*jslint esversion: 6 */

function changeResponse(msg) {
  $('#response').text(msg);
}

function addChallengeToContent(challenge) {
  $('#challenge').empty();

  let challengeDiv = document.getElementById('challenge');
  let challengeContent = challenge.challenge_content;
  let lines = challengeContent.split("\n");
  lines.forEach(function(line) {
    if (line.length === 0) challengeDiv.innerHTML += '<br />';
    else challengeDiv.innerHTML += '<p>' + line + '</p>';
  });
  challengeDiv.innerHTML +=
    '<form>\n' +
      '<input type="text" id="flag" />\n' +
      '<input type="text" id="challenge_id" value="' + challenge.challenge_id + '" hidden />\n' +
      '<button type="button" onclick="submitFlag()">Submit</button>\n' +
    '</form>\n' +
    '<h5 id="response"></h5>\n';
}

function addChallengesToList(challenges) {
  $('#challenges').empty();

  if (challenges.length === 0) {
    let allDone = document.createElement('p');
    allDone.innerHTML = 'All done!';
    document.getElementById('challenges').appendChild(allDone);
  } else {
    for (let i = 0; i < challenges.length; ++i) {
      let challenge = document.createElement('a');
      challenge.style = 'display:block';
      challenge.id = challenges[i].challenge_id;
      challenge.innerHTML = challenges[i].challenge_name + ' (' + challenges[i].points + ' points)';
      challenge.addEventListener('click', () => {
        populateChallenge(challenges[i].challenge_id);
      });
      document.getElementById('challenges').appendChild(challenge);
    }
  }
}

function populateChallenge(challengeId) {
  ajaxGet('/v1/challenge?challenge_id=' + challengeId,
    addChallengeToContent,
    () => {});
}

function populateChallenges() {
  ajaxGet('/v1/challenges',
    addChallengesToList,
    () => {});
}

function submitFlag() {
  let inputs = inputToJSON();
  if (inputs.flag && inputs.flag.length > 0) {
    ajaxPost('/v1/flag', inputs,
      (data) => {
        changeResponse(data.msg);
        populateChallenges();
        updatePoints();
      },
      (data) => changeResponse(JSON.parse(data.responseText).error));
  } else {
    changeResponse('Must supply challenge_id and flag');
  }
}
