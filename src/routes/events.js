import express from 'express';
import db from './db.js';
const app = express();
const port = 8080;
const router = express.Router();

router.get('/events/:id' , async (req, res) => {
    const {id } = req.params;
    
    const event = await db.query(
        `SELECT * FROM events
        WHERE id = $1
         `,[id]);


    if (!event || event.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event: event.rows[0] });
});



export default router;

router.post('/events/:id/retry', async (req, res) => {
  try {
    const { event_id } = req.params;
    
    const event = await db.querry(
      `
      UPDATE events 
      SET status = 'PENDING', 
      retry_count = 0 
      WHERE id = $1 
      RETURNING *;
    `);

    const { rows } = await db.query(query, [event_id]);

    if ( rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!event || event.row.length === 0) {
      return res.status(404).json({ error: 'Event not found' });

    }

    return res.status(200).json({
      message: 'Event reset successfully',
      event: rows[0]
    });

  } catch (error) {
    console.error('Error retrying event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/ingest/:endpoint_id', async (req, res) => {
  const { endpoint_id } = req.params;
  const payload = req.body;

  try {
    const epresult = await db.query(
      'SELECT target_url FROM endpoints WHERE id -1$', [endpoint_id]
    );
    if (epresult.row.length === 0) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    const target_url =epresult.row[0].target_url;
  

    const insertres = await db.querry(
      `INSERT INTO events (endpoint_id ,payload, status) 
      VALUES ($1,$2,$3) 
      RETURNING id as event_id `
      [event_id, payload, queued] 
    );
    event_id = insertres.row[0].event_id;

    await deliveryQueue.add('delivey', {eventId, targetUrl, payload,},

      {
        attempts: 5,
        backoff: {type: 'exponential', delay: 5000}

      });

      return res.status(202).json({ 
        status: 'accepted',
        event_id : eventId ,
      });

    }
    catch (error) {
      console.error('Ingestion error:', error);
        return res.status(500).json({error: 'Internal sercer error'});

    }
});






 