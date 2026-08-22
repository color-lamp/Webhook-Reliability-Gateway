import { Worker} } from "bullmq";
import { webhookQueue } from './lib/queue';
import pool from './config/db';
import crypto from 'crypto';
import axios from 'axios';
import { worker } from 'cluster';
import { Job } from 'bullmq';


const newWorker = new worker('webhook-deliver', 
    
    async(Job) => {
        const {event_id, endpoint_id} = Job.data :
    }
)