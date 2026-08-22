import { Queue } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    maxRetriesPerRequest: null,
    
};

const  webhookQueue = new Queue('webhook-delivery',{
    connection,defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay:1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
    });




module.exports = {connection, webhookQueue};