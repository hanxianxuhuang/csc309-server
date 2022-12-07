const express = require("express");
const router = express.Router();
const client = require("../../setup/db");
const helpers = require("../../utilities/helpers");

router.get("/backup", (req, res) => {
    if ("booked" in req.query && req.query["booked"] === "true"){
        var sql_backup = "SELECT id, task, CONCAT(to_char(time AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI'), ' America/Toronto') AS time, ta, student, length, location, cancelled, note FROM interviews WHERE student is not NULL ORDER BY time";
    } else{
        var sql_backup = "SELECT id, task, CONCAT(to_char(time AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI'), ' America/Toronto') AS time, ta, student, length, location, cancelled, note FROM interviews ORDER BY time";
    }
    client.query(sql_backup, [], (err, pgRes) => {
        if (err) {
            res.status(404).json({ message: "Unknown error." });
        } else {
            helpers.send_interviews_csv(pgRes.rows, res, true, "complete");
        }
    });
})

module.exports = router;