const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const tokenMiddleware = require("@hmsayar/shared/tokenMiddleware")
const rolesMiddleware = require("@hmsayar/shared/rolesMiddleware")
const path = require("path");
const fs = require("fs");
const ROLES = require("@hmsayar/shared/roles")

const publicKeyPath = path.resolve(__dirname, "../keys/public-key.pem");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");


router.post("/",tokenMiddleware(publicKey), rolesMiddleware(ROLES.User), commentController.createComment);
router.get("/post/:postId", commentController.getCommentsByPostId);
router.get("/:commentId", commentController.getCommentById);
router.put("/:commentId",tokenMiddleware(publicKey), rolesMiddleware(ROLES.User),  commentController.updateComment);
router.delete("/:commentId",tokenMiddleware(publicKey), rolesMiddleware(ROLES.User), commentController.deleteComment);

module.exports = router;