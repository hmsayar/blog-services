const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const tokenMiddleware = require("@hmsayar/shared/tokenMiddleware")
const rolesMiddleware = require("@hmsayar/shared/rolesMiddleware")
const path = require("path");
const fs = require("fs");
const ROLES = require("@hmsayar/shared/roles")
const verifyController = require("../controllers/verifyController")
const signupController = require("../controllers/signupController")
const refreshController = require("../controllers/refreshController")
const loginController = require("../controllers/loginController")



const publicKeyPath = path.resolve(__dirname, "../keys/public-key.pem");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

router.get("/:userId", userController.getUserById);
router.put("/:userI",tokenMiddleware(publicKey), rolesMiddleware(ROLES.Admin), userController.updateUser);
router.delete("/:userId",tokenMiddleware(publicKey), rolesMiddleware(ROLES.Admin), userController.deleteUser);
router.get("/verify/:verificationToken", verifyController.verifyUser)
router.post("/signup", signupController.registerUser)
router.get("/refresh", refreshController.refreshUser)
router.post("/login", loginController.loginUser)







module.exports = router