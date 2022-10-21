const express = require("express");
const router = express.Router();
const authRouter = require("./student/auth");
const interviewsRouter = require("./student/interviews");
const filesRouter = require("./student/files");
const marksRouter = require("./student/marks");

router.use("/", function (req, res, next) {
    next();
})

router.use("/auth", authRouter);
router.use("/interviews", interviewsRouter);
router.use("/files", filesRouter);
router.use("/marks", marksRouter);

module.exports = router;