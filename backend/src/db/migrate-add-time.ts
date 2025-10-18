import fs from 'fs';
import path from 'path';
import { query, testConnection, closePool } from './connection';

async function runTimeColumnMigration() {
  try {
    console.log('Starting time column migration...\n');

    // Test connection
    await testConnection();

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_add_time_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 002_add_time_column.sql');

    // Execute migration
    await query(migrationSQL);

    console.log('✓ Migration completed successfully\n');
    console.log('Time column added to events table!');
  } catch (error: any) {
    // Check if column already exists
    if (error.message?.includes('already exists')) {
      console.log('⚠️  Time column already exists, skipping migration.');
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runTimeColumnMigration();
}

export default runTimeColumnMigration;
