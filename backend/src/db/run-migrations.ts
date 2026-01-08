import fs from 'fs';
import path from 'path';
import { query, testConnection, closePool } from './connection';

interface MigrationRecord {
  name: string;
  applied_at: Date;
}

interface TableExistsResult {
  exists: boolean;
}

async function tableExists(tableName: string): Promise<boolean> {
  const result = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    ) as exists
  `, [tableName]);
  return (result.rows[0] as TableExistsResult)?.exists || false;
}

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await query('SELECT name FROM schema_migrations ORDER BY name');
  return new Set((result.rows as MigrationRecord[]).map(r => r.name));
}

async function recordMigration(name: string): Promise<void> {
  await query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
}

// Detect migrations that were applied before we had migration tracking
async function detectLegacyMigrations(): Promise<string[]> {
  const legacyMigrations: string[] = [];

  // Check for 001_initial_schema.sql - if users table exists
  if (await tableExists('users')) {
    legacyMigrations.push('001_initial_schema.sql');
  }

  // Check for 002_add_time_column.sql - if events.time column exists
  const timeColumnResult = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'events' AND column_name = 'time'
    ) as exists
  `);
  if (timeColumnResult.rows[0]?.exists) {
    legacyMigrations.push('002_add_time_column.sql');
  }

  // Check for 002_add_event_endtime.sql - if events.endtime column exists
  const endTimeColumnResult = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'events' AND column_name = 'endtime'
    ) as exists
  `);
  if (endTimeColumnResult.rows[0]?.exists) {
    legacyMigrations.push('002_add_event_endtime.sql');
  }

  // Check for 003_multi_timeline.sql - if timelines table exists
  if (await tableExists('timelines')) {
    legacyMigrations.push('003_multi_timeline.sql');
  }

  // Check for 004_invitations.sql - if timeline_invitations table exists
  if (await tableExists('timeline_invitations')) {
    legacyMigrations.push('004_invitations.sql');
  }

  return legacyMigrations;
}

async function runMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...\n');

    // Test connection
    await testConnection();

    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get list of applied migrations
    let appliedMigrations = await getAppliedMigrations();

    // If no migrations recorded but database has tables, detect legacy migrations
    if (appliedMigrations.size === 0) {
      console.log('No migrations recorded. Checking for legacy migrations...');
      const legacyMigrations = await detectLegacyMigrations();

      if (legacyMigrations.length > 0) {
        console.log(`Detected ${legacyMigrations.length} previously applied migrations:`);
        for (const migration of legacyMigrations) {
          console.log(`  📝 Recording: ${migration}`);
          await recordMigration(migration);
        }
        console.log('');
        // Refresh the set
        appliedMigrations = await getAppliedMigrations();
      }
    }

    console.log(`Found ${appliedMigrations.size} previously applied migrations\n`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001_, 002_, etc.)

    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        skippedCount++;
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

      try {
        await query(migrationSQL);
        await recordMigration(file);
        console.log(`✅ Applied ${file}\n`);
        appliedCount++;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to apply ${file}:`, errorMessage);
        throw error;
      }
    }

    console.log('\n=================================');
    console.log(`Migration summary:`);
    console.log(`  Applied: ${appliedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Total:   ${migrationFiles.length}`);
    console.log('=================================\n');

    if (appliedCount > 0) {
      console.log('✅ All new migrations applied successfully!');
    } else {
      console.log('✅ Database is up to date!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
