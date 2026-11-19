import { z } from 'zod';
import type { GlobalSettings, SettingItemDefinition } from './types';

export const DEFAULT_SETTINGS: Omit<GlobalSettings, 'updated_at' | 'updated_by'> = {
  max_search_radius_km: 50,
  allowed_radius_options_km: [1, 5, 10, 25, 50],
  fuzz_distance_m: 250,
  max_reports_per_user_per_hour: 5,
  max_description_length: 500,
  review_mode: 'manual',
  abuse_flag_hide_threshold: 5,
  alert_digest_threshold: 3,
  alert_digest_window_minutes: 30,
  min_account_age_minutes_to_report: 15,
};

export const settingsSchema = z.object({
  max_search_radius_km: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  allowed_radius_options_km: z
    .array(z.number().positive('Radius must be positive'))
    .min(1, 'At least one radius option must be configured'),
  fuzz_distance_m: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  max_reports_per_user_per_hour: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  max_description_length: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  review_mode: z.enum(['auto_approve', 'manual']),
  abuse_flag_hide_threshold: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  alert_digest_threshold: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  alert_digest_window_minutes: z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number'),
  min_account_age_minutes_to_report: z
    .number()
    .int('Must be an integer')
    .min(0, 'Account age must be 0 or greater'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const SETTING_DEFINITIONS: SettingItemDefinition[] = [
  // Intake & Moderation
  {
    key: 'review_mode',
    label: 'Incident Review Mode',
    description:
      'Intake moderation workflow. Manual mode requires moderator review before reports appear on the public map. Auto-approve publishes verified reports immediately.',
    group: 'intake',
  },
  {
    key: 'abuse_flag_hide_threshold',
    label: 'Abuse Flag Auto-Hide Threshold',
    description:
      'Number of distinct citizen abuse or spam flags that automatically hide a published incident pending moderator review.',
    group: 'intake',
    unit: 'flags',
    min: 1,
    max: 20,
    step: 1,
  },
  {
    key: 'min_account_age_minutes_to_report',
    label: 'Minimum Account Age to Report',
    description:
      'Required elapsed time after citizen registration before incident reporting is enabled, mitigating automated bot swarms.',
    group: 'intake',
    unit: 'minutes',
    min: 0,
    max: 1440,
    step: 5,
  },

  // Geographic & Privacy
  {
    key: 'fuzz_distance_m',
    label: 'Location Fuzzing Distance',
    description:
      'Randomized spatial jitter applied to public incident coordinates to protect reporter privacy and prevent exact location pinpointing.',
    group: 'geo',
    unit: 'meters',
    min: 50,
    max: 1000,
    step: 25,
  },
  {
    key: 'max_search_radius_km',
    label: 'Maximum Search Radius',
    description:
      'Maximum geographic query distance supported by the mobile API for nearby incident discovery and map browsing.',
    group: 'geo',
    unit: 'km',
    min: 5,
    max: 200,
    step: 5,
  },
  {
    key: 'allowed_radius_options_km',
    label: 'Allowed Radius Filter Presets',
    description:
      'Pre-configured search radius options presented to citizens in the mobile application distance filters.',
    group: 'geo',
    unit: 'km',
  },

  // Limits & Content
  {
    key: 'max_reports_per_user_per_hour',
    label: 'Hourly Report Submission Rate Limit',
    description:
      'Maximum number of incidents an individual user account can submit within any rolling 60-minute window.',
    group: 'limits',
    unit: 'reports/hr',
    min: 1,
    max: 30,
    step: 1,
  },
  {
    key: 'max_description_length',
    label: 'Maximum Description Length',
    description:
      'Upper character limit enforced for incident descriptive details in the mobile capture interface.',
    group: 'limits',
    unit: 'characters',
    min: 100,
    max: 2000,
    step: 50,
  },

  // Alerts & Notifications
  {
    key: 'alert_digest_threshold',
    label: 'Alert Digest Grouping Threshold',
    description:
      'Number of simultaneous incidents in a zone required to bundle notifications into an alert digest rather than individual alerts.',
    group: 'notifications',
    unit: 'incidents',
    min: 2,
    max: 10,
    step: 1,
  },
  {
    key: 'alert_digest_window_minutes',
    label: 'Alert Digest Time Window',
    description:
      'Rolling time window used to group and throttle localized emergency notification digests.',
    group: 'notifications',
    unit: 'minutes',
    min: 5,
    max: 120,
    step: 5,
  },
];
