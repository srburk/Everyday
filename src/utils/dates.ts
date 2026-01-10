import {
  format,
  parseISO,
  startOfDay,
  subDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  getDay,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { HabitFrequency } from "../models/habit";

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isScheduledDay(date: Date, frequency: HabitFrequency): boolean {
  if (frequency.type === "daily") {
    return true;
  }

  if (frequency.type === "specific_days" && frequency.days) {
    const dayOfWeek = getDay(date); // 0 = Sunday
    return frequency.days.includes(dayOfWeek);
  }

  // For times_per_week, every day is potentially valid
  if (frequency.type === "times_per_week") {
    return true;
  }

  return false;
}

export function calculateStreak(
  completions: string[],
  frequency: HabitFrequency
): number {
  if (completions.length === 0) return 0;

  const sortedDates = [...completions]
    .map((d) => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfDay(new Date());
  let streak = 0;
  let checkDate = today;

  if (frequency.type === "daily") {
    // For daily habits, count consecutive days
    for (const completionDate of sortedDates) {
      const completion = startOfDay(completionDate);
      const diff = differenceInDays(checkDate, completion);

      if (diff === 0) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else if (diff === 1) {
        streak++;
        checkDate = completion;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  } else if (frequency.type === "specific_days" && frequency.days) {
    // For specific days, only count scheduled days
    const scheduledDays = new Set(frequency.days);
    let currentCheck = today;

    while (true) {
      const dayOfWeek = getDay(currentCheck);

      if (scheduledDays.has(dayOfWeek)) {
        const dateStr = formatDateString(currentCheck);
        if (completions.includes(dateStr)) {
          streak++;
          currentCheck = subDays(currentCheck, 1);
        } else if (differenceInDays(today, currentCheck) === 0) {
          // Today is scheduled but not completed yet - don't break streak
          currentCheck = subDays(currentCheck, 1);
        } else {
          break;
        }
      } else {
        currentCheck = subDays(currentCheck, 1);
      }

      // Safety limit
      if (differenceInDays(today, currentCheck) > 365) break;
    }
  } else if (frequency.type === "times_per_week" && frequency.timesPerWeek) {
    // For times per week, count consecutive weeks where goal was met
    let currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });

    while (true) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
      const completionsThisWeek = completions.filter((d) => {
        const date = parseISO(d);
        return isWithinInterval(date, { start: currentWeekStart, end: weekEnd });
      }).length;

      if (completionsThisWeek >= frequency.timesPerWeek) {
        streak++;
        currentWeekStart = subDays(currentWeekStart, 7);
      } else if (differenceInDays(today, currentWeekStart) < 7) {
        // Current week in progress
        currentWeekStart = subDays(currentWeekStart, 7);
      } else {
        break;
      }

      // Safety limit
      if (differenceInDays(today, currentWeekStart) > 365) break;
    }
  }

  return streak;
}

export function getCompletionsThisWeek(completions: string[]): number {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  return completions.filter((d) => {
    const date = parseISO(d);
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  }).length;
}

export function getYearDates(year: number): Date[] {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  return eachDayOfInterval({ start, end });
}

export function getWeeksInYear(year: number): Date[][] {
  const dates = getYearDates(year);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Pad first week with nulls if needed
  const firstDayOfWeek = getDay(dates[0]);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null as unknown as Date);
  }

  for (const date of dates) {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Push remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}
