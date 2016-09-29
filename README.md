## CTF Template

Uses Node.js and SQLite

### First Run
Run "npm start" in the repo's root directory. This will create two db files - one for sessions (sessions.db) and one for the ctf competition (ctf.db).


On first run, the program will prompt you to create an admin account. When logged in using this account, you can add, edit, and delete challenges using the "Admin" tab.

### Usage
There are several tabs that are available for CTF participants:

- Leaderboard
  - View the leaderboard and the challenges completed
- Challenges
  - View and submit challenges
- Profile
  - View challenges completed by your team
- Logout

The team's points is also shown in the header.

The Admin tab is also shown when logged in as the admin:

- Admin
  - Add and edit challenges
    - Text in the Challenge Content box is rendered as HTML
  - Delete challenges
