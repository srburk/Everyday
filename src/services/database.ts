import type { SQLiteDatabase } from "expo-sqlite";

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

    CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_completions_habit ON habit_completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived_at);
  `);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
