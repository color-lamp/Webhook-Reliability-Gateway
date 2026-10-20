import 'dotenv/config';
import express from 'express';
import db1 from './config/dbfile.js'; // Ensure this points to your config/db.js file
import eventsRouter from './routes/events.js';
import routerWb from './routes/webhook.js'; // Ensure this points to your routes/webhook.js file
import { runMigrations } from '../migrations/migrate.js';
//import { initializeDatabase } from './init-db.js';

const app = express();
const port = 8080;
app.use(express.json());
app.use('/events', eventsRouter);
app.use('/webhook', routerWb);
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});


async function startApp() {
  try {
    // 1. Run database migration/table creation
    await runMigrations();

    // 2. Start Express server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Example app listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application due to startup errors:', error);
    process.exit(1);
  }
}
startApp();

async function startServer() {
  try {
    // 1. Automatically create tables and test endpoint on startup
    //await initializeDatabase();
    await runMigrations();
    // 2. Start the HTTP server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`🚀 Webhook Gateway running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startServer();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Gateway is healthy' });
});
  

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);  
  db1.query('SELECT NOW()')
    .then((res) => console.log('PostgreSQL Connected Successfully at:', res.rows[0].now))
    .catch((err) => console.error('PostgreSQL Connection Error:', err.message));
});


//import routerWb from './routes/webhook.js'; // Adjust path depending on where webhook.js is
 
  
//const router = express.Router();

//app.use('/dbfile', db1);
 
//app.use('/webhook', routerWb);

 


 

