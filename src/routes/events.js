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
