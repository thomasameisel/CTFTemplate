/*jslint esversion:6 */

function addTeamsToList(teams) {
  let tmp = '';
  teams.forEach(function(team) {
    tmp += '<tr>';
    tmp += createTableRow(team.username, team.username);
    tmp += createTableRow(team.points, team.username);
    tmp += '</tr>';
  });
  $('#leaderboard').append(tmp);
}

function populateLeaderboard() {
  ajaxGet('/v1/leaderboard_all_completed',
    (data) => {
      addTeamsToList(data.leaderboard);
      addChallengesToCompleted(data.all_completed);
    },
    () => {});
}
