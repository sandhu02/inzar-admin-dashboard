'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  settingsSchema,
  DEFAULT_SETTINGS,
  type SettingsFormData,
} from '../schemas';
import { useUpdateSettings } from '../hooks/use-settings';
import { ReviewModeConfirmDialog } from './review-mode-dialog';
import { SettingsDirtyBar } from './settings-dirty-bar';
import { SettingsUnsavedGuard } from './settings-unsaved-guard';
import {
  RotateCcw,
  Plus,
  X,
  ShieldAlert,
  MapPin,
  FileText,
  Bell,
} from 'lucide-react';
import type { GlobalSettings, ReviewMode } from '../types';

interface SettingsFormProps {
  settings: GlobalSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const updateMutation = useUpdateSettings();

  const [reviewModeModalOpen, setReviewModeModalOpen] = React.useState(false);
  const [pendingReviewMode, setPendingReviewMode] = React.useState<ReviewMode | null>(null);

  const [newRadiusInput, setNewRadiusInput] = React.useState('');
  const [radiusInputVisible, setRadiusInputVisible] = React.useState(false);

  const initialValues: SettingsFormData = {
    max_search_radius_km: settings.max_search_radius_km,
    allowed_radius_options_km: settings.allowed_radius_options_km,
    fuzz_distance_m: settings.fuzz_distance_m,
    max_reports_per_user_per_hour: settings.max_reports_per_user_per_hour,
    max_description_length: settings.max_description_length,
    review_mode: settings.review_mode,
    abuse_flag_hide_threshold: settings.abuse_flag_hide_threshold,
    alert_digest_threshold: settings.alert_digest_threshold,
    alert_digest_window_minutes: settings.alert_digest_window_minutes,
    min_account_age_minutes_to_report: settings.min_account_age_minutes_to_report,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
  });

  // Keep form in sync when server settings update
  React.useEffect(() => {
    reset({
      max_search_radius_km: settings.max_search_radius_km,
      allowed_radius_options_km: settings.allowed_radius_options_km,
      fuzz_distance_m: settings.fuzz_distance_m,
      max_reports_per_user_per_hour: settings.max_reports_per_user_per_hour,
      max_description_length: settings.max_description_length,
      review_mode: settings.review_mode,
      abuse_flag_hide_threshold: settings.abuse_flag_hide_threshold,
      alert_digest_threshold: settings.alert_digest_threshold,
      alert_digest_window_minutes: settings.alert_digest_window_minutes,
      min_account_age_minutes_to_report: settings.min_account_age_minutes_to_report,
    });
  }, [settings, reset]);

  const watchedValues = watch();
  const currentReviewMode = watchedValues.review_mode;

  const handleReviewModeChange = (newMode: ReviewMode) => {
    if (newMode !== currentReviewMode) {
      setPendingReviewMode(newMode);
      setReviewModeModalOpen(true);
    }
  };

  const confirmReviewModeChange = () => {
    if (pendingReviewMode) {
      setValue('review_mode', pendingReviewMode, { shouldDirty: true, shouldValidate: true });
      setPendingReviewMode(null);
    }
  };

  const cancelReviewModeChange = () => {
    setPendingReviewMode(null);
  };

  // Reset a specific individual field to canonical default
  const handleResetSingleField = <K extends keyof typeof DEFAULT_SETTINGS>(key: K) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(key, DEFAULT_SETTINGS[key] as any, { shouldDirty: true, shouldValidate: true });
  };

  // Add new radius option
  const handleAddRadius = () => {
    const parsed = parseInt(newRadiusInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const current = watchedValues.allowed_radius_options_km || [];
      if (!current.includes(parsed)) {
        const sorted = [...current, parsed].sort((a, b) => a - b);
        setValue('allowed_radius_options_km', sorted, { shouldDirty: true, shouldValidate: true });
      }
      setNewRadiusInput('');
      setRadiusInputVisible(false);
    }
  };

  // Remove radius option
  const handleRemoveRadius = (val: number) => {
    const current = watchedValues.allowed_radius_options_km || [];
    if (current.length <= 1) return; // keep at least 1
    const filtered = current.filter((r) => r !== val);
    setValue('allowed_radius_options_km', filtered, { shouldDirty: true, shouldValidate: true });
  };

  const handleDiscard = () => {
    reset(initialValues);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch {
      // Error handled by mutation
    }
  };

  const dirtyCount = Object.keys(dirtyFields).length;

  return (
    <>
      <SettingsUnsavedGuard isDirty={isDirty} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        {/* 1. Intake & Moderation Pipeline Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/80">
            <div className="p-1.5 rounded-md bg-accent/15 text-accent">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Intake & Moderation Pipeline
              </h2>
              <p className="text-xs text-muted-foreground">
                Define verification routing, abuse unpublishing thresholds, and reporting eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Setting: review_mode */}
            <div
              data-setting-key="review_mode"
              className="p-4 rounded-xl border border-border/80 bg-surface space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Incident Intake Review Mode
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                      review_mode
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manual mode routes all submissions to the moderation queue before publishing. Auto-approve publishes verified reports immediately.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground bg-surface-elevated px-2 py-0.5 rounded border border-border/40">
                    Default: {DEFAULT_SETTINGS.review_mode}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetSingleField('review_mode')}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Reset to default"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Segmented Control for Review Mode */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleReviewModeChange('manual')}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-colors ${
                    currentReviewMode === 'manual'
                      ? 'border-accent bg-accent/15 text-foreground font-semibold shadow-xs'
                      : 'border-border bg-surface-elevated/40 text-muted-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <span className="font-bold text-sm">Manual Review</span>
                  <span className="text-[11px] opacity-80 mt-0.5">
                    100% staff approval required before public map display
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewModeChange('auto_approve')}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border text-xs transition-colors ${
                    currentReviewMode === 'auto_approve'
                      ? 'border-status-warning bg-status-warning/15 text-foreground font-semibold shadow-xs'
                      : 'border-border bg-surface-elevated/40 text-muted-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <span className="font-bold text-sm">Auto-Approve</span>
                  <span className="text-[11px] opacity-80 mt-0.5">
                    Direct publishing with AI checks and community dispute flags
                  </span>
                </button>
              </div>
            </div>

            {/* Setting: abuse_flag_hide_threshold */}
            <div
              data-setting-key="abuse_flag_hide_threshold"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="abuse_flag_hide_threshold"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Abuse Flag Auto-Hide Threshold
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    abuse_flag_hide_threshold
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Number of unique citizen abuse or spam flags that automatically unpublish an incident pending moderator resolution.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="abuse_flag_hide_threshold"
                    aria-label="Abuse Flag Auto-Hide Threshold"
                    type="number"
                    min="1"
                    max="20"
                    className="w-20 font-mono text-xs text-right"
                    {...register('abuse_flag_hide_threshold', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">flags</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('abuse_flag_hide_threshold')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Setting: min_account_age_minutes_to_report */}
            <div
              data-setting-key="min_account_age_minutes_to_report"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="min_account_age_minutes_to_report"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Minimum Account Age to Report
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    min_account_age_minutes_to_report
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required waiting time after account creation before a citizen can submit incidents, mitigating bot swarms and burner accounts.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="min_account_age_minutes_to_report"
                    aria-label="Minimum Account Age to Report"
                    type="number"
                    min="0"
                    max="1440"
                    className="w-24 font-mono text-xs text-right"
                    {...register('min_account_age_minutes_to_report', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">minutes</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('min_account_age_minutes_to_report')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Geographic & Privacy Controls Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/80">
            <div className="p-1.5 rounded-md bg-status-info/15 text-status-info">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Geographic & Privacy Controls
              </h2>
              <p className="text-xs text-muted-foreground">
                Public coordinate fuzzing offset, discovery radius bounds, and client preset options.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Setting: fuzz_distance_m */}
            <div
              data-setting-key="fuzz_distance_m"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="fuzz_distance_m"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Public Coordinate Fuzzing Distance
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    fuzz_distance_m
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Randomized geographic offset jitter applied to public incident coordinates to protect reporter privacy and prevent exact location pinpointing.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="fuzz_distance_m"
                    aria-label="Public Coordinate Fuzzing Distance"
                    type="number"
                    min="50"
                    max="1000"
                    step="25"
                    className="w-24 font-mono text-xs text-right"
                    {...register('fuzz_distance_m', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">meters</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('fuzz_distance_m')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Setting: max_search_radius_km */}
            <div
              data-setting-key="max_search_radius_km"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="max_search_radius_km"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Maximum Search Radius
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    max_search_radius_km
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum geographic query distance supported by mobile API for nearby incident discovery and notifications.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="max_search_radius_km"
                    aria-label="Maximum Search Radius"
                    type="number"
                    min="5"
                    max="200"
                    step="5"
                    className="w-20 font-mono text-xs text-right"
                    {...register('max_search_radius_km', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">km</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('max_search_radius_km')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Setting: allowed_radius_options_km */}
            <div
              data-setting-key="allowed_radius_options_km"
              className="p-4 rounded-xl border border-border/80 bg-surface space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Allowed Radius Filter Options
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                      allowed_radius_options_km
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preset radius filter buttons presented to mobile citizens in the distance filter picker.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('allowed_radius_options_km')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 self-start sm:self-auto"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to default
                </Button>
              </div>

              {/* Tag Chips Editor */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(watchedValues.allowed_radius_options_km || []).map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-surface-elevated font-mono text-xs text-foreground"
                  >
                    <span>{val} km</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRadius(val)}
                      disabled={(watchedValues.allowed_radius_options_km || []).length <= 1}
                      className="text-muted-foreground hover:text-status-danger p-0.5 rounded transition-colors disabled:opacity-40"
                      aria-label={`Remove ${val} km`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {radiusInputVisible ? (
                  <div className="inline-flex items-center gap-1">
                    <Input
                      id="new_radius_option"
                      aria-label="New radius option in kilometers"
                      type="number"
                      min="1"
                      max="200"
                      value={newRadiusInput}
                      onChange={(e) => setNewRadiusInput(e.target.value)}
                      placeholder="km"
                      className="w-16 h-8 text-xs font-mono"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRadius();
                        } else if (e.key === 'Escape') {
                          setRadiusInputVisible(false);
                          setNewRadiusInput('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddRadius}
                      className="h-8 px-2 text-xs bg-accent text-accent-foreground"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRadiusInputVisible(false);
                        setNewRadiusInput('');
                      }}
                      className="h-8 px-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRadiusInputVisible(true)}
                    className="h-8 px-2.5 gap-1 text-xs border-dashed border-border"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add option</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Anti-Spam & Content Limits Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/80">
            <div className="p-1.5 rounded-md bg-status-warning/15 text-status-warning">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Anti-Spam & Content Limits
              </h2>
              <p className="text-xs text-muted-foreground">
                Rate limiting hourly submissions and description text boundaries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Setting: max_reports_per_user_per_hour */}
            <div
              data-setting-key="max_reports_per_user_per_hour"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="max_reports_per_user_per_hour"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Hourly Submission Rate Limit
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    max_reports_per_user_per_hour
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum incident reports an individual citizen account can submit within any rolling 60-minute window.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="max_reports_per_user_per_hour"
                    aria-label="Hourly Submission Rate Limit"
                    type="number"
                    min="1"
                    max="50"
                    className="w-20 font-mono text-xs text-right"
                    {...register('max_reports_per_user_per_hour', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">reports/hr</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('max_reports_per_user_per_hour')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Setting: max_description_length */}
            <div
              data-setting-key="max_description_length"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="max_description_length"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Maximum Description Length
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    max_description_length
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upper character bound for incident descriptive text in the mobile reporting flow.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="max_description_length"
                    aria-label="Maximum Description Length"
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    className="w-24 font-mono text-xs text-right"
                    {...register('max_description_length', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">chars</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('max_description_length')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Alerts & Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/80">
            <div className="p-1.5 rounded-md bg-status-danger/15 text-status-danger">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Emergency Alerts & Notifications
              </h2>
              <p className="text-xs text-muted-foreground">
                Digest aggregation thresholds and throttling time windows for proximity safety notifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Setting: alert_digest_threshold */}
            <div
              data-setting-key="alert_digest_threshold"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="alert_digest_threshold"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Alert Digest Grouping Threshold
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    alert_digest_threshold
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Count of simultaneous incidents in a zone that bundles notifications into an alert digest rather than individual push alerts.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="alert_digest_threshold"
                    aria-label="Alert Digest Grouping Threshold"
                    type="number"
                    min="2"
                    max="10"
                    className="w-20 font-mono text-xs text-right"
                    {...register('alert_digest_threshold', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">incidents</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('alert_digest_threshold')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Setting: alert_digest_window_minutes */}
            <div
              data-setting-key="alert_digest_window_minutes"
              className="p-4 rounded-xl border border-border/80 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="max-w-xl">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="alert_digest_window_minutes"
                    className="text-sm font-semibold text-foreground cursor-pointer"
                  >
                    Alert Digest Time Window
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground bg-surface-elevated px-1.5 py-0.5 rounded border border-border/50">
                    alert_digest_window_minutes
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rolling time window used to group and throttle localized emergency notifications into digests.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Input
                    id="alert_digest_window_minutes"
                    aria-label="Alert Digest Time Window"
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    className="w-24 font-mono text-xs text-right"
                    {...register('alert_digest_window_minutes', { valueAsNumber: true })}
                  />
                  <span className="text-xs font-mono text-muted-foreground">minutes</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResetSingleField('alert_digest_window_minutes')}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Dirty-State Bar */}
        <SettingsDirtyBar
          isDirty={isDirty}
          dirtyCount={dirtyCount}
          isSaving={updateMutation.isPending}
          onDiscard={handleDiscard}
          onSave={handleSubmit(onSubmit)}
        />
      </form>

      {/* Review Mode Confirmation Dialog */}
      {pendingReviewMode && (
        <ReviewModeConfirmDialog
          open={reviewModeModalOpen}
          onOpenChange={setReviewModeModalOpen}
          targetMode={pendingReviewMode}
          onConfirm={confirmReviewModeChange}
          onCancel={cancelReviewModeChange}
        />
      )}
    </>
  );
}
