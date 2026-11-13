import { describe, it, expect } from 'vitest';
import {
  getMapStyle,
  INZAR_DARK_STYLE,
  INZAR_LIGHT_STYLE,
} from './map-styles';

describe('map-styles', () => {
  it('returns INZAR_DARK_STYLE with warm graphite palette by default for dark theme', () => {
    const style = getMapStyle('dark') as typeof INZAR_DARK_STYLE;

    expect(style).toBe(INZAR_DARK_STYLE);
    expect(style.name).toContain('Inzar Dark');
    const bgLayer = style.layers.find((l: { id: string }) => l.id === 'background');
    expect(bgLayer).toBeDefined();
    // Inzar warm graphite background #12110F
    expect((bgLayer?.paint as { 'background-color': string })['background-color']).toBe('#12110F');
  });

  it('returns INZAR_LIGHT_STYLE with warm bone palette for light theme', () => {
    const style = getMapStyle('light') as typeof INZAR_LIGHT_STYLE;

    expect(style).toBe(INZAR_LIGHT_STYLE);
    expect(style.name).toContain('Inzar Light');
    const bgLayer = style.layers.find((l: { id: string }) => l.id === 'background');
    expect(bgLayer).toBeDefined();
    // Inzar light bone background #F9F8F6
    expect((bgLayer?.paint as { 'background-color': string })['background-color']).toBe('#F9F8F6');
  });

  it('uses custom style URL if configured and not demotiles fallback', () => {
    const customUrl = 'https://api.maptiler.com/maps/streets-v2/style.json?key=mock';
    const style = getMapStyle('dark', customUrl);

    expect(style).toBe(customUrl);
  });

  it('ignores demotiles fallback URL and uses Inzar Dark style', () => {
    const demoUrl = 'https://demotiles.maplibre.org/style.json';
    const style = getMapStyle('dark', demoUrl);

    expect(style).toBe(INZAR_DARK_STYLE);
  });
});
