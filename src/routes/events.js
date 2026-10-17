import express from 'express';
import db from './db.js'; // Adjust path depending on where db.js is

const router = express.Router();
router.use(express.json());
// GET single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await db.query('SELECT * FROM events WHERE id = $1', [id]);

    if (event.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event: event.rows[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST manual retry
router.post('/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `UPDATE events 
       SET status = 'PENDING', retry_count = 0 
       WHERE id = $1 
       RETURNING *;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({
      message: 'Event reset successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error retrying event:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;