import { Redis } from 'ioredis'
import config from '../utils/config.js';

let redisConnection: Redis | null = null;

export default function getRedisConnection() {   
    if(!redisConnection) {
        redisConnection = new Redis({
            host: config.redisHost,
            port: config.redisPort as number,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        })
        
        redisConnection?.on('connect', () => {
            console.log('Connected to Redis');
        })

        redisConnection?.on('error', (err) => {
            console.error('Redis connection error:', err);
        })
        
        redisConnection?.on('reconnecting', () => {
            console.log('Reconnecting to Redis...');
        })
    }
    return redisConnection;
}