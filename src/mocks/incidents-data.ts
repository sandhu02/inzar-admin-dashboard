import { mockCategories } from './fixtures';

export interface MockIncident {
  id: string;
  title: string;
  description: string;
  category: (typeof mockCategories)[number];
  review_status:
    | 'ai_reviewed'
    | 'under_review'
    | 'needs_review'
    | 'published'
    | 'not_approved'
    | 'removed'
    | 'false_report';
  lifecycle_status: 'active' | 'resolved' | 'expired' | 'hidden';
  flags_count: number;
  place_label: string;
  fuzzed_location: {
    lat: number;
    lng: number;
  };
  reported_at: string;
  has_media: boolean;
  thumbnail_url: string | null;
  reporter_id: string;
}

const PLACES = [
  'F-7 · Margalla Rd',
  'F-7 · Kashmir Hwy',
  'G-6 · Service Rd',
  'I-8 · Underpass',
  'F-7 · Jinnah Super',
  'F-8 · Kashmir Hwy',
  'G-5 · Faisal Ave',
  'E-7 · Park Rd',
  'Blue Area · Jinnah Ave',
  'H-8 · Islamabad Expressway',
  'F-6 · Super Market',
  'Rawal Lake · Club Rd',
  'I-9 · Industrial Area',
  'G-11 · Srinagar Hwy',
  'D-12 · Margalla Foot',
];

const TITLES: Record<string, string[]> = {
  accident: [
    'Two-car collision, left lane blocked',
    'Collision, Kashmir Hwy near bridge',
    'Motorbike accident near underpass',
    'Rear-end collision, 9th Ave',
    'Vehicle overturned on slip road',
    'Minor fender bender causing slow traffic',
  ],
  road_block: [
    'Fallen tree on Service Rd',
    'Police checkpoint, Faisal Ave',
    'Barrier across Service Rd',
    'Construction barrier unlit at night',
    'Road closed for municipal maintenance',
    'Broken-down truck blocking right lane',
  ],
  fire: [
    'Brush fire near Trail 4',
    'Small trash fire behind market',
    'Transformer spark and smoke emission',
    'Dry brush burning on median strip',
    'Kitchen smoke incident near food street',
    'Electrical wiring fire on utility pole',
  ],
  flooding: [
    'Water pooling at underpass',
    'Water on Park Rd after heavy rain',
    'Blocked storm drain overflowing on curb',
    'Standing water across service lane',
    'Localized underpass flooding, drive with caution',
  ],
  gathering: [
    'Crowd near Jinnah Super',
    'Public procession moving along main avenue',
    'Large gathering outside administrative building',
    'Unscheduled public congregation',
    'Market crowd spilling onto roadway',
  ],
  other: [
    'Street light down, Park Rd',
    'Unlabelled debris, F-8',
    'Damaged road sign leaning into lane',
    'Pothole cluster damaging tires',
    'Loose gravel spread across turn',
    'Fallen advertising banner on verge',
  ],
};

const REVIEW_STATUSES: MockIncident['review_status'][] = [
  'published',
  'under_review',
  'needs_review',
  'ai_reviewed',
  'not_approved',
  'false_report',
  'removed',
];

const LIFECYCLE_STATUSES: MockIncident['lifecycle_status'][] = [
  'active',
  'resolved',
  'expired',
  'hidden',
];

// Generate 520 deterministic incidents
export function generateMockIncidents(): MockIncident[] {
  const incidents: MockIncident[] = [];
  const now = new Date('2026-11-08T14:30:00Z').getTime();

  // First 8 items matching exactly the PDF Page 2 design
  incidents.push(
    {
      id: 'inc_001',
      title: 'Brush fire near Trail 4',
      description: 'Brush fire on the slope above Trail 4, smoke drifting toward the road. No people nearby.',
      category: mockCategories[2]!, // Fire
      review_status: 'under_review',
      lifecycle_status: 'active',
      flags_count: 2,
      place_label: 'F-7 · Margalla Rd',
      fuzzed_location: { lat: 33.7294, lng: 73.0551 },
      reported_at: new Date(now - 2 * 60 * 1000).toISOString(), // 2 min ago
      has_media: true,
      thumbnail_url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=200&auto=format&fit=crop&q=60',
      reporter_id: 'usr_reporter_101',
    },
    {
      id: 'inc_002',
      title: 'Two-car collision, left lane blocked',
      description: 'Two passenger cars in left lane collision. Debris on road causing significant tailback.',
      category: mockCategories[0]!, // Accident
      review_status: 'published',
      lifecycle_status: 'active',
      flags_count: 0,
      place_label: 'F-7 · Kashmir Hwy',
      fuzzed_location: { lat: 33.7182, lng: 73.0423 },
      reported_at: new Date(now - 12 * 60 * 1000).toISOString(), // 12 min ago
      has_media: true,
      thumbnail_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&auto=format&fit=crop&q=60',
      reporter_id: 'usr_reporter_102',
    },
    {
      id: 'inc_003',
      title: 'Fallen tree on Service Rd',
      description: 'Large pine branch fell across the service lane, fully obstructing through vehicular movement.',
      category: mockCategories[1]!, // Road Block
      review_status: 'published',
      lifecycle_status: 'resolved',
      flags_count: 1,
      place_label: 'G-6 · Service Rd',
      fuzzed_location: { lat: 33.7088, lng: 73.0782 },
      reported_at: new Date(now - 21 * 3600 * 1000).toISOString(), // 21 h ago
      has_media: true,
      thumbnail_url: null,
      reporter_id: 'usr_reporter_103',
    },
    {
      id: 'inc_004',
      title: 'Water pooling at underpass',
      description: 'Heavy rain created deep standing puddle. Low clearance vehicles unable to pass safely.',
      category: mockCategories[3]!, // Flooding
      review_status: 'not_approved',
      lifecycle_status: 'expired',
      flags_count: 0,
      place_label: 'I-8 · Underpass',
      fuzzed_location: { lat: 33.6791, lng: 73.0612 },
      reported_at: new Date(now - 3 * 24 * 3600 * 1000).toISOString(), // 3 d ago
      has_media: false,
      thumbnail_url: null,
      reporter_id: 'usr_reporter_104',
    },
    {
      id: 'inc_005',
      title: 'Crowd near Jinnah Super',
      description: 'Public gathering spilling over into main traffic circle with slowed vehicle movement.',
      category: mockCategories[4]!, // Gathering
      review_status: 'under_review',
      lifecycle_status: 'active',
      flags_count: 3,
      place_label: 'F-7 · Jinnah Super',
      fuzzed_location: { lat: 33.7275, lng: 73.0543 },
      reported_at: new Date(now - 36 * 60 * 1000).toISOString(), // 36 min ago
      has_media: true,
      thumbnail_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=60',
      reporter_id: 'usr_reporter_105',
    },
    {
      id: 'inc_006',
      title: 'Collision, Kashmir Hwy',
      description: 'Rear bumper collision cleared onto emergency verge.',
      category: mockCategories[0]!, // Accident
      review_status: 'published',
      lifecycle_status: 'resolved',
      flags_count: 0,
      place_label: 'F-8 · Kashmir Hwy',
      fuzzed_location: { lat: 33.7051, lng: 73.0381 },
      reported_at: new Date(now - 27 * 24 * 3600 * 1000).toISOString(), // 27 d ago
      has_media: false,
      thumbnail_url: null,
      reporter_id: 'usr_reporter_106',
    },
    {
      id: 'inc_007',
      title: 'Police checkpoint, Faisal Ave',
      description: 'Routine checking point creating 2-lane slow down.',
      category: mockCategories[1]!, // Road Block
      review_status: 'false_report',
      lifecycle_status: 'hidden',
      flags_count: 2,
      place_label: 'G-5 · Faisal Ave',
      fuzzed_location: { lat: 33.7145, lng: 73.0699 },
      reported_at: new Date(now - 2 * 24 * 3600 * 1000).toISOString(), // 2 d ago
      has_media: false,
      thumbnail_url: null,
      reporter_id: 'usr_reporter_107',
    },
    {
      id: 'inc_008',
      title: 'Street light down, Park Rd',
      description: 'Damaged pole lying partially on sidewalk.',
      category: mockCategories[5]!, // Other
      review_status: 'removed',
      lifecycle_status: 'hidden',
      flags_count: 0,
      place_label: 'E-7 · Park Rd',
      fuzzed_location: { lat: 33.7342, lng: 73.0498 },
      reported_at: new Date(now - 4 * 24 * 3600 * 1000).toISOString(), // 4 d ago
      has_media: false,
      thumbnail_url: null,
      reporter_id: 'usr_reporter_108',
    }
  );

  // Generate 512 additional diverse incidents
  for (let i = 9; i <= 520; i++) {
    const catIndex = i % mockCategories.length;
    const category = mockCategories[catIndex]!;
    const catTitles = TITLES[category.slug] || TITLES.other!;
    const title = catTitles[i % catTitles.length]!;
    const place = PLACES[i % PLACES.length]!;

    // Distribute review & lifecycle statuses
    const reviewStatus = REVIEW_STATUSES[i % REVIEW_STATUSES.length]!;
    const lifecycleStatus = LIFECYCLE_STATUSES[i % LIFECYCLE_STATUSES.length]!;
    const flagsCount = i % 7 === 0 ? (i % 4) + 1 : 0;
    const hasMedia = i % 3 !== 0;

    // Time offset between 30 minutes and 30 days
    const minutesAgo = (i * 83) % (30 * 24 * 60);
    const reportedAt = new Date(now - minutesAgo * 60 * 1000).toISOString();

    // Coordinates in Islamabad cluster
    const lat = 33.68 + ((i * 17) % 600) / 10000;
    const lng = 73.02 + ((i * 23) % 600) / 10000;

    incidents.push({
      id: `inc_${i.toString().padStart(3, '0')}`,
      title,
      description: `Reported incident at ${place}. Community verification active.`,
      category,
      review_status: reviewStatus,
      lifecycle_status: lifecycleStatus,
      flags_count: flagsCount,
      place_label: place,
      fuzzed_location: { lat, lng },
      reported_at: reportedAt,
      has_media: hasMedia,
      thumbnail_url: hasMedia
        ? 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=200&auto=format&fit=crop&q=60'
        : null,
      reporter_id: `usr_reporter_${(i % 50) + 100}`,
    });
  }

  return incidents;
}

export const mockIncidentsDataset = generateMockIncidents();
