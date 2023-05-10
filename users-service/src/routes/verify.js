const express = require("express");
const router = express.Router();
const verifyController = require("../controllers/verifyController")


router.get("/:verificationToken", verifyController.verifyUser)

module.exports = router;
