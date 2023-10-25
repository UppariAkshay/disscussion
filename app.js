const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectIntoResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jerseyNumber,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const sqlQuery = `SELECT *
    FROM cricket_team 
    ORDER BY player_id`;
  const playerArray = await db.all(sqlQuery);
  response.send(
    playerArray.map((eachPlayer) =>
      convertDbObjectIntoResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const sqlQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}')`;

  const dbResponse = await db.run(sqlQuery);

  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const sqlQuery = `SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}`;

  let playerDetails = await db.get(sqlQuery);
  response.send(convertDbObjectIntoResponseObject(playerDetails));
});

app.put("/players/:playerId/", async (request, response) => {
  const dataToBeUpdated = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = dataToBeUpdated;
  const sqlQuery = `UPDATE cricket_team
        SET player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE player_id = ${playerId}`;

  await db.run(sqlQuery);

  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const sqlQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  db = await db.run(sqlQuery);
  response.send("Player Removed");
});

module.exports = app;
