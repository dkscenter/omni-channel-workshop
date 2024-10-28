import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Controller('webhook')
export class WebhookController {
  private kafkaProducer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'omni-channel-service',
      brokers: ['localhost:9093'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect();
  }

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() payload: { userId: string; message: string }) {
    // Send the incoming message to the `receive_message` topic in Kafka
    await this.kafkaProducer.send({
      topic: 'receive_message',
      messages: [{ value: JSON.stringify(payload) }],
    });
    console.log('Message received from webhook and sent to Kafka:', payload);
  }
}
