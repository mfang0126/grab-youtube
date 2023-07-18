import { connect } from "amqplib";
import { RABBITMQ_URL } from "~/config";
import { type JobData } from "~/typing";

export const sendMessageToQueue = async (
  queueName: string,
  message: JobData
) => {
  try {
    // Connect to RabbitMQ
    const connection = await connect(RABBITMQ_URL);
    console.log(connection);

    // Create a channel
    const channel = await connection.createChannel();

    // Assert the queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Send the message to the queue
    const messageString = JSON.stringify(message);
    channel.sendToQueue(queueName, Buffer.from(messageString));

    // Close the channel and the connection
    await channel.close();
    await connection.close();

    console.log("Message sent successfully.");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
