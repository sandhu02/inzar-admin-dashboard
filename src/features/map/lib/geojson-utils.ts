import type { Incident } from '@/features/incidents/types';
import type { IncidentGeoJsonCollection, IncidentGeoJsonFeature } from '../types';
import { CATEGORY_MARKER_STYLES } from './map-constants';

/**
 * Transforms an array of incidents into a GeoJSON FeatureCollection.
 *
 * CRITICAL PRIVACY RULE:
 * Only fuzzed coordinates (incident.fuzzed_location) are EVER placed
 * into the GeoJSON output. Exact reporter coordinates must NEVER be
 * exposed on the public or dashboard map layer.
 */
export function incidentsToGeoJSON(incidents: Incident[]): IncidentGeoJsonCollection {
  const features: IncidentGeoJsonFeature[] = incidents.map((incident) => {
    const slug = incident.category?.slug?.toLowerCase() || 'other';
    const markerStyle = CATEGORY_MARKER_STYLES[slug] || CATEGORY_MARKER_STYLES.other!;
    const lng = incident.fuzzed_location?.lng ?? 73.0551;
    const lat = incident.fuzzed_location?.lat ?? 33.7294;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        // In GeoJSON, order is strictly [longitude, latitude]
        // HARD CONSTRAINT: ONLY FUZZED COORDINATES
        coordinates: [lng, lat],
      },
      properties: {
        id: incident.id,
        title: incident.title,
        description: incident.description || '',
        category_id: incident.category.id,
        category_slug: incident.category.slug,
        category_name: incident.category.name,
        category_color: incident.category.color_hex || markerStyle.colorHex,
        category_icon: incident.category.icon_key || 'alert-triangle',
        review_status: incident.review_status,
        lifecycle_status: incident.lifecycle_status,
        place_label: incident.place_label || 'Reported Location',
        reported_at: incident.reported_at,
        flags_count: incident.flags_count ?? 0,
        has_media: incident.has_media ?? false,
        thumbnail_url: incident.thumbnail_url ?? null,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Helper to check whether an incident's fuzzed location falls within a bounding box.
 * Format of bbox string: "minLng,minLat,maxLng,maxLat"
 */
export function isIncidentInBbox(
  incident: Incident,
  bbox: [number, number, number, number]
): boolean {
  if (!incident.fuzzed_location) return false;
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const { lng, lat } = incident.fuzzed_location;
  return lng !== undefined && lat !== undefined && lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}
