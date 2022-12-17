const express = require("express");
const router = express.Router();
const client = require("../../../setup/db");
const helpers = require("../../../utilities/helpers");

router.post("/", (req, res) => {
    if (!("course_code" in req.body) || helpers.string_validate(req.body["course_code"])) {
        res.status(400).json({ message: "The course code is missing or has invalid format." });
        return;
    }
    if (!("course_session" in req.body) || helpers.string_validate(req.body["course_session"])) {
        res.status(400).json({ message: "The course session is missing or has invalid format." });
        return;
    }
    let hidden = false;
    if ("hidden" in req.body && req.body["hidden"].toLowerCase() === "true") {
        hidden = true;
    }
    
    let sql_add_course = "INSERT INTO course (course_code, course_session, hidden) VALUES (($1), ($2), ($3)) RETURNING course_id";
    let sql_add_data = [req.body["course_code"], req.body["course_session"], hidden];

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

            let task_table_name = "course_" + course_id + ".task";
            let criteria_table_name = "course_" + course_id + ".criteria";
            let mark_table_name = "course_" + course_id + ".mark";
            let group_table_name = "course_" + course_id + ".group";
            let group_user_table_name = "course_" + course_id + ".group_user";
            let interview_table_name = "course_" + course_id + ".interview";

            let sql_add_schema = "CREATE SCHEMA course_" + course_id + "; ";
            let sql_add_task_table = 
                "CREATE TABLE " + task_table_name + " (" + 
                "task character varying NOT NULL, due_date timestamp with time zone NOT NULL, " +
                "hidden boolean NOT NULL DEFAULT true,  min_member integer NOT NULL DEFAULT 1, max_member integer NOT NULL DEFAULT 1, " +
                "created_time timestamp with time zone DEFAULT current_timestamp, " +
                "PRIMARY KEY (task), UNIQUE (task)" +
                ");";
            let sql_add_criteria_table = 
                "CREATE TABLE " + criteria_table_name + "(" +
                "criteria_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ), " +
                "task character varying NOT NULL, criteria character varying NOT NULL, total numeric NOT NULL, " +
                "description character varying, PRIMARY KEY (criteria_id), UNIQUE (task, criteria), " +
                "CONSTRAINT task FOREIGN KEY (task) REFERENCES " + task_table_name + " (task) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" +
                ");";
            let sql_add_mark_table = 
                "CREATE TABLE " + mark_table_name + "(" +
                "criteria_id integer NOT NULL, username character varying NOT NULL, mark numeric NOT NULL, " +
                "old_mark numeric, task character varying NOT NULL, hidden boolean NOT NULL DEFAULT true, PRIMARY KEY (criteria_id, username), " +
                "CONSTRAINT criteria_id FOREIGN KEY (criteria_id) REFERENCES " + criteria_table_name + " (criteria_id) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID, " +
                "CONSTRAINT username FOREIGN KEY (username) REFERENCES public.user_info (username) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" +
                ");";
            let sql_add_group_table = 
                "CREATE TABLE " + group_table_name + "(" +
                "group_id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ), " +
                "task character varying NOT NULL, extension integer, PRIMARY KEY (group_id), " +
                "CONSTRAINT task FOREIGN KEY (task) REFERENCES " + task_table_name +" (task) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" + 
                ");";
            let sql_add_group_user_table = 
                "CREATE TABLE " + group_user_table_name + "(" +
                "task character varying NOT NULL, username character varying NOT NULL, group_id integer NOT NULL, " +
                "status character varying NOT NULL, PRIMARY KEY (task, username),  " +
                "CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES " + group_table_name + " (group_id) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID," +
                "CONSTRAINT username FOREIGN KEY (username) REFERENCES public.user_info (username) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" +
                ");";
            let sql_add_interview_table = 
                "CREATE TABLE " + interview_table_name + "(" +
                "interview_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 0 MINVALUE 0 ), " +
                'task character varying NOT NULL, "time" timestamp with time zone NOT NULL, ' +
                "host character varying NOT NULL, group_id integer, length integer, " +
                "location character varying DEFAULT 'Zoom', note character varying, " +
                'PRIMARY KEY (interview_id), UNIQUE(task, "time", host), ' +
                "CONSTRAINT task FOREIGN KEY (task) REFERENCES " + task_table_name +" (task) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID, " +
                "CONSTRAINT group_id FOREIGN KEY (group_id) REFERENCES " + group_table_name + " (group_id) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID, " +
                "CONSTRAINT username FOREIGN KEY (host) REFERENCES public.user_info (username) MATCH SIMPLE " +
                "ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID" +
                ");";

            let sql_all = sql_add_schema + sql_add_task_table + sql_add_criteria_table + sql_add_mark_table + 
                            sql_add_group_table + sql_add_group_user_table + sql_add_interview_table;
                        
            client.query(sql_all, [], (err, pgRes) => {
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