// Curated list of Ionicons for habit categories
export const HabitIcons = [
  // Fitness & Health
  "fitness",
  "barbell",
  "bicycle",
  "walk",
  "heart",
  "medkit",
  // Wellness
  "water",
  "leaf",
  "moon",
  "sunny",
  "bed",
  "cafe",
  // Learning & Productivity
  "book",
  "pencil",
  "code",
  "bulb",
  "school",
  "newspaper",
  // Music & Art
  "musical-notes",
  "brush",
  "camera",
  "film",
  // Social & Communication
  "people",
  "chatbubble",
  "call",
  "mail",
  // Other
  "star",
  "flag",
  "time",
  "calendar",
] as const;

export type HabitIconName = (typeof HabitIcons)[number];
