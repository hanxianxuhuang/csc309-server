/* 
	General Setup 
*/
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cors = require("cors");
app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const port = 3000;

const a3Router = require('./routes/a3');
const interviewsRouter = require('./routes/interviews');
const interviewsTaRouter = require('./routes/interviews_ta');

const rate_limit = require("./setup/rate_limit");

/* 
	Routes 
*/
app.get("/", rate_limit.general_limiter, (req, res) => {
	res.status(418).json({ message: "Why are you here??? LOL --Howie" });
})

app.use('/a3', a3Router);

app.use('/interviews', interviewsRouter);

app.use('/interviews_ta', interviewsTaRouter);

app.use(express.static(__dirname + "/public"));

app.get("/interviews_ta_ui", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})