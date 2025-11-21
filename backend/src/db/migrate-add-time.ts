import fs from 'fs';
import path from 'path';
import { query, testConnection, closePool } from './connection';

async function runMigrationFile(filename: string): Promise<boolean> {
  try {
    // In production (dist/), go up two levels to project root, then into src/db/migrations
    // In development (src/), go up one level to db, then into migrations
    let migrationPath = path.join(__dirname, 'migrations', filename);
    if (!fs.existsSync(migrationPath)) {
      // Fallback for production when running from dist/db/
      migrationPath = path.join(__dirname, '..', '..', 'src', 'db', 'migrations', filename);
    }
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log(`Running migration: ${filename}`);
    await query(migrationSQL);
    console.log(`✓ ${filename} completed successfully`);
    return true;
  } catch (error: any) {
    // Check if column/constraint already exists
    if (error.message?.includes('already exists')) {
      console.log(`⚠️  ${filename} - already applied, skipping.`);
      return true;
    }
    throw error;
  }
}

async function runTimeColumnMigration() {
  try {
    console.log('Starting time/endTime column migrations...\n');

    // Test connection
    await testConnection();

    // Run migrations in order - time column first (endTime constraint depends on it)
    await runMigrationFile('002_add_time_column.sql');
    await runMigrationFile('002_add_event_endtime.sql');

    console.log('\n✓ All migrations completed successfully!');
  } catch (error: any) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runTimeColumnMigration();
}

export default runTimeColumnMigration;
