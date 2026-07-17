export type SettingValue =
  string | number | boolean | null | SettingValue[] | { [key: string]: SettingValue };
