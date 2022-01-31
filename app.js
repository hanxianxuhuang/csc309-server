/* 
	General Setup 
*/
const express = require("express");
const app = express();

app.set('trust proxy', 0); // get the real ip address
app.get('/ip', (request, response) => response.send(request.ip));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const multer = require('multer');
var upload = multer();
app.use(upload.array());

const cors = require("cors");
app.use(cors());

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})