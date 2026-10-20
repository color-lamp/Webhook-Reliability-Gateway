// src/init-db.js
import db1 from './config/dbfile.js';

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking and initializing database tables...');

    // 1. Create the endpoints table
    await db1.query(`
      CREATE TABLE IF NOT EXISTS endpoints (
        id UUID PRIMARY KEY,
        target_url TEXT NOT NULL,
        secret TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create the events table
    await db1.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        endpoint_id UUID REFERENCES endpoints(id),
        payload JSONB NOT NULL,
        headers JSONB,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Insert a default test endpoint so your tests pass immediately
    await db1.query(`
      INSERT INTO endpoints (id, target_url, secret) 
      VALUES ('123e4567-e89b-12d3-a456-426614174000', 'https://httpbin.org/post', 'my_secret') 
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Database tables and test endpoint are ready!');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    process.exit(1);
  }
}