const amqp = require("amqplib/callback_api");
const Comment = require("../model/Comment");

const listenForDeleteCommentsByPost = () => {
  amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost", (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      const queue = "delete_comments_by_post";

      channel.assertQueue(queue, {
        durable: false,
      });

      console.log("Waiting for delete comments by post requests...");

      channel.consume(queue, async (msg) => {
        const postId = msg.content.toString();
        await deleteCommentsByPostId(postId);
      }, { noAck: true });
    });
  });
};

const deleteCommentsByPostId = async (postId) => {
  try {
    await Comment.deleteMany({ createdOn: postId });
    console.log(`Deleted comments for post: ${postId}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = listenForDeleteCommentsByPost;