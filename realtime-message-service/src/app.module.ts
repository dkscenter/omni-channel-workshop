import { Module, OnModuleInit } from '@nestjs/common';
import { MessageGateway } from './message/message.gateway';
import { Kafka } from 'kafkajs';

@Module({
  providers: [MessageGateway],
})
export class AppModule implements OnModuleInit {
  private kafkaConsumer;

  constructor(private messageGateway: MessageGateway) {
    const kafka = new Kafka({
      clientId: 'realtime-service',
      brokers: ['localhost:9093'],
    });
    this.kafkaConsumer = kafka.consumer({ groupId: 'realtime-group' });
  }

  async onModuleInit() {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({ topic: 'receive_message' });

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msg = JSON.parse(message.value.toString());
        console.log('Received message from Kafka:', msg);

        // Emit message to WebSocket clients via the MessageGateway
        this.messageGateway.server.emit('receivedMessage', msg);
      },
    });
  }

  async onModuleDestroy() {
    await this.kafkaConsumer.disconnect();
  }
}
