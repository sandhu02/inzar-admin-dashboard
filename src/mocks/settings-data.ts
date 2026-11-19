import type {
  GlobalSettings,
  GlobalSettingsUpdateInput,
} from '@/features/settings/types';
import { DEFAULT_SETTINGS } from '@/features/settings/schemas';

export const INITIAL_MOCK_SETTINGS: GlobalSettings = {
  ...DEFAULT_SETTINGS,
  updated_at: '2026-11-15T10:00:00Z',
  updated_by: 'Sana Rehman (Admin)',
};

let mockSettingsStore: GlobalSettings = JSON.parse(
  JSON.stringify(INITIAL_MOCK_SETTINGS)
);

export function getMockSettings(): GlobalSettings {
  return JSON.parse(JSON.stringify(mockSettingsStore));
}

export function updateMockSettings(
  input: GlobalSettingsUpdateInput,
  actor = 'Sana Rehman (Admin)'
): GlobalSettings {
  mockSettingsStore = {
    ...mockSettingsStore,
    ...input,
    updated_at: new Date().toISOString(),
    updated_by: actor,
  };
  return getMockSettings();
}

export function resetMockSettingsToDefaults(
  actor = 'Sana Rehman (Admin)'
): GlobalSettings {
  mockSettingsStore = {
    ...DEFAULT_SETTINGS,
    updated_at: new Date().toISOString(),
    updated_by: actor,
  };
  return getMockSettings();
}

export function resetMockSettings(): void {
  mockSettingsStore = JSON.parse(JSON.stringify(INITIAL_MOCK_SETTINGS));
}
