import { Worker}  from "bullmq";
import { webhookQueue } from './lib/queue';
import pool from './config/db';
import crypto from 'crypto';
import axios from 'axios';
import { worker } from 'cluster';
import { Job } from 'bullmq';


const newWorker = new worker('webhook-deliver', 
    
    async(Job) => {
        const {event_id, endpoint_id} = Job.data 
    }
);

const SHUTDOWN = async () => {
    console.log('Closing worker gracefully...');
    newWorker.close(async () => {
        console.log('Worker closed.');
    });
    await db.end();
    console.log('PostgreSQL connection pool closed.');

    process.exit(0);
    
};


process.on('SIGINT', SHUTDOWN);
process.on('SIGTERM', SHUTDOWN);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





