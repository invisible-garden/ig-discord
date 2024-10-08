const { google } = require("googleapis");
const Discord = require("discord.js");

const config = require("./config/config.json");
const rate = 60;

const connection = google.sheets({
  version: "v4",
  auth: config.google.apiKey,
});

const client = new Discord.Client();

let oldRows = [];
let guild = null;

const logError = (error) => {
  console.error("error log " + new Date());
  console.error(error);
};

const fetchRows = async (spreadsheetId, range, sheetsConnection) => {
  try {
    // Get the rows from the Google Sheet
    const response = await sheetsConnection.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    const rows = response.data.values;

    // Remove duplicates
    const uniqueRows = rows.filter(
      (row, index, self) => index === self.findIndex((r) => r[0] === row[0]),
    );

    return uniqueRows;
  } catch (error) {
    // if (rows === undefined) console.error("Google Sheet is empty");
    logError(error);
  }
};

const extractNewEntries = (_oldRows, rows) => {
  if (JSON.stringify(rows) !== JSON.stringify(_oldRows)) {
    oldRows = rows;
    console.log("Update required");
    return true;
  } else {
    console.log("No update required");
  }
  return false;
};

const extractDiscordIDs = (rows) => {
  return rows.map((user) => user[0]);
};

const rolesMatching = (builders, others_rows, coworkers_rows) => {
  let users = {};

  builders.forEach(builder => {
    users[builder] = [config.discord.builder_role];
  });

  others_rows.forEach(other => {
    let username = other[0].trim().toLowerCase();
    let role = other[1];

    if (username != "" && role != "") {
      users[username] = [config.discord.roles[role]];
    }
  });

  coworkers_rows.forEach(coworker => {
    let username = coworker[0].trim().toLowerCase();
    let weeks = coworker[1];
    if (username == "" || weeks == "") {
      return;
    }

    let roles = [];

    ["1", "2"].forEach(week => {
      if (weeks.includes(week)) {
        roles.push("cm24-coworker" + week);
      }
    });

    users[username] = roles;
  });

  return users;
}

const assignRoles2 = async (users) => {
  try {
    console.log("Fetching discord members...");
    await guild.members.fetch({ force: true });
    console.log("Discord members fetched.")
    await guild.roles.fetch();

    const usernames = Object.keys(users);

    // Filter the members that are in the server with the ones in the sheet
    const members_wr = guild.members.cache.filter((member) => {
      console.log(member.user.username, member.nickname, member.displayName, member.user.displayName);
      return usernames.includes(`${member.user.username?.toLowerCase()}`) || usernames.includes(`${member.nickname?.toLowerCase()}`);
    });

    const members = members_wr.map((member) => {
      if (usernames.includes(`${member.user.username?.toLowerCase()}`)) {
        member.desired_roles = users[member.user.username?.toLowerCase()];
      } else if (usernames.includes(`${member.nickname?.toLowerCase()}`)) {
        member.desired_roles = users[member.nickname?.toLowerCase()];
      }

      return member;
    });

    let i = 0;
    for (const member of members) {
      const notAssignedRoles = [];

      // Check if the user already has the role assigned
      guild.roles.cache.forEach((role) => {
        if (!member.roles.cache.has(role.id) && member.desired_roles.includes(role.name)) {
          notAssignedRoles.push(role);
        }
      });

      // Can only add the role in case theu ser doesn't have it and the sheet says to add it
      if (notAssignedRoles.length > 0) {
        await member.roles.add(notAssignedRoles);
        console.log(
          `Assigned ${notAssignedRoles.map(r => r.id).join(", ")} to ${member.user.username} #${member.user.discriminator
          } `,
        );
        // Will remove the role in case the sheet says to remove it
      } else {
        console.log(
          `${member.user.username} #${member.user.discriminator} already has all the roles assigned`,
        );
      }

      i++;
    }
  } catch (err) {
    console.log(err);
    logError(err);
  }
};

const run = async () => {
  console.log("Bot started with these settings:");
  console.log(`• Spreadsheet ID: ${config.google.builders_spreadsheetId} `);
  console.log(`• Range: ${config.discord.builder_role} `);
  console.log(`• Rate: ${rate} seconds`);
  console.log(`• Role: ${config.discord.builder_role} `);
  console.log(`• Server: ${guild ? guild.name : "Error! Bot isn't a member of any server!"} `);
  console.log("\nChecked for updates on " + new Date().toString());

  let builder_rows = await fetchRows(config.google.builders_spreadsheetId, config.google.builders_range, connection);
  let builders = extractDiscordIDs(builder_rows).map(v => v.toLowerCase());
  let others_rows = await fetchRows(config.google.others_spreadsheetId, config.google.others_range, connection);
  let coworkers_rows = await fetchRows(config.google.others_spreadsheetId, config.google.coworkers_range, connection);

  let users = rolesMatching(builders, others_rows, coworkers_rows);

  await assignRoles2(users);

  console.log("Done");
  process.exit(0);
}

client.once("ready", () => {
  run();
});

const start = async () => {
  try {
    await client.login(config.discord.token);

    guild = client.guilds.cache.first();
    if (!guild) {
      throw new Error("Error! Bot isn't a member of any server!");
    }
  } catch (err) {
    logError(err);
  }
};

start();

// client.on("disconnect", start);
client.on("error", logError);

module.exports = {
  fetchRows,
  extractNewEntries,
  extractDiscordIDs,
};
