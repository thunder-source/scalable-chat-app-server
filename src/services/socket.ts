import { Server } from 'socket.io';
import Redis from 'ioredis';
import prismaClient from './prisma';
// import { produceMessage } from './kafka';

const pub = new Redis({
  host: 'redis-2a0a9a-test-864e.a.aivencloud.com',
  port: 10580,
  username: 'default',
  password: 'AVNS_Rrj4coGUTy8X7LZ3DrC',
});

const sub = new Redis({
  host: 'redis-2a0a9a-test-864e.a.aivencloud.com',
  port: 10580,
  username: 'default',
  password: 'AVNS_Rrj4coGUTy8X7LZ3DrC',
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log('Init Socket Service...');
    this._io = new Server({
      cors: {
        allowedHeaders: ['*'],
        origin: '*',
      },
    });
    sub.subscribe('MESSAGES');
  }

  public initListeners() {
    // console.log('object');
    const io = this.io;
    console.log('Init Socket Listeners...');

    io.on('connect', (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on('event:message', async ({ message }: { message: string }) => {
        console.log('New Message Rec.', message);
        // publish this message to redis
        await pub.publish('MESSAGES', JSON.stringify({ message }));
      });
    });

    sub.on('message', async (channel, message) => {
      if (channel === 'MESSAGES') {
        console.log('new message from redis', message);
        io.emit('message', message);
        // await produceMessage(message);
        console.log('Message Produced to Kafka Broker');
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
