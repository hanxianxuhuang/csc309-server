const express = require("express");
const router = express.Router();
const middlewareIndividualRouter = require("./auth/middleware_individual");
const rawRouter = require("./marks/raw");

router.use("/", function (req, res, next) {
	next();
});

router.use("/", middlewareIndividualRouter);
router.use("/", rawRouter);

module.exports = router;