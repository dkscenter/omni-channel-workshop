import { Module, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import Axios from 'axios';

@Module({})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'omni-channel-service',
      brokers: ['localhost:9093'],
    });
    const consumer = kafka.consumer({ groupId: 'message-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'send_message' });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { userId, message: msgContent } = JSON.parse(
          message.value.toString(),
        );
        await this.sendToLine(userId, msgContent);
      },
    });
  }

  private async sendToLine(userId: string, message: string) {
    console.log('Send message to:', userId);
    console.log('Meesage:', message);
    // Replace with your actual LINE Messaging API endpoint
    // const response = await Axios.post(
    //   'https://api.line.me/v2/bot/message/push',
    //   {
    //     to: userId,
    //     messages: [{ type: 'text', text: message }],
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer YOUR_LINE_CHANNEL_ACCESS_TOKEN`,
    //     },
    //   },
    // );
    // console.log(`Message sent to LINE: ${response.data}`);
  }
}
