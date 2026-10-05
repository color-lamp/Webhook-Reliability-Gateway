import express from 'express';
import db from './db.js';
const app = express();
const port = 8080;
const router = express.Router();
import eventsRouter from './routes/events.js';

app.use('/events', eventsRouter);

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Gateway is healthy' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
}); 
