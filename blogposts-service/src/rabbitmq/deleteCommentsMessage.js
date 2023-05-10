const amqp = require("amqplib/callback_api");
const Blogpost = require("../model/Blogpost")

const sendMessage = (queue, message) => {
    amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost", (error0, connection) => {
      if (error0) {
        throw error0;
      }
  
      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }
  
        channel.assertQueue(queue, {
          durable: false,
        });
  
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Sent message to ${queue}: ${message}`);
      });
    });
  };
  
  module.exports = sendMessage;