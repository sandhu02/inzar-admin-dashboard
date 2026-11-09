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

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function queryMockIncidents(searchParams: URLSearchParams) {
  const cursorParam = searchParams.get('cursor');
  const limit = Math.min(
    Math.max(1, Number(searchParams.get('limit')) || 25),
    100
  );
  const q = searchParams.get('q')?.toLowerCase()?.trim();
  const reviewStatusParam = searchParams.get('review_status');
  const lifecycleStatusParam = searchParams.get('lifecycle_status');
  const categoryIdParams = searchParams.getAll('category_id');
  const flagged = searchParams.get('flagged');
  const hasMedia = searchParams.get('has_media');
  const removed = searchParams.get('removed');
  const reporterId = searchParams.get('reporter_id');
  const createdFrom = searchParams.get('created_from');
  const createdTo = searchParams.get('created_to');
  const near = searchParams.get('near');
  const bbox = searchParams.get('bbox');
  const sort = searchParams.get('sort') || 'reported_at:desc';

  let items = [...mockIncidentsDataset];

  // Filter: search text
  if (q) {
    items = items.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.place_label.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
    );
  }

  // Filter: review_status
  if (reviewStatusParam) {
    const statuses = reviewStatusParam
      .split(',')
      .map((s) => s.trim().toLowerCase());
    items = items.filter((inc) =>
      statuses.includes(inc.review_status.toLowerCase())
    );
  } else if (removed !== 'true') {
    // Exclude soft-deleted incidents by default unless requested
    items = items.filter((inc) => inc.review_status !== 'removed');
  }

  // Filter: lifecycle_status
  if (lifecycleStatusParam) {
    const statuses = lifecycleStatusParam
      .split(',')
      .map((s) => s.trim().toLowerCase());
    items = items.filter((inc) =>
      statuses.includes(inc.lifecycle_status.toLowerCase())
    );
  }

  // Filter: category_id (supports comma-separated or multiple query params)
  if (categoryIdParams.length > 0) {
    const allowedCategories = categoryIdParams
      .flatMap((c) => c.split(','))
      .map((c) => c.trim().toLowerCase());
    items = items.filter(
      (inc) =>
        allowedCategories.includes(inc.category.id.toLowerCase()) ||
        allowedCategories.includes(inc.category.slug.toLowerCase())
    );
  }

  // Filter: flagged
  if (flagged === 'true') {
    items = items.filter((inc) => inc.flags_count > 0);
  } else if (flagged === 'false') {
    items = items.filter((inc) => inc.flags_count === 0);
  }

  // Filter: has_media
  if (hasMedia === 'true') {
    items = items.filter((inc) => inc.has_media);
  } else if (hasMedia === 'false') {
    items = items.filter((inc) => !inc.has_media);
  }

  // Filter: reporter_id
  if (reporterId) {
    items = items.filter((inc) => inc.reporter_id === reporterId);
  }

  // Filter: created_from
  if (createdFrom) {
    const fromTime = new Date(createdFrom).getTime();
    if (!isNaN(fromTime)) {
      items = items.filter(
        (inc) => new Date(inc.reported_at).getTime() >= fromTime
      );
    }
  }

  // Filter: created_to
  if (createdTo) {
    const toTime = new Date(createdTo).getTime();
    if (!isNaN(toTime)) {
      items = items.filter(
        (inc) => new Date(inc.reported_at).getTime() <= toTime
      );
    }
  }

  // Filter: near (lat,lng,radius_km)
  if (near) {
    const [latStr, lngStr, radiusStr] = near.split(',');
    const centerLat = Number(latStr);
    const centerLng = Number(lngStr);
    const radiusKm = Number(radiusStr);
    if (!isNaN(centerLat) && !isNaN(centerLng) && !isNaN(radiusKm)) {
      items = items.filter((inc) => {
        const dist = getDistanceKm(
          centerLat,
          centerLng,
          inc.fuzzed_location.lat,
          inc.fuzzed_location.lng
        );
        return dist <= radiusKm;
      });
    }
  }

  // Filter: bbox (min_lon,min_lat,max_lon,max_lat)
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
    if (
      minLon !== undefined &&
      minLat !== undefined &&
      maxLon !== undefined &&
      maxLat !== undefined &&
      !isNaN(minLon) &&
      !isNaN(minLat) &&
      !isNaN(maxLon) &&
      !isNaN(maxLat)
    ) {
      items = items.filter(
        (inc) =>
          inc.fuzzed_location.lng >= minLon &&
          inc.fuzzed_location.lng <= maxLon &&
          inc.fuzzed_location.lat >= minLat &&
          inc.fuzzed_location.lat <= maxLat
      );
    }
  }

  // Sorting
  const [sortField, sortDirection] = sort.split(':');
  items.sort((a, b) => {
    let comparison = 0;
    if (sortField === 'reported_at') {
      comparison =
        new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
    } else if (sortField === 'flags_count' || sortField === 'flag_count') {
      comparison = a.flags_count - b.flags_count;
    } else if (sortField === 'status' || sortField === 'review_status') {
      comparison = a.review_status.localeCompare(b.review_status);
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison =
        new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalCount = items.length;

  // Pagination with offset-based cursor
  let offset = 0;
  if (cursorParam) {
    const parsedOffset = parseInt(cursorParam, 10);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      offset = parsedOffset;
    }
  }

  const pagedItems = items.slice(offset, offset + limit);
  const nextOffset = offset + limit < totalCount ? offset + limit : null;
  const prevOffset = offset > 0 ? Math.max(0, offset - limit) : null;

  // Privacy Rule: strip reporter_id and exact location
  const sanitizedItems = pagedItems.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ reporter_id, ...item }) => item
  );

  return {
    items: sanitizedItems,
    next_cursor: nextOffset !== null ? String(nextOffset) : null,
    prev_cursor: prevOffset !== null ? String(prevOffset) : null,
    total_count: totalCount,
  };
}
