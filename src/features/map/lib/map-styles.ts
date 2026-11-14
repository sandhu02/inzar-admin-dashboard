import type { StyleSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { CATEGORY_GLYPH_SVGS } from './map-constants';

/**
 * Standard Inzar Warm Graphite dark style specification using OpenStreetMap tiles.
 * Uses raster dimming and desaturation paint properties to render a clean dark map without watermarks.
 */
export const INZAR_DARK_STYLE: StyleSpecification = {
  version: 8,
  name: 'Inzar Dark Warm Graphite (OpenStreetMap)',
  sources: {
    osm_tiles: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
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
      id: 'osm_dark_layer',
      type: 'raster',
      source: 'osm_tiles',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.72,
        'raster-brightness-max': 0.45,
        'raster-contrast': 0.35,
        'raster-saturation': -0.7,
      },
    },
  ],
};

/**
 * Standard Inzar Warm Bone light style specification using OpenStreetMap tiles.
 */
export const INZAR_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  name: 'Inzar Light Warm (OpenStreetMap)',
  sources: {
    osm_tiles: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
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
      id: 'osm_light_layer',
      type: 'raster',
      source: 'osm_tiles',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.95,
      },
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
