export interface AppSettings {
  autoSortCompleted: boolean;
  deletionPolicyDays: number;
}

export const defaultSettings: AppSettings = {
  autoSortCompleted: true,
  deletionPolicyDays: 30,
};
