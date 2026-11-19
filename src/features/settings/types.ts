export type ReviewMode = 'auto_approve' | 'manual';

export interface GlobalSettings {
  max_search_radius_km: number;
  allowed_radius_options_km: number[];
  fuzz_distance_m: number;
  max_reports_per_user_per_hour: number;
  max_description_length: number;
  review_mode: ReviewMode;
  abuse_flag_hide_threshold: number;
  alert_digest_threshold: number;
  alert_digest_window_minutes: number;
  min_account_age_minutes_to_report: number;
  updated_at: string;
  updated_by: string;
}

export type GlobalSettingsUpdateInput = Partial<
  Omit<GlobalSettings, 'updated_at' | 'updated_by'>
>;

export interface SettingItemDefinition {
  key: keyof Omit<GlobalSettings, 'updated_at' | 'updated_by'>;
  label: string;
  description: string;
  group: 'intake' | 'geo' | 'limits' | 'notifications';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}
