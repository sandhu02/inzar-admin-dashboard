export const ISLAMABAD_DEFAULT_CENTER: [number, number] = [73.0551, 33.7294];
export const ISLAMABAD_DEFAULT_ZOOM = 12;

export interface CategoryMarkerStyle {
  colorHex: string;
  glyph: string;
  label: string;
}

export const CATEGORY_MARKER_STYLES: Record<string, CategoryMarkerStyle> = {
  fire: {
    colorHex: '#FF6B2C', // Inzar signal orange / fire
    glyph: 'glyph-fire',
    label: 'Fire',
  },
  accident: {
    colorHex: '#FFC14D', // warning yellow
    glyph: 'glyph-accident',
    label: 'Accident',
  },
  road_block: {
    colorHex: '#E2DDD5', // bone / grey
    glyph: 'glyph-road_block',
    label: 'Road Block',
  },
  road_blockage: {
    colorHex: '#E2DDD5',
    glyph: 'glyph-road_block',
    label: 'Road Block',
  },
  flooding: {
    colorHex: '#4DA6FF', // info blue
    glyph: 'glyph-flooding',
    label: 'Flooding',
  },
  gathering: {
    colorHex: '#B8A5FF', // purple
    glyph: 'glyph-gathering',
    label: 'Public Gathering',
  },
  public_gathering: {
    colorHex: '#B8A5FF',
    glyph: 'glyph-gathering',
    label: 'Public Gathering',
  },
  other: {
    colorHex: '#A8A094', // secondary text grey
    glyph: 'glyph-other',
    label: 'Other',
  },
  other_hazard: {
    colorHex: '#A8A094',
    glyph: 'glyph-other',
    label: 'Other Hazard',
  },
};

export const CATEGORY_GLYPH_SVGS: Record<string, string> = {
  'glyph-fire': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  'glyph-accident': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  'glyph-road_block': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="11" x2="16" y2="11"/></svg>`,
  'glyph-flooding': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
  'glyph-gathering': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  'glyph-other': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};
