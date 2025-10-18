import fs from 'fs';
import path from 'path';
import { query, testConnection, closePool } from './connection';

async function runMigration() {
  try {
    console.log('Starting database migration...\n');

    // Test connection
    await testConnection();

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 001_initial_schema.sql');

    // Execute migration
    await query(migrationSQL);

    console.log('✓ Migration completed successfully\n');

    // Read seed file
    const seedPath = path.join(__dirname, 'seeds', '001_initial_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    console.log('Running seed: 001_initial_data.sql');

    // Execute seed
    await query(seedSQL);

    console.log('✓ Seed data inserted successfully\n');
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

export default runMigration;
