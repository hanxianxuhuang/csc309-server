const express = require("express");
const router = express.Router();
const submitRouter = require("./a1/submit");

router.use("/", function (req, res, next) {
    res.status(402).json({message: "You don't have access to this page."});
})

router.use(express.static("./public/student/a1"));

router.use("/", submitRouter);

module.exports = router;