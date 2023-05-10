const Blogpost = require("../model/Blogpost");
const ROLES = require("@hmsayar/shared/roles")
const createRedisHelpers = require("@hmsayar/shared/redisHelpers");

const createRedisClient = require("@hmsayar/shared/redisClient");
const redisClient = createRedisClient(process.env);
const redisHelpers = createRedisHelpers({
  redisClient: redisClient,
  userServiceUrl: process.env.userServiceUrl
});
const deleteCommentsMessages = require("../rabbitmq/deleteCommentsMessage")
const uploadToS3 = require("../amazon/uploadToS3")
const deleteImagesFromS3 = require("../amazon/deleteImagesFromS3");



const searchBlogpostByTitle = async (req, res) => {
  try {
      const searchParam = req.query.searchParam;
      const blogPosts = await Blogpost.find({ title: { $regex: new RegExp(searchParam, "i") } })

      if (!blogPosts) {
          return res.status(404).json({ message: "No blog posts found with the given search parameter." });
      }

      res.status(200).json(blogPosts );
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred while searching for blog posts." });
  }
};

const getLatestBlogPosts = async(req,res) => {
  const result = await redisHelpers.getLatestPosts()
  res.status(201).json(result)
}

const createBlogPost = async (req, res) => {
  if (!req?.body?.title || !req?.body?.post) {
    return res.status(400).json({ "message": "Blogpost required" });
  }

  try {
    const newBlogpost = await Blogpost.create({
      postedBy: req.id,
      title: req.body.title,
      post: ".",
    });

    const imgRegex = /<img[^>]*?src="data:image\/(png|jpeg|jpg|gif);base64,([^"]*?)"[^>]*?>/g;
    let updatedPostContent = req.body.post;
    let match;

    while ((match = imgRegex.exec(req.body.post)) !== null) {
      const base64ImageWithPrefix = `data:image/${match[1]};base64,${match[2]}`;
      const imgTag = match[0];

      const imageUrl = await uploadToS3(base64ImageWithPrefix, newBlogpost._id.toString());
      updatedPostContent = updatedPostContent.replace(imgTag, `<img src="${imageUrl}">`);
    }

    newBlogpost.post = updatedPostContent;
    await newBlogpost.save();

    await redisClient.lPush("latest_posts", JSON.stringify(newBlogpost));
    await redisClient.lTrim("latest_posts", 0, 9);
    res.status(201).json(newBlogpost);
  } catch (err) {
    console.error(err);
  }
};


const getBlogPostById = async (req, res) => {
  if (!req?.params?.postId) return res.status(400).json({ "message": "Blogpost ID required" });

  try {
    const blogPost = await Blogpost.findOne({ _id: req.params.postId })

    if (!blogPost) {
      return res.status(204).json({ "message": `Blogpost ID ${req.params.id} not found` });
    }
    try {
      const user = await redisHelpers.getUser(blogPost.postedBy.toString());
      res.json({
        blogPost,
        createdBy: { _id: user._id, username: user.username },
      });

    } catch (err) {
      console.error("Error:", err.message);
    }
  } catch (err) {
    console.error(err.message)
  }
};



const updateBlogPost = async (req, res) => {
  if (!req?.params?.postId) return res.status(400).json({ "message": "Blogpost ID required" });
  if (!req?.body?.newTitle && !req?.body?.newBlogPost) {
    return res.status(400).json({ "message": "There are not any change in blogpost" });
  }

  try {

    const blogPost = await Blogpost.findOne({ _id: req.params.postId })

    if (!blogPost) {
      return res.status(204).json({ "message": `Blogpost ID ${req.params.postId} not found` });
    }
    if (req.roles.includes(ROLES.Admin) || req.roles.includes(ROLES.Moderator)) {
      if (req.body?.newTitle) blogPost.title = req.body.newTitle;
      if (req.body?.newBlogPost) blogPost.post = req.body.newBlogPost;
      const result = await blogPost.save();
      return res.json({ message: "Blogpost updated successfully by admin or mod" });
    } else if (req.roles.includes(ROLES.Editor)) {
      if (blogPost.postedBy.toString() !== req.id) {
        return res.status(403).json({ message: "You are not the editor who own this blogpost" });
      }
      if (req.body?.newTitle) blogPost.title = req.body.newTitle;
      if (req.body?.newBlogPost) blogPost.post = req.body.newBlogPost;
      const result = await blogPost.save();
      return res.json({ message: "Blogpost updated successfully by editor" });
    } else {
      return res.status(403).json({ message: "You are not authorized to update blogpost" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ "message": "Internal server error" });
  }

};

async function updateLatestPostsCache() {
  const latestPosts = await Blogpost.find().sort({ createdAt: -1 }).limit(10);
  await redisClient.del("latest_posts");
  for (const post of latestPosts) {
    await redisClient.lPush("latest_posts", JSON.stringify(post));
  }
}

const deleteBlogPost = async (req, res) => {
  if (!req?.params?.postId) return res.status(400).json({ "message": "Blogpost ID required" });
  try {
    const blogPost = await Blogpost.findById(req.params.postId);
    if (!blogPost) return res.status(204).json({ "message": `Blogpost ID ${req.params.postId} not found` });

    if (req.roles.includes(ROLES.Admin) || req.roles.includes(ROLES.Moderator)) {
      await Blogpost.deleteOne({ _id: req.params.postId });
      await deleteImagesFromS3(req.params.postId);
      //TODO: Delete relevant comments.
      deleteCommentsMessages("delete_comments_by_post", req.params.postId); 
      await updateLatestPostsCache();
      return res.json({ message: "Blogpost deleted successfully by admin or mod" });
    } else if (req.roles.includes(ROLES.Editor)) {
      if (blogPost.postedBy.toString() !== req.id) {
        return res.status(403).json({ message: "You are not the editor who own this blogpost" });
      }
      await Blogpost.deleteOne({ _id: req.params.postId });
      await deleteImagesFromS3(req.params.postId);
      //TODO: Delete relevant comments.
      deleteCommentsMessages("delete_comments_by_post", req.params.postId); 
      return res.json({ message: "Blogpost deleted successfully by editor" });
    } else {
      return res.status(403).json({ message: "You are not authorized to delete blogpost" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ "message": "Internal server error" });
  }
};

module.exports = {
  searchBlogpostByTitle,
  getLatestBlogPosts,
  createBlogPost,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
};