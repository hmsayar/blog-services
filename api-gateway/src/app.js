require('dotenv').config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const cors = require('cors');

// Add this line before your proxy middleware configurations
app.use(cors());

const usersServiceUrl = process.env.userServiceUrl;
const blogPostsServiceUrl = process.env.blogpostServiceUrl;
const commentsServiceUrl = process.env.commentServiceUrl;


app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


app.use("/users/", createProxyMiddleware({ target: usersServiceUrl, changeOrigin: true }));
app.use("/blogposts/", createProxyMiddleware({ target: blogPostsServiceUrl, changeOrigin: true }));
app.use("/comments/", createProxyMiddleware({ target: commentsServiceUrl, changeOrigin: true }));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});