const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

router.post("/add", (req, res) => {
    if (!("course_code" in req.body) || helpers.string_validate(req.body["course_code"])) {
        res.status(400).json({ message: "The course code is missing or has invalid format." });
        return;
    }
    if (!("course_session" in req.body) || helpers.string_validate(req.body["course_session"])) {
        res.status(400).json({ message: "The course session is missing or has invalid format." });
        return;
    }
    
    let sql_add_course = "INSERT INTO course (course_code, course_session) VALUES (($1), ($2)) RETURNING course_id";
    let sql_add_data = [req.body["course_code"], req.body["course_session"]];

    client.query(sql_add_course, sql_add_data, (err, pgRes) => {
        if (err) {
            if (err.code === "23505") {
                res.status(409).json({ message: "The course must have unique course code and session." });
            } else {
                res.status(404).json({ message: "Unknown error." });
                console.log(err);
            }
        } else if (pgRes.rowCount === 1) {
            let course_id = pgRes.rows[0]["course_id"];

            let task_table_name = "course_" + course_id + ".course_task";
            let group_table_name = "course_" + course_id + ".course_group";
            let group_user_table_name = "course_" + course_id + ".course_group_user";

            let sql_add_schema = "CREATE SCHEMA course_" + course_id + "; ";
            let sql_add_task_table = 
                "CREATE TABLE " + task_table_name + " (" + 
                "course_task_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ), " +
                "task character varying NOT NULL, due_date timestamp with time zone NOT NULL, " +
                "hidden boolean NOT NULL DEFAULT true,  min_member integer NOT NULL DEFAULT 1, max_member integer NOT NULL DEFAULT 1, " +
                "task_order integer NOT NULL DEFAULT 0, PRIMARY KEY (course_task_id), UNIQUE (task)" +
                ");";
            let sql_add_group_table = 
                "CREATE TABLE " + group_table_name + "(" +
                "group_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ), " +
                "course_task_id integer NOT NULL, extension integer, PRIMARY KEY (group_id), " +
                "CONSTRAINT course_task_id FOREIGN KEY (course_task_id) REFERENCES " + task_table_name +" (course_task_id) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" + 
                ");";
            let sql_add_group_user_table = 
                "CREATE TABLE " + group_user_table_name + "(" +
                "course_task_id integer NOT NULL, username character varying NOT NULL, group_id integer NOT NULL, " +
                "status character varying NOT NULL, PRIMARY KEY (course_task_id, username),  " +
                "CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES " + group_table_name + " (group_id) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID," +
                "CONSTRAINT username FOREIGN KEY (username) REFERENCES public.user_info (username) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" +
                ");";

            client.query(sql_add_schema + sql_add_task_table + sql_add_group_table + sql_add_group_user_table, [], (err, pgRes) => {
                if (err) {
                    console.log(err);
                    res.status(404).json({ message: "The course is added but the course specific tables cannot be created." });
                } else {
                    res.status(200).json({ message: "The course is added and the course specific tables have been created." });
                }
            });
        }
    });
})

module.exports = router;