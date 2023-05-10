const express = require("express");
const router = express.Router();
const blogPostController = require("../controllers/blogPostController");
const tokenMiddleware = require("@hmsayar/shared/tokenMiddleware")
const rolesMiddleware = require("@hmsayar/shared/rolesMiddleware")
const path = require("path");
const fs = require("fs");
const ROLES = require("@hmsayar/shared/roles")

const publicKeyPath = path.resolve(__dirname, "../keys/public-key.pem");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

router.get("/search", blogPostController.searchBlogpostByTitle);
router.get("/latest", blogPostController.getLatestBlogPosts);
router.post("/",tokenMiddleware(publicKey), rolesMiddleware(ROLES.Admin, ROLES.Editor), blogPostController.createBlogPost);
router.get("/:postId", blogPostController.getBlogPostById);
router.put("/:postId",tokenMiddleware(publicKey),rolesMiddleware(ROLES.Admin, ROLES.Editor, ROLES.Moderator), blogPostController.updateBlogPost);
router.delete("/:postId",tokenMiddleware(publicKey), rolesMiddleware(ROLES.Admin, ROLES.Editor, ROLES.Moderator), blogPostController.deleteBlogPost);

module.exports = router;

