// src/migrate.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db1 from '../src/config/dbfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  const client = await db1.connect();
  try {
    console.log('🔄 Checking database migrations...');

    // 1. Create a tracking table to log applied migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Point to a dedicated /migrations folder
    const migrationsDir = path.join(__dirname, '../migrations');

    // Automatically create the folder if it doesn't exist yet
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('📁 Created missing /migrations directory.');
    }

    // 3. Read and sort all .sql migration files sequentially (001_, 002_, etc.)
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('ℹ️ No migration files found in /migrations folder.');
      return;
    }

    // 4. Fetch already applied migrations from PostgreSQL
    const { rows: appliedRows } = await client.query('SELECT version FROM schema_migrations;');
    const appliedVersions = new Set(appliedRows.map(row => row.version));

    // 5. Execute pending migrations
    for (const file of files) {
      if (!appliedVersions.has(file)) {
        console.log(`🚀 Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sqlQuery = fs.readFileSync(filePath, 'utf8');

        // Run each migration inside an atomic transaction
        await client.query('BEGIN');
        try {
          await client.query(sqlQuery);
          await client.query(
            'INSERT INTO schema_migrations (version) VALUES ($1);',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✅ Successfully applied: ${file}`);
        } catch (migrationError) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed on file ${file}:`, migrationError);
          throw migrationError;
        }
      }
    }

    console.log('🎉 All migrations are up to date!');
  } catch (error) {
    console.error('❌ Migration runner error:', error);
    process.exit(1);
  } finally {
    client.release(); // Always release the client back to the pool
  }
}

 