## CTF Template

Uses Node.js and SQLite

### First Run
Run <code>sudo ubuntu_setup.sh</code> to set up the environment in Ubuntu in order to run this project.

Run <code>npm install</code> then <code>npm start</code> in the repo's root directory. The server runs on the 8080 port. It will create two db files - one for sessions (sessions.db) and one for the CTF competition (ctf.db).


On first run, the program will prompt you to create an admin account. When logged in using this account, you can add, edit, and delete challenges using the "Admin" tab.

### Usage
There are several tabs that are available for CTF participants:

- Leaderboard
  - View the leaderboard and the challenges completed
- Challenges
  - View and submit challenges
  - Challenges are ordered by points
- Profile
  - View challenges completed by your team
- Logout

The team's points is also shown in the header.

The Admin and All Attempts tabs are also shown when logged in as the admin:

- Admin
  - Add and edit challenges
    - Text in the Challenge Content box is rendered as HTML
    - Multiple flags for a challenge can be added by clicking the "Add Flag" button
    - Flags for a challenge can also be deleted by clicking the "Delete Flag" button
    - Flags are converted to lower case in order to make flag verification more accurate
  - Delete challenges
  - Set start and end time for the competition

- All Attempts
  - View all the flag submission attempts ordered by the time attempted
  - "null" in the "correct" column means that team has already successfully completed that challenge and had attempted to submit the challenge again
