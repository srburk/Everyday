import type { SQLiteDatabase } from "expo-sqlite";
import { generateId } from "./database";
import type {
  Habit,
  HabitFrequency,
  HabitCompletion,
  HabitWithStats,
  CreateHabitInput,
} from "../models/habit";
import {
  getTodayString,
  calculateStreak,
  getCompletionsThisWeek,
} from "../utils/dates";

function rowToHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    name: row.name as string,
    frequency: {
      type: row.frequency_type as HabitFrequency["type"],
      days: row.frequency_days ? JSON.parse(row.frequency_days as string) : undefined,
      timesPerWeek: row.frequency_times_per_week as number | undefined,
    },
    color: row.color as string,
    createdAt: row.created_at as string,
    archivedAt: row.archived_at as string | null,
  };
}

export async function getHabits(db: SQLiteDatabase): Promise<Habit[]> {
  const rows = await db.getAllAsync(
    "SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at DESC"
  );
  return (rows as Record<string, unknown>[]).map(rowToHabit);
}

export async function getHabitById(
  db: SQLiteDatabase,
  id: string
): Promise<Habit | null> {
  const row = await db.getFirstAsync(
    "SELECT * FROM habits WHERE id = ?",
    [id]
  );
  return row ? rowToHabit(row as Record<string, unknown>) : null;
}

export async function createHabit(
  db: SQLiteDatabase,
  input: CreateHabitInput
): Promise<Habit> {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const color = input.color || "#007AFF";

  await db.runAsync(
    `INSERT INTO habits (id, name, frequency_type, frequency_days, frequency_times_per_week, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.frequency.type,
      input.frequency.days ? JSON.stringify(input.frequency.days) : null,
      input.frequency.timesPerWeek || null,
      color,
      createdAt,
    ]
  );

  return {
    id,
    name: input.name,
    frequency: input.frequency,
    color,
    createdAt,
    archivedAt: null,
  };
}

export async function updateHabit(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<CreateHabitInput>
): Promise<void> {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    sets.push("name = ?");
    values.push(updates.name);
  }

  if (updates.frequency !== undefined) {
    sets.push("frequency_type = ?");
    values.push(updates.frequency.type);
    sets.push("frequency_days = ?");
    values.push(updates.frequency.days ? JSON.stringify(updates.frequency.days) : null);
    sets.push("frequency_times_per_week = ?");
    values.push(updates.frequency.timesPerWeek || null);
  }

  if (updates.color !== undefined) {
    sets.push("color = ?");
    values.push(updates.color);
  }

  if (sets.length > 0) {
    values.push(id);
    await db.runAsync(
      `UPDATE habits SET ${sets.join(", ")} WHERE id = ?`,
      values
    );
  }
}

export async function archiveHabit(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync(
    "UPDATE habits SET archived_at = ? WHERE id = ?",
    [new Date().toISOString(), id]
  );
}

export async function deleteHabit(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync("DELETE FROM habits WHERE id = ?", [id]);
}

// Completions

export async function getCompletions(
  db: SQLiteDatabase,
  habitId: string,
  startDate?: string,
  endDate?: string
): Promise<HabitCompletion[]> {
  let query = "SELECT * FROM habit_completions WHERE habit_id = ?";
  const params: string[] = [habitId];

  if (startDate) {
    query += " AND completed_at >= ?";
    params.push(startDate);
  }

  if (endDate) {
    query += " AND completed_at <= ?";
    params.push(endDate);
  }

  query += " ORDER BY completed_at DESC";

  const rows = await db.getAllAsync(query, params);
  return rows.map((row) => ({
    id: (row as Record<string, unknown>).id as string,
    habitId: (row as Record<string, unknown>).habit_id as string,
    completedAt: (row as Record<string, unknown>).completed_at as string,
  }));
}

export async function toggleCompletion(
  db: SQLiteDatabase,
  habitId: string,
  date?: string
): Promise<boolean> {
  const targetDate = date || getTodayString();

  const existing = await db.getFirstAsync(
    "SELECT id FROM habit_completions WHERE habit_id = ? AND completed_at = ?",
    [habitId, targetDate]
  );

  if (existing) {
    await db.runAsync(
      "DELETE FROM habit_completions WHERE habit_id = ? AND completed_at = ?",
      [habitId, targetDate]
    );
    return false; // No longer completed
  } else {
    const id = generateId();
    await db.runAsync(
      "INSERT INTO habit_completions (id, habit_id, completed_at) VALUES (?, ?, ?)",
      [id, habitId, targetDate]
    );
    return true; // Now completed
  }
}

export async function isCompletedToday(
  db: SQLiteDatabase,
  habitId: string
): Promise<boolean> {
  const today = getTodayString();
  const result = await db.getFirstAsync(
    "SELECT id FROM habit_completions WHERE habit_id = ? AND completed_at = ?",
    [habitId, today]
  );
  return !!result;
}

// Stats

export async function getHabitsWithStats(
  db: SQLiteDatabase
): Promise<HabitWithStats[]> {
  const habits = await getHabits(db);
  const today = getTodayString();

  const habitsWithStats: HabitWithStats[] = await Promise.all(
    habits.map(async (habit) => {
      const completions = await getCompletions(db, habit.id);
      const completionDates = completions.map((c) => c.completedAt);

      return {
        ...habit,
        currentStreak: calculateStreak(completionDates, habit.frequency),
        longestStreak: 0, // TODO: Calculate longest streak
        completedToday: completionDates.includes(today),
        completionsThisWeek: getCompletionsThisWeek(completionDates),
      };
    })
  );

  return habitsWithStats;
}
