import type { SQLiteDatabase } from "expo-sqlite";

const CURRENT_SCHEMA_VERSION = 2;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'specific_days', 'times_per_week')),
      frequency_days TEXT,
      frequency_times_per_week INTEGER,
      color TEXT NOT NULL DEFAULT '#007AFF',
      created_at TEXT NOT NULL,
      archived_at TEXT
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_at)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );

    CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_completions_habit ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived_at);
  `);

  await runMigrations(db);

  // Clean up expired archived habits
  await cleanupExpiredArchivedHabits(db);

  console.log(`Connected to database at ${db.databasePath}`);
}

async function cleanupExpiredArchivedHabits(db: SQLiteDatabase): Promise<void> {
  // Get deletion policy from settings (default 30 days)
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'deletion_policy_days'"
  );
  const deletionPolicyDays = result ? parseInt(result.value, 10) : 30;

  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - deletionPolicyDays);
  const cutoffISO = cutoffDate.toISOString();

  // Delete expired archived habits
  const deleteResult = await db.runAsync(
    "DELETE FROM habits WHERE archived_at IS NOT NULL AND archived_at < ?",
    [cutoffISO]
  );

  if (deleteResult.changes > 0) {
    console.log(`Cleaned up ${deleteResult.changes} expired archived habit(s)`);
  }
}

async function getSchemaVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ version: number }>(
    "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1"
  );
  return result?.version ?? 0;
}

async function setSchemaVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO schema_version (version) VALUES (?)",
    [version]
  );
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getSchemaVersion(db);

  if (currentVersion < 1) {
    // Migration 1: Initial settings
    await db.runAsync(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      ["auto_sort_completed", "true"]
    );
    await db.runAsync(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      ["deletion_policy_days", "30"]
    );
    await setSchemaVersion(db, 1);
  }

  if (currentVersion < 2) {
    // Migration 2: Add icon and sort_order columns to habits
    const columns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(habits)"
    );
    const columnNames = columns.map((c) => c.name);

    if (!columnNames.includes("icon")) {
      await db.execAsync("ALTER TABLE habits ADD COLUMN icon TEXT DEFAULT NULL");
    }
    if (!columnNames.includes("sort_order")) {
      await db.execAsync("ALTER TABLE habits ADD COLUMN sort_order INTEGER DEFAULT 0");
    }
    await setSchemaVersion(db, 2);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
