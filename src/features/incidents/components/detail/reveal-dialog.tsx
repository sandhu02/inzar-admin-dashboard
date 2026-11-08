'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, User, MapPin } from 'lucide-react';

export type RevealType = 'reporter' | 'location';

interface RevealDialogProps {
  type: RevealType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (type: RevealType, reason: string) => Promise<void>;
  incidentId: string;
}

const REVEAL_CONFIGS: Record<
  RevealType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    confirmText: string;
    presets: string[];
  }
> = {
  reporter: {
    title: 'Reveal Reporter Identity',
    description:
      'Reporter identities are masked to protect community privacy under whistleblower rules. Revealing this profile requires an authorized reason and is permanently recorded in the moderation audit trail.',
    icon: User,
    confirmText: 'Reveal Reporter & Audit',
    presets: [
      'Investigation of repeated malicious / fake reports',
      'Law enforcement / official emergency inquiry',
      'Community safety threat assessment',
      'Moderator trust calibration appeal',
      'Other',
    ],
  },
  location: {
    title: 'Reveal Exact GPS Coordinates',
    description:
      'Coordinates are fuzzed by default to prevent precise domicile identification. Revealing exact pin coordinates requires operational necessity and is logged in the audit trail.',
    icon: MapPin,
    confirmText: 'Reveal Location & Audit',
    presets: [
      'Dispatching emergency response unit to scene',
      'Verifying boundary / municipal jurisdiction',
      'Investigating exact road obstacle location',
      'Resolving duplicate geofence collision',
      'Other',
    ],
  },
};

interface RevealDialogFormProps {
  type: RevealType;
  incidentId: string;
  onConfirm: (type: RevealType, reason: string) => Promise<void>;
  onCancel: () => void;
}

function RevealDialogForm({
  type,
  incidentId,
  onConfirm,
  onCancel,
}: RevealDialogFormProps) {
  const config = REVEAL_CONFIGS[type];
  const Icon = config.icon;

  const [presetReason, setPresetReason] = React.useState<string>(
    config.presets[0] || ''
  );
  const [customNotes, setCustomNotes] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const effectiveReason =
    presetReason === 'Other'
      ? customNotes.trim()
      : customNotes.trim()
        ? `${presetReason} — ${customNotes.trim()}`
        : presetReason;

  const isValid = effectiveReason.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onConfirm(type, effectiveReason);
      onCancel();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Reveal authorization failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-status-warning/15 flex items-center justify-center border border-status-warning/30">
            <Icon className="h-4 w-4 text-status-warning" />
          </div>
          <DialogTitle className="text-lg font-bold font-sans">
            {config.title}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
          {config.description}
        </DialogDescription>
      </DialogHeader>

      {/* Audit Notice Warning */}
      <div className="my-3 p-3 rounded-lg border border-status-warning/30 bg-status-warning/10 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
        <div className="text-xs text-status-warning font-sans leading-relaxed">
          <strong>Audited Action:</strong> Your staff ID, timestamp, and justification will be recorded in the security audit ledger for incident <code className="font-mono text-[11px] font-bold">{incidentId}</code>.
        </div>
      </div>

      <div className="space-y-3 my-4">
        <div>
          <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
            Authorized Purpose <span className="text-status-danger">*</span>
          </label>
          <select
            value={presetReason}
            onChange={(e) => setPresetReason(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-sans focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {config.presets.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-mono font-semibold uppercase text-muted-foreground block mb-1.5">
            {presetReason === 'Other' ? (
              <>
                Detailed Explanation <span className="text-status-danger">*</span>
              </>
            ) : (
              'Case Reference / Notes (Optional)'
            )}
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder={
              presetReason === 'Other'
                ? 'State the specific operational justification for this reveal...'
                : 'Add emergency dispatch ticket, investigator name, or notes...'
            }
            rows={3}
            className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        {errorMsg && (
          <div className="p-2 rounded-lg bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger">
            {errorMsg}
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={!isValid || isSubmitting}
          className="font-medium bg-status-warning hover:bg-status-warning/90 text-black border-none"
        >
          {isSubmitting ? 'Authorizing...' : config.confirmText}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RevealDialog({
  type,
  open,
  onOpenChange,
  onConfirm,
  incidentId,
}: RevealDialogProps) {
  if (!type) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <RevealDialogForm
            key={type}
            type={type}
            incidentId={incidentId}
            onConfirm={onConfirm}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
