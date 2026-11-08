'use client';

import * as React from 'react';
import { MapPin, Navigation, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationFilterProps {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  onApply: (lat: number, lng: number, radiusKm: number) => void;
  onClear: () => void;
}

// Bounding box for Islamabad map area
const MAP_BOUNDS = {
  minLat: 33.64,
  maxLat: 33.76,
  minLng: 72.98,
  maxLng: 73.12,
};

const LANDMARKS = [
  { name: 'Margalla Rd (F-7)', lat: 33.7294, lng: 73.0551 },
  { name: 'Blue Area', lat: 33.71, lng: 73.058 },
  { name: 'Kashmir Hwy', lat: 33.7051, lng: 73.0381 },
  { name: 'I-8 Underpass', lat: 33.6791, lng: 73.0612 },
];

export function IncidentLocationFilter({
  lat: initialLat,
  lng: initialLng,
  radiusKm: initialRadius = 5,
  onApply,
  onClear,
}: LocationFilterProps) {
  const [centerLat, setCenterLat] = React.useState<number>(
    initialLat ?? 33.7145
  );
  const [centerLng, setCenterLng] = React.useState<number>(
    initialLng ?? 73.055
  );
  const [radius, setRadius] = React.useState<number>(initialRadius);

  const hasActiveFilter =
    typeof initialLat === 'number' && typeof initialLng === 'number';

  // SVG coordinate conversion
  const svgWidth = 320;
  const svgHeight = 200;

  const toSvgX = (lng: number) =>
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
    svgWidth;

  const toSvgY = (lat: number) =>
    svgHeight -
    ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
      svgHeight;

  const toGeoCoord = (x: number, y: number) => {
    const lng =
      MAP_BOUNDS.minLng + (x / svgWidth) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const lat =
      MAP_BOUNDS.maxLat -
      (y / svgHeight) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
    };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { lat, lng } = toGeoCoord(x, y);
    setCenterLat(lat);
    setCenterLng(lng);
  };

  // Convert radius in km to approximate SVG pixels (Islamabad: 1 deg lat ~ 111 km)
  const kmToSvgPixels = (km: number) => {
    const latDiff = km / 111;
    const totalLatSpan = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
    return (latDiff / totalLatSpan) * svgHeight;
  };

  const currentX = toSvgX(centerLng);
  const currentY = toSvgY(centerLat);
  const radiusPx = kmToSvgPixels(radius);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-accent" />
          Location Radius Filter
        </label>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-mono text-status-danger hover:underline inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Clear location
          </button>
        )}
      </div>

      {/* Interactive Mini Map SVG */}
      <div className="relative rounded-lg border border-border bg-surface overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 cursor-crosshair select-none bg-background/50"
          onClick={handleSvgClick}
          role="img"
          aria-label="Interactive mini map: click anywhere to set search center"
        >
          {/* Subtle Grid Lines */}
          <line
            x1="0"
            y1={svgHeight * 0.25}
            x2={svgWidth}
            y2={svgHeight * 0.25}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={svgHeight * 0.5}
            x2={svgWidth}
            y2={svgHeight * 0.5}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={svgHeight * 0.75}
            x2={svgWidth}
            y2={svgHeight * 0.75}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={svgWidth * 0.25}
            y1="0"
            x2={svgWidth * 0.25}
            y2={svgHeight}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={svgWidth * 0.5}
            y1="0"
            x2={svgWidth * 0.5}
            y2={svgHeight}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={svgWidth * 0.75}
            y1="0"
            x2={svgWidth * 0.75}
            y2={svgHeight}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />

          {/* Margalla Hills outline banner at top */}
          <path
            d="M 0 30 Q 80 15, 160 25 T 320 20 L 320 0 L 0 0 Z"
            fill="currentColor"
            fillOpacity="0.05"
          />
          <text
            x="12"
            y="20"
            className="fill-muted-foreground/60 text-[9px] font-mono tracking-wider"
          >
            MARGALLA RIDGE
          </text>

          {/* Landmarks */}
          {LANDMARKS.map((lm) => {
            const lx = toSvgX(lm.lng);
            const ly = toSvgY(lm.lat);
            return (
              <g
                key={lm.name}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCenterLat(lm.lat);
                  setCenterLng(lm.lng);
                }}
              >
                <circle
                  cx={lx}
                  cy={ly}
                  r="3"
                  className="fill-muted-foreground/60 hover:fill-accent transition-colors"
                />
                <text
                  x={lx + 5}
                  y={ly + 3}
                  className="fill-muted-foreground text-[8px] font-mono select-none"
                >
                  {lm.name}
                </text>
              </g>
            );
          })}

          {/* Search Radius Circle */}
          <circle
            cx={currentX}
            cy={currentY}
            r={radiusPx}
            className="fill-accent/15 stroke-accent/70 stroke-[1.5]"
            strokeDasharray="3 3"
          />

          {/* Center Pin */}
          <circle
            cx={currentX}
            cy={currentY}
            r="6"
            className="fill-accent stroke-white/80 stroke-2"
          />
        </svg>

        <div className="p-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-surface-elevated/40">
          <span>Click map to relocate center</span>
          <span>
            {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Preset Landmark Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {LANDMARKS.map((lm) => (
          <button
            key={lm.name}
            type="button"
            onClick={() => {
              setCenterLat(lm.lat);
              setCenterLng(lm.lng);
            }}
            className="text-[11px] font-mono px-2 py-0.5 rounded border border-border/70 hover:border-accent hover:text-accent bg-surface-elevated/50 transition-colors"
          >
            {lm.name}
          </button>
        ))}
      </div>

      {/* Numeric Inputs */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] font-mono text-muted-foreground block mb-1">
            LATITUDE
          </label>
          <Input
            type="number"
            step="0.0001"
            value={centerLat}
            onChange={(e) => setCenterLat(parseFloat(e.target.value) || 0)}
            className="h-8 text-xs font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted-foreground block mb-1">
            LONGITUDE
          </label>
          <Input
            type="number"
            step="0.0001"
            value={centerLng}
            onChange={(e) => setCenterLng(parseFloat(e.target.value) || 0)}
            className="h-8 text-xs font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted-foreground block mb-1">
            RADIUS (KM)
          </label>
          <Input
            type="number"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="accent"
          onClick={() => onApply(centerLat, centerLng, radius)}
          className="text-xs font-medium"
        >
          <MapPin className="h-3.5 w-3.5 mr-1" />
          Apply Location Filter ({radius} km)
        </Button>
      </div>
    </div>
  );
}
