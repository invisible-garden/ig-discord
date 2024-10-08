# Form2Role-Bot

## About

This is modified version of [supreen](https://github.com/supreen)'s bot. The bot assigns the roles found in the config file to the usernames found in a Google Sheet and it can also update the role status based on a checkbox next to the discord name.

## Required fields

The only field that you must have in your Google Form and Google Sheet is the DiscordID. Your DiscordID it's made up of your username, and it looks like this: `SomeUsername`. The bot needs it to identify users and assign roles to them.

## Warning

Duplicated usernames won't be recognized by the bot because the discriminator Discord used to require is not available anymore, therefore to achieve uniqueness in case of duplicates, you need to use the discord ID itself which looks like this `1240063063336423474` and can be copied in the server by right-clicking on the user and selecting "Copy ID" while in developer mode.

## How to get your Google details

### API key

- Go to https://console.developers.google.com
- Login and Agree to the Terms of Service
- Create a Project by pressing "Create Project" on the right-hand side
- Click "Create", give the project a name and then "Create" again.
- Once the dashboard loads, click on "ENABLE APIS AND SERVICES" in blue text.
- Search for "Sheets" and click on "Google Sheets API" and then "ENABLE"
- Click on "Credentials" on the left side of the page.
- Select "Create credentials" and then "API Key"

### Spreadsheet ID

- Go to your Google Sheets document and make sure it is accessible to anyone with the link, view-only.
- The id is the part from your URL that comes after _/d/_. If the url is _https://docs.google.com/spreadsheets/d/1cARfZI0jFa19yFtOnD9BKbFIwZgTkJd2l2oWzGW5eJI/edit?usp=sharing_, your id is **1cARfZI0jFa19yFtOnD9BKbFIwZgTkJd2l2oWzGW5eJI**.
- Make sure the spreadsheet is set to view-only and accessible to anyone with the link.

### Range

- If the column that contains the Discord IDs is B and the IDs start from row 2 then the range value is `B2:B`.
- Since we are using a status checkbox, if the checkbox is in column C and the usernames are in column B, the range value is `B2:C`.

## How to setup a Discord bot

You will need a bot token, to generate one follow these steps:

- Go to https://discordapp.com/developers and login
- Create an application and give it a name and a description
- Select "Save Changes" at the bottom right and then navigate to the "Bot" section on the left-hand side.
- There, create a bot user by clicking on "Add Bot".
- Under **_PRIVILEGED GATEWAY INTENTS_** activate _SERVER MEMBERS INTENT_ and save the changes.
  After confirming, reveal the token.

Invite the bot to your discord server:

- Go to OAuth2 section of your developer application
- Under _SCOPES_ check bot
- Under _BOT PERMISSIONS_ check _Manage Roles_
- Now go to the url generated in the _SCOPES_ section and invite the bot to your server
- Make sure the bot role is above the roles it has to assign

## Configuration steps

1. Install Node.JS
2. Download the latest bot version from the release tab and unzip it
3. Go to the `config` folder, copy and paste the two config files, and rename them by removing `.example`
4. Open `google.json` and complete your API key, your Spreadsheet id and your range (See How to get your Google details). All of these are strings, so make sure they are enclosed in quotation marks.
5. Open `discord.json` and complete your token and the role names that you want the bot to assign. The token is a string, so it must be enclosed in quotation marks. The roles property is an array, it holds all of the role names that will be assigned o the users found in the Google Sheet. If you only want to assign one role then it should look like this: `["Role name"]`; otherwise `["First role name", "Second role name"]` and so on, make sure to separate the names with a comma ( , )
6. Go back to the root folder, open a terminal here and run these commands: `npm install`, wait for it to finish then run `npm start`.

Congratulations, if you did everything correctly you now have Form2Role bot running.
