import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { AppSettings } from "../models/settings";
import { defaultSettings } from "../models/settings";
import { getSettings, updateSettings } from "../services/settingsService";

export function useSettings() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await getSettings(db);
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      try {
        await updateSettings(db, { [key]: value });
      } catch (error) {
        console.error("Failed to update setting:", error);
        // Revert on failure
        setSettings(settings);
      }
    },
    [db, settings]
  );

  return {
    settings,
    loading,
    updateSetting,
    refresh: loadSettings,
  };
}
