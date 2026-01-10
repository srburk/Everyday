# Everyday - Habit Tracker

A habit tracking app built with React Native and Expo, focused on iOS-native design patterns.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router (file-based routing)
- **Database:** expo-sqlite (local SQLite storage)
- **Animations:** react-native-reanimated, react-native-gesture-handler
- **Icons:** @expo/vector-icons (Ionicons)

## Architecture

### File Structure

```
src/
├── app/                    # Screens (file-based routing)
│   ├── _layout.tsx         # Root layout: SQLiteProvider, GestureHandler, Stack nav
│   ├── index.tsx           # Main habits list screen
│   └── habit/[id].tsx      # Habit detail with year heatmap
│
├── components/             # Reusable UI components
│   ├── habits/             # Habit-specific components
│   │   ├── HabitCard.tsx   # Single habit row (name, streak, toggle)
│   │   ├── HabitList.tsx   # FlatList of habits with empty state
│   │   ├── CreateHabitSheet.tsx  # Modal for creating habits
│   │   └── FrequencyPicker.tsx   # Frequency type selector
│   │
│   ├── heatmap/            # GitHub-style contribution graph
│   │   ├── YearHeatmap.tsx # Full year grid (53 weeks × 7 days)
│   │   └── HeatmapDay.tsx  # Individual day cell
│   │
│   └── ui/                 # Generic UI primitives
│       ├── ColorPicker.tsx # Habit color selector
│       └── DaySelector.tsx # Day-of-week multi-select
│
├── services/               # Data layer
│   ├── database.ts         # SQLite init, schema, migrations
│   └── habitService.ts     # CRUD operations, completion toggles
│
├── hooks/                  # React hooks
│   ├── useHabits.ts        # Habits with computed stats (streaks)
│   └── useHaptics.ts       # iOS haptic feedback wrapper
│
├── utils/                  # Pure helper functions
│   └── dates.ts            # Streak calculation, date formatting
│
├── models/                 # TypeScript type definitions
│   └── habit.ts            # Habit, HabitCompletion, HabitFrequency
│
└── constants/              # Design tokens
    └── colors.ts           # iOS system colors, heatmap palette
```

### Database Schema

```sql
-- Habits table
habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  frequency_type TEXT NOT NULL,  -- 'daily' | 'specific_days' | 'times_per_week'
  frequency_days TEXT,           -- JSON array: [0,1,2...] (0=Sun, 1=Mon...)
  frequency_times_per_week INTEGER,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT               -- Soft delete
)

-- Completions table
habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,    -- YYYY-MM-DD format
  UNIQUE(habit_id, completed_at)
)
```

### Data Flow

```
SQLite Database
      ↓
services/habitService.ts    (raw DB operations)
      ↓
hooks/useHabits.ts          (React state + computed stats)
      ↓
components/                 (UI rendering)
```

## Key Patterns

### Frequency Types

1. **Daily** - Every day is scheduled
2. **Specific Days** - Selected days of week (e.g., Mon/Wed/Fri)
3. **Times Per Week** - Target completions per week (e.g., 3x)

### Streak Calculation

- **Daily:** Consecutive days completed (gaps break streak)
- **Specific Days:** Consecutive scheduled days completed
- **Times Per Week:** Consecutive weeks meeting target

### iOS Design Conventions

- Large title navigation headers
- System colors from iOS HIG
- Haptic feedback on interactions (expo-haptics)
- SF Symbol-style icons (via Ionicons)
- Sheet-style modals for creation flow

## Common Tasks

### Add a New Screen

1. Create file in `src/app/` (e.g., `src/app/settings.tsx`)
2. Add `<Stack.Screen>` in `_layout.tsx` if custom options needed
3. Navigate with `router.push('/settings')`

### Add a Database Field

1. Update types in `src/models/habit.ts`
2. Add migration in `src/services/database.ts`
3. Update service methods in `src/services/habitService.ts`

### Add a New Component

1. Create in appropriate `src/components/` subdirectory
2. Follow existing patterns: Props interface, StyleSheet, hooks at top

## Running the App

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run typecheck  # TypeScript validation
npm run lint       # ESLint checks
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Stack nav over Tabs | Single-purpose app, iOS drill-down pattern |
| SQLite over AsyncStorage | Complex queries, relational data, better performance |
| No state management lib | expo-sqlite hooks + React state sufficient |
| File-based routing | Expo Router convention, simpler navigation |
| Soft delete (archived_at) | Preserve user data, enable restore feature |
