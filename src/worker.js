import { Worker } from 'bullmq';
import db from './db.js';
import axios from 'axios';

// Connect worker to Redis queue
const webhookWorker = new Worker('webhook-deliver', async (job) => {
  const { event_id, targetUrl, payload } = job.data;
  
  console.log(`Processing job ${job.id} for event ${event_id}...`);

  try {
    // Attempt to deliver webhook to the target URL
    const response = await axios.post(targetUrl, payload, { timeout: 10000 });
    
    console.log(`Successfully delivered event ${event_id}`);
    
    // Optional: Update DB status to 'SUCCESS' here
    await db.query("UPDATE events SET status = 'SUCCESS' WHERE id = $1", [event_id]);

  } catch (error) {
    console.error(`Failed to deliver event ${event_id}:`, error.message);
    
    // CRITICAL: You must THROW the error so BullMQ knows to retry the job!
    throw error;
  }
}, { 
  connection: { host: 'localhost', port: 6379 } 
});

// Graceful shutdown for the background worker
const SHUTDOWN = async () => {
  console.log('Closing worker gracefully...');
  await webhookWorker.close();
  await db.end();
  console.log('Worker and DB pool closed.');
  process.exit(0);
};

process.on('SIGINT', SHUTDOWN);
process.on('SIGTERM', SHUTDOWN);