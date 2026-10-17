import express from 'express';
import db from './routes/db.js'; // Adjust path depending on where db.js is
const app = express();
app.use(express.json());
const port = 8080;
const router = express.Router();
import eventsRouter from './routes/events.js';
app.use('/db', router);
app.use('/events', eventsRouter);

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});



app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Gateway is healthy' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);  
  db.query('SELECT NOW()')
  .then((res) => console.log('PostgreSQL Connected Successfully at:', res.rows[0].now))
  .catch((err) => console.error('PostgreSQL Connection Error:', err.message));
}

); 


