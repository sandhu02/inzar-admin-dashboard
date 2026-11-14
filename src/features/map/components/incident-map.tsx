'use client';

import * as React from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Point } from 'geojson';
import { useTheme } from 'next-themes';
import { Locate, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';
import type { Incident } from '@/features/incidents/types';
import { incidentsToGeoJSON } from '../lib/geojson-utils';
import {
  getMapStyle,
  registerCategoryIcons,
} from '../lib/map-styles';
import {
  ISLAMABAD_DEFAULT_CENTER,
  ISLAMABAD_DEFAULT_ZOOM,
} from '../lib/map-constants';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncidentId?: string | null;
  onSelectIncident: (id: string | null) => void;
  onBoundsChange?: (bbox: string) => void;
  className?: string;
}

export function IncidentMap({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onBoundsChange,
  className = '',
}: IncidentMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const isLoadedRef = React.useRef(false);
  const { resolvedTheme } = useTheme();
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = React.useState<number>(ISLAMABAD_DEFAULT_ZOOM);

  // Stabilize callbacks and props via refs to prevent tearing down the map
  const onSelectIncidentRef = React.useRef(onSelectIncident);
  const onBoundsChangeRef = React.useRef(onBoundsChange);
  const selectedIncidentIdRef = React.useRef(selectedIncidentId);
  const activeThemeRef = React.useRef(resolvedTheme);

  // Convert incidents to GeoJSON (HARD PRIVACY: strictly fuzzed coordinates)
  const geojsonData = React.useMemo(() => {
    return incidentsToGeoJSON(incidents);
  }, [incidents]);

  const geojsonDataRef = React.useRef(geojsonData);

  React.useEffect(() => {
    onSelectIncidentRef.current = onSelectIncident;
    onBoundsChangeRef.current = onBoundsChange;
    selectedIncidentIdRef.current = selectedIncidentId;
    activeThemeRef.current = resolvedTheme;
    geojsonDataRef.current = geojsonData;
  });

  // Track map bounds when moving / zooming
  const notifyBounds = React.useCallback(() => {
    if (!mapRef.current || !onBoundsChangeRef.current) return;
    try {
      const bounds = mapRef.current.getBounds();
      const sw = bounds.getSouthWest().wrap();
      const ne = bounds.getNorthEast().wrap();
      const west = sw.lng;
      const south = Math.max(-85, sw.lat);
      const east = ne.lng;
      const north = Math.min(85, ne.lat);
      if (east <= west || north <= south) return;
      if (Math.abs(east - west) < 0.005 || Math.abs(north - south) < 0.005) return;
      const bboxStr = `${west.toFixed(5)},${south.toFixed(5)},${east.toFixed(5)},${north.toFixed(5)}`;
      onBoundsChangeRef.current(bboxStr);
      setCurrentZoom(Math.round(mapRef.current.getZoom() * 10) / 10);
    } catch {
      // ignore
    }
  }, []);

  // Setup layers and sources once style is loaded (stable callback)
  const setupLayers = React.useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    registerCategoryIcons(map);

    if (!map.getSource('incidents')) {
      map.addSource('incidents', {
        type: 'geojson',
        data: geojsonDataRef.current,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    } else {
      const source = map.getSource('incidents') as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(geojsonDataRef.current);
      }
    }

    // 1. Clustered circles layer
    if (!map.getLayer('clusters')) {
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FF6B2C', // primary Inzar signal orange for < 10
            10,
            '#F97316', // orange 10-49
            50,
            '#EF4444', // red 50-99
            100,
            '#DC2626', // dark red 100+
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            24,
            50,
            30,
            100,
            38,
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-opacity': 0.85,
        },
      });
    }

    // 2. Cluster count text label
    if (!map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });
    }

    // 3. Selected marker outer ring / glow layer
    if (!map.getLayer('selected-marker-ring')) {
      map.addLayer({
        id: 'selected-marker-ring',
        type: 'circle',
        source: 'incidents',
        filter: [
          'all',
          ['!has', 'point_count'],
          ['==', 'id', selectedIncidentIdRef.current || ''],
        ],
        paint: {
          'circle-radius': 17,
          'circle-color': '#FF6B2C',
          'circle-opacity': 0.25,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FF6B2C',
        },
      });
    }

    // 4. Individual unclustered incident points
    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'incidents',
        filter: ['!has', 'point_count'],
        paint: {
          'circle-color': ['get', 'category_color'],
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], selectedIncidentIdRef.current || ''],
            10,
            7.5,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'id'], selectedIncidentIdRef.current || ''],
            '#FFFFFF',
            '#12110F',
          ],
        },
      });
    }

    // 5. Category glyph icons over points
    if (!map.getLayer('unclustered-glyph')) {
      map.addLayer({
        id: 'unclustered-glyph',
        type: 'symbol',
        source: 'incidents',
        filter: ['!has', 'point_count'],
        layout: {
          'icon-image': ['concat', 'glyph-', ['get', 'category_slug']],
          'icon-size': 0.65,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
    }
  }, []);

  // Initialize Map
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const initialTheme = activeThemeRef.current === 'light' ? 'light' : 'dark';
      const mapStyle = getMapStyle(initialTheme, env.NEXT_PUBLIC_MAP_STYLE_URL);

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: mapStyle,
        center: ISLAMABAD_DEFAULT_CENTER,
        zoom: ISLAMABAD_DEFAULT_ZOOM,
        minZoom: 3,
        maxZoom: 18,
        attributionControl: false,
      });

      mapRef.current = map;
      if (typeof window !== 'undefined') {
        (window as unknown as { __mapInstance?: maplibregl.Map }).__mapInstance = map;
      }

      map.on('load', () => {
        isLoadedRef.current = true;
        setupLayers(map);
        notifyBounds();
      });

      map.on('styledata', () => {
        if (map.isStyleLoaded()) {
          isLoadedRef.current = true;
          setupLayers(map);
        }
      });

      map.on('moveend', () => {
        notifyBounds();
      });

      // Clicking a cluster zooms into the cluster expansion zoom
      map.on('click', 'clusters', async (e: maplibregl.MapLayerMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId !== undefined) {
          const source = map.getSource('incidents') as maplibregl.GeoJSONSource | undefined;
          if (source) {
            try {
              const zoom = await source.getClusterExpansionZoom(clusterId);
              const geom = features[0]?.geometry as Point | undefined;
              if (geom?.coordinates) {
                map.easeTo({
                  center: geom.coordinates as [number, number],
                  zoom: zoom + 0.5,
                  duration: 400,
                });
              }
            } catch {
              map.zoomIn();
            }
          }
        }
      });

      // Clicking an unclustered marker selects the incident and keeps map position!
      map.on('click', 'unclustered-point', (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onSelectIncidentRef.current(feature.properties.id as string);
        }
      });

      // Cursor pointer styling
      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });

      // Hover popup tooltip
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: 'incident-map-tooltip',
      });

      map.on('mouseenter', 'unclustered-point', (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const geom = feature.geometry as Point | undefined;
        const props = feature.properties;
        if (!geom?.coordinates || !props) return;

        popup
          .setLngLat(geom.coordinates as [number, number])
          .setHTML(
            `<div class="p-1 font-sans text-xs">
              <p class="font-bold text-foreground text-[12px] leading-tight">${props.title || 'Incident'}</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">${props.category_name} &bull; ${props.place_label}</p>
            </div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'unclustered-point', () => {
        popup.remove();
      });
    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
      setTimeout(() => {
        setMapError('Failed to initialize map canvas. WebGL may be disabled or unsupported.');
      }, 0);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __mapInstance?: maplibregl.Map }).__mapInstance;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isLoadedRef.current = false;
      }
    };
  }, [setupLayers, notifyBounds]);

  // Update GeoJSON data when incidents array changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const source = map.getSource('incidents') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojsonData);
    }
  }, [geojsonData]);

  // Update selected marker highlight filter and paint properties
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    if (map.getLayer('selected-marker-ring')) {
      map.setFilter('selected-marker-ring', [
        'all',
        ['!has', 'point_count'],
        ['==', 'id', selectedIncidentId || ''],
      ]);
    }

    if (map.getLayer('unclustered-point')) {
      map.setPaintProperty('unclustered-point', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], selectedIncidentId || ''],
        10,
        7.5,
      ]);
      map.setPaintProperty('unclustered-point', 'circle-stroke-color', [
        'case',
        ['==', ['get', 'id'], selectedIncidentId || ''],
        '#FFFFFF',
        '#12110F',
      ]);
    }
  }, [selectedIncidentId]);

  // Update theme / style when dark / light changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoadedRef.current) return;

    const activeTheme = resolvedTheme === 'light' ? 'light' : 'dark';
    const newStyle = getMapStyle(activeTheme, env.NEXT_PUBLIC_MAP_STYLE_URL);

    // Apply new style and re-bind layers once styled
    map.setStyle(newStyle);
    map.once('style.load', () => {
      setupLayers(map);
    });
  }, [resolvedTheme, setupLayers]);

  // Custom Controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetIslamabad = () => {
    mapRef.current?.flyTo({
      center: ISLAMABAD_DEFAULT_CENTER,
      zoom: ISLAMABAD_DEFAULT_ZOOM,
      essential: true,
      duration: 600,
    });
  };

  const handleFitVisibleBounds = () => {
    if (!mapRef.current || incidents.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    incidents.forEach((inc) => {
      if (inc.fuzzed_location?.lng !== undefined && inc.fuzzed_location?.lat !== undefined) {
        bounds.extend([inc.fuzzed_location.lng, inc.fuzzed_location.lat]);
      }
    });
    mapRef.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 15,
      duration: 500,
    });
  };

  if (mapError) {
    return (
      <div
        data-testid="map-error-fallback"
        className="relative w-full h-[620px] rounded-xl border border-destructive/40 bg-surface p-6 flex flex-col items-center justify-center text-center select-none"
      >
        <p className="text-sm font-semibold text-destructive font-sans">{mapError}</p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          You can navigate all visible incidents using the Accessible Incident List on the side.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="incident-map-container"
      className={`relative w-full h-full min-h-[520px] md:min-h-[640px] rounded-xl overflow-hidden border border-border bg-[#12110F] select-none ${className}`}
    >
      {/* MapLibre DOM canvas container */}
      <div
        ref={containerRef}
        data-testid="maplibre-canvas-container"
        className="absolute inset-0 w-full h-full"
      />

      {/* Map Overlays: Floating Navigation & Tool Bar */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 shadow-md">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="h-8 w-8 bg-surface-elevated/90 backdrop-blur-md border-border text-foreground hover:bg-surface hover:text-accent"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="h-8 w-8 bg-surface-elevated/90 backdrop-blur-md border-border text-foreground hover:bg-surface hover:text-accent"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleResetIslamabad}
          aria-label="Re-center to Islamabad"
          title="Re-center to Islamabad"
          className="h-8 w-8 bg-surface-elevated/90 backdrop-blur-md border-border text-foreground hover:bg-surface hover:text-accent"
        >
          <Locate className="h-4 w-4 text-accent" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleFitVisibleBounds}
          aria-label="Fit visible incidents bounds"
          title="Fit bounds of incidents"
          className="h-8 w-8 bg-surface-elevated/90 backdrop-blur-md border-border text-foreground hover:bg-surface hover:text-accent"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Floating Zoom / Status Indicator */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-mono text-white/90 border border-white/10 flex items-center gap-1.5 shadow-md">
          <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
          <span>Zoom: {currentZoom}x</span>
          <span className="text-white/40">|</span>
          <span>{incidents.length} points</span>
        </div>
      </div>
    </div>
  );
}
