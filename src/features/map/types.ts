import type { Feature, FeatureCollection, Point } from 'geojson';

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface IncidentGeoJsonProperties {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  review_status: string;
  lifecycle_status: string;
  place_label: string;
  reported_at: string;
  flags_count: number;
  has_media: boolean;
  thumbnail_url: string | null;
}

export type IncidentGeoJsonFeature = Feature<Point, IncidentGeoJsonProperties>;

export type IncidentGeoJsonCollection = FeatureCollection<Point, IncidentGeoJsonProperties>;

export interface MapFilterValues {
  q?: string;
  category?: string[];
  review?: string[];
  lifecycle?: string[];
  date_preset?: 'all' | 'today' | '24h' | '7d' | '30d' | 'custom';
  from?: string;
  to?: string;
  flagged?: boolean;
  has_media?: boolean;
  removed?: boolean;
  selected?: string | null;
  list_open?: boolean;
  viewport_sync?: boolean;
}
