'use client';

import * as React from 'react';
import { MapPin, Shield, Eye, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniMapProps {
  fuzzedLocation?: { lat: number; lng: number };
  exactLocation?: { lat: number; lng: number } | null;
  placeLabel?: string;
  isRevealed?: boolean;
  revealReason?: string | null;
  onOpenReveal: () => void;
}

export function IncidentMiniMap({
  fuzzedLocation = { lat: 33.7294, lng: 73.0551 },
  exactLocation,
  placeLabel,
  isRevealed = false,
  revealReason,
  onOpenReveal,
}: MiniMapProps) {
  const activeLat = isRevealed && exactLocation ? exactLocation.lat : fuzzedLocation.lat;
  const activeLng = isRevealed && exactLocation ? exactLocation.lng : fuzzedLocation.lng;

  // External mapping link (e.g. Google Maps or OpenStreetMap)
  const mapUrl = `https://www.google.com/maps?q=${activeLat},${activeLng}`;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Top Bar */}
      <div className="p-3.5 border-b border-border bg-surface-elevated/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
            Location Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRevealed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-status-warning/15 text-status-warning border border-status-warning/30">
              <Eye className="h-3 w-3" />
              EXACT GPS REVEALED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-surface-elevated text-muted-foreground border border-border">
              <Shield className="h-3 w-3 text-status-info" />
              FUZZED ~500M
            </span>
          )}
        </div>
      </div>

      {/* Mini Map Graphic (Stylized SVG Grid) */}
      <div className="relative w-full h-48 bg-[#181615] overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="detail-map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2DDD5" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#detail-map-grid)" />
        </svg>

        {/* Contour curves representing terrain */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -20,100 Q 120,40 260,120 T 540,80"
            fill="none"
            stroke="#FF6B2C"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M -10,140 Q 150,90 300,160 T 600,110"
            fill="none"
            stroke="#E2DDD5"
            strokeWidth="1"
          />
        </svg>

        {/* Center Target Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Fuzzed Radius Circle */}
          <div
            className={`rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              isRevealed
                ? 'w-12 h-12 border-status-warning/60 bg-status-warning/10 animate-pulse'
                : 'w-28 h-28 border-accent/40 bg-accent/10'
            }`}
          >
            {isRevealed ? (
              <div className="h-3 w-3 rounded-full bg-status-warning shadow-lg ring-4 ring-status-warning/30" />
            ) : (
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </div>
        </div>

        {/* Floating Coordinates Tag */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono text-white/90 border border-white/10 flex items-center gap-2">
          <span>
            {activeLat.toFixed(5)}°, {activeLng.toFixed(5)}°
          </span>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-0.5 ml-1"
          >
            Open <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase">Reported Area</div>
            <div className="text-sm font-sans font-semibold text-foreground">
              {placeLabel || 'Unknown Location'}
            </div>
          </div>

          {!isRevealed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenReveal}
              className="h-8 text-xs font-medium border-border hover:border-status-warning/50 text-foreground"
            >
              <Lock className="h-3.5 w-3.5 mr-1.5 text-status-warning" />
              Reveal Exact
            </Button>
          ) : (
            <div className="text-right">
              <span className="text-[11px] font-mono text-status-warning block">
                Audited reveal active
              </span>
              <span className="text-[10px] font-mono text-muted-foreground block truncate max-w-[180px]">
                {revealReason}
              </span>
            </div>
          )}
        </div>

        {!isRevealed && (
          <p className="text-[11px] font-sans text-muted-foreground/80 leading-relaxed">
            Public coordinates are fuzzed by approximately 500 meters to protect reporter safety and prevent targeted harassment. Staff can reveal exact coordinates under an audited justification.
          </p>
        )}
      </div>
    </div>
  );
}
