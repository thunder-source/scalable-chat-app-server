"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
// import { produceMessage } from './kafka';
const pub = new ioredis_1.default({
    host: '127.0.0.1',
    port: 6379,
    username: '',
    password: '',
});
const sub = new ioredis_1.default({
    host: '127.0.0.1',
    port: 6379,
    username: '',
    password: '',
});
class SocketService {
    constructor() {
        console.log('Init Socket Service...');
        this._io = new socket_io_1.Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*',
            },
        });
        sub.subscribe('MESSAGES');
    }
    initListeners() {
        // console.log('object');
        const io = this.io;
        console.log('Init Socket Listeners...');
        io.on('connect', (socket) => {
            console.log(`New Socket Connected`, socket.id);
            socket.on('event:message', ({ message }) => __awaiter(this, void 0, void 0, function* () {
                console.log('New Message Rec.', message);
                // publish this message to redis
                yield pub.publish('MESSAGES', JSON.stringify({ message }));
            }));
        });
        sub.on('message', (channel, message) => __awaiter(this, void 0, void 0, function* () {
            if (channel === 'MESSAGES') {
                console.log('new message from redis', message);
                io.emit('message', message);
                // await produceMessage(message);
                console.log('Message Produced to Kafka Broker');
            }
        }));
    }
    get io() {
        return this._io;
    }
}
exports.default = SocketService;
