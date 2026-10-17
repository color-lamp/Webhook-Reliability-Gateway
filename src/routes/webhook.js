import express from 'express';
import db1 from '../config/dbfile.js';
import webhookQueue from '../lib/queue.js'; // Your BullMQ queue

const routerWb = express.Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

routerWb.post('/ingest/:endpoint_id', async (req, res) => {
  try {
    const { endpoint_id } = req.params;
    const payload = req.body;
    const headers = req.headers;

    if (!UUID_REGEX.test(endpoint_id)) {
      return res.status(400).json({ error: 'Invalid endpoint_id format.' });
    }

    // 1. Check if endpoint exists and get target_url
    const epResult = await db1.query(
      'SELECT target_url FROM endpoints WHERE id = $1', 
      [endpoint_id]
    );
    
    if (epResult.rows.length === 0) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    const targetUrl = epResult.rows[0].target_url;

    // 2. Insert into PostgreSQL
    const insertRes = await db1.query(
      `INSERT INTO events (endpoint_id, payload, headers, status) 
       VALUES ($1, $2, $3, 'PENDING') 
       RETURNING id, status, created_at;`,
      [endpoint_id, JSON.stringify(payload), JSON.stringify(headers)]
    );
    
    const newEvent = insertRes.rows[0];

    // 3. Add job to BullMQ queue
    await webhookQueue.add('deliver-webhook', {
      event_id: newEvent.id,
      endpoint_id,
      targetUrl,
      payload
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 }
    });

    return res.status(202).json({
      message: 'Webhook received and queued',
      event_id: newEvent.id,
      status: newEvent.status,
      created_at: newEvent.created_at
    });

  } catch (error) {
    console.error('Ingestion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default routerWb;