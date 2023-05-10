const amqp = require("amqplib/callback_api");

const checkIfPostExists = (postId, callback) => {
  amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost", (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertQueue('', { exclusive: true }, (error2, q) => {
        if (error2) {
          throw error2;
        }
        console.log("q: " + JSON.stringify(q))
        const correlationId = generateUuid();
        const queue = "check_post_exists";

        console.log("Requesting post existence check...");

        channel.consume(q.queue, (msg) => {
          if (msg.properties.correlationId === correlationId) {
            const postExists = msg.content.toString() === "true";
            callback(postExists);
            setTimeout(() => {
              connection.close();
            }, 500);
          }
        }, { noAck: true });
        console.log("q: " + JSON.stringify(q.queue))
        channel.sendToQueue(queue, Buffer.from(postId), {
          correlationId: correlationId,
          replyTo: q.queue,
        });
      });
    });
  });
};

const generateUuid = () => {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
};

module.exports = checkIfPostExists