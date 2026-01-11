import type { SQLiteDatabase } from "expo-sqlite";
import type { AppSettings } from "../models/settings";
import { defaultSettings } from "../models/settings";

export async function getSetting(
  db: SQLiteDatabase,
  key: string
): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  );
  return result?.value ?? null;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function getSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const autoSortValue = await getSetting(db, "auto_sort_completed");
  const deletionDaysValue = await getSetting(db, "deletion_policy_days");

  return {
    autoSortCompleted: autoSortValue === "true",
    deletionPolicyDays: deletionDaysValue
      ? parseInt(deletionDaysValue, 10)
      : defaultSettings.deletionPolicyDays,
  };
}

export async function updateSettings(
  db: SQLiteDatabase,
  updates: Partial<AppSettings>
): Promise<void> {
  if (updates.autoSortCompleted !== undefined) {
    await setSetting(db, "auto_sort_completed", String(updates.autoSortCompleted));
  }
  if (updates.deletionPolicyDays !== undefined) {
    await setSetting(db, "deletion_policy_days", String(updates.deletionPolicyDays));
  }
}
