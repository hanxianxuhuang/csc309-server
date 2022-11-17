const express = require("express");
const router = express.Router();
const registerRouter = require("./a2/register");
const textDataRouter = require("./a2/text_data");
const textLikesRouter = require("./a2/text_likes");

router.use("/", function (req, res, next) {
    res.status(402).json({message: "You don't have access to this page."});
})

router.use("/", registerRouter);
router.use("/", textDataRouter);
router.use("/", textLikesRouter);

module.exports = router;