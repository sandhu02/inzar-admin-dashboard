import type { StyleSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { CATEGORY_GLYPH_SVGS } from './map-constants';

/**
 * Standard Inzar Warm Graphite dark style specification.
 * Falls back to dark graphite background (#12110F) if network tiles are unreachable.
 */
export const INZAR_DARK_STYLE: StyleSpecification = {
  version: 8,
  name: 'Inzar Dark Warm Graphite',
  sources: {
    carto_dark_tiles: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#12110F',
      },
    },
    {
      id: 'carto_dark_layer',
      type: 'raster',
      source: 'carto_dark_tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

/**
 * Standard Inzar Warm Bone light style specification.
 */
export const INZAR_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  name: 'Inzar Light Warm',
  sources: {
    carto_light_tiles: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#F9F8F6',
      },
    },
    {
      id: 'carto_light_layer',
      type: 'raster',
      source: 'carto_light_tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

/**
 * Resolves map style based on active theme and environment variables.
 */
export function getMapStyle(
  theme: 'dark' | 'light',
  customUrl?: string
): string | StyleSpecification {
  // If an explicit custom style URL is provided (and not the demotiles fallback)
  if (customUrl && !customUrl.includes('demotiles.maplibre.org')) {
    return customUrl;
  }

  return theme === 'light' ? INZAR_LIGHT_STYLE : INZAR_DARK_STYLE;
}

/**
 * Registers crisp SVG glyph icons for each incident category onto the MapLibre map instance.
 */
export function registerCategoryIcons(map: MapLibreMap): void {
  if (typeof window === 'undefined') return;

  Object.entries(CATEGORY_GLYPH_SVGS).forEach(([key, svg]) => {
    if (map.hasImage(key)) return;

    const img = new Image(16, 16);
    img.onload = () => {
      if (!map.hasImage(key)) {
        map.addImage(key, img);
      }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
