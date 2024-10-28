import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Kafka } from 'kafkajs';
import * as Redis from 'redis';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  private kafkaProducer;
  private redisClient;

  constructor() {
    // Initialize Kafka
    const kafka = new Kafka({
      clientId: 'realtime-service',
      brokers: ['localhost:9093'],
    });
    this.kafkaProducer = kafka.producer();

    // Initialize Redis
    this.redisClient = Redis.createClient({});
    this.redisClient.on('connect', () => console.log('Connected to Redis'));
  }

  async onModuleInit() {
    await this.kafkaProducer.connect();
  }

  async onModuleDestroy() {
    await this.kafkaProducer.disconnect();
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { userId: string; message: string },
  ) {
    const { userId, message } = data;

    const messageObject = {
      userId: userId,
      message: message,
      messageId: uuidv4(),
    };

    console.log(data);

    if (!this.redisClient.isOpen) {
      console.log('Redis client is closed, attempting to reconnect...');
      await this.redisClient.connect(); // Try to reconnect
    }

    // Save message status to Redis
    await this.redisClient.set(
      `message:${userId}`,
      JSON.stringify(messageObject),
    );

    // Produce message to Kafka
    await this.kafkaProducer.send({
      topic: 'send_message',
      messages: [{ value: JSON.stringify(messageObject) }],
    });

    // Emit status back to the frontend
    this.server.emit('messageStatus', { status: 'Message received' });
  }
}
