const amqp = require("amqplib/callback_api");
const Blogpost = require("../model/Blogpost")

const listenForPostExistenceChecks = async () => {
  amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost", (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      const queue = "check_post_exists";

      channel.assertQueue(queue, {
        durable: false,
      });

      console.log("Waiting for post existence check requests...");

      channel.consume(queue, async (msg) => {
        const postId = msg.content.toString();
        const postExists = await doesPostExist(postId);
        console.log(msg)
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(postExists.toString()), {
          correlationId: msg.properties.correlationId,
        });
      }, { noAck: true });
    });
  });
};

const doesPostExist = async (postId) => {
  try {
    const post = await Blogpost.findById(postId);
    return !!post;
  } catch (err) {
    console.error(err);
    return false;
  }
};


module.exports = listenForPostExistenceChecks