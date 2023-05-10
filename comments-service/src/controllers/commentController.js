const Comment = require("../model/Comment")
const checkIfPostExists = require("../rabbitmq/checkIfPostExists")
const ROLES = require("@hmsayar/shared/roles")


const createRedisClient = require("@hmsayar/shared/redisClient");
const createRedisHelpers = require("@hmsayar/shared/redisHelpers");
const redisClient = createRedisClient(process.env);
const redisHelpers = createRedisHelpers({
  redisClient: redisClient,
  userServiceUrl: process.env.userServiceUrl
});



const createComment = async (req, res) => {
  const { commentContent, postId } = req.body;

  if (!commentContent || !postId) {
    return res.status(400).json({ message: "Comment content and post ID are required." });
  }

  checkIfPostExists(postId, async (postExists) => {
    if (!postExists) {
      return res.status(404).json({ message: "Post not found." });
    }

    try {
      const comment = await Comment.create({
        commentContent,
        createdBy: req.id,
        createdOn: postId
      });

      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: "An error occurred while creating the comment." });
    }
  })
};

const getCommentsByPostId = async (req, res) => {
  const postId = req.params.postId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ createdOn: postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  try {
    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        try {
          const user = await redisHelpers.getUser(comment.createdBy.toString());
          // const response = await axios.get(`${process.env.userServiceUrl}/users/${comment.createdBy}`);
          // const user = response.data;
          return { ...comment.toObject(), createdBy: { _id: user._id, username: user.username } };
        } catch (error) {
          console.log("can't find")
          return comment;
        }
      })

    );
    const totalComments = await Comment.countDocuments({ createdOn: postId });
    res.json({
      commentsWithUsernames,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit)
    });

  } catch (err) {
    console.log("oopss");
  }

}

const getCommentById = async (req, res) => {
  if (!req?.params?.commentId) return res.status(400).json({ "message": "Comment ID required" });

  const comment = await Comment.findById(req.params.commentId);
  if(!comment) return res.status(204).json({ "message": `Comment ID ${req.params.commentId} not found` });
  try{
    const user = await getUser(comment.createdBy.toString());
    res.json({comment, user});

  }catch(error){
    console.error(error)
  }
};

const updateComment = async (req, res) => {
  if(!req?.body?.newComment) return res.status(400).json({ "message": "Comment content required" });
  if (!req?.params?.commentId) return res.status(400).json({ "message": "Comment ID required" });
  const comment = await Comment.findById(req.params.commentId);
  if(!comment) return res.status(204).json({ "message": `Comment ID ${req.params.commentId} not found` });
  
  try{
    if (req.roles.includes(ROLES.Admin) || req.roles.includes(ROLES.Moderator)) {
      if (req.body?.newComment) comment.commentContent = req.body.newComment;
      const result = await comment.save();
      return res.json({ message: "Comment updated successfully by admin or mod" });
    }else if(req.roles.includes(ROLES.User)){
      if(comment.createdBy.toString() !== req.id){
        return res.status(403).json({ message: "This is not your comment" });
      }
      if (req.body?.newComment) comment.commentContent = req.body.newComment;
      const result = await comment.save();
      return res.json({ message: "Comment updated successfully by owner" });
    }else{
      return res.status(403).json({ message: "You are not authorized to update comment" });
    }
  }catch(error){
    console.error(error)
  }

};


const deleteComment = async (req, res) => {
  if (!req?.params?.commentId) return res.status(400).json({ "message": "Comment ID required" });
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(204).json({ "message": `Comment ID ${req.params.postId} not found` });

    if (req.roles.includes(ROLES.Admin) || req.roles.includes(ROLES.Moderator)  || comment.createdBy.toString() === req.id) {
      await Comment.deleteOne({ _id: req.params.commentId });
      return res.json({ message: `Comment deleted successfully by ${req.roles}` });
    } else {
      return res.status(403).json({ message: "You are not authorized to delete Comment" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ "message": "Internal server error" });
  }
};

module.exports = {
  getCommentsByPostId,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
};