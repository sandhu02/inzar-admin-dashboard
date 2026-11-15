import type { UserDetail, UserListItem, UserRole, UsersListResponse } from '@/features/users/types';
import { mockIncidentsDataset } from './incidents-data';
import type { Incident } from '@/features/incidents/types';

const INITIAL_USERS: UserDetail[] = [
  {
    id: 'usr_admin_001',
    display_name: 'Sana Rehman',
    email: 'admin@inzar.app',
    role: 'admin',
    is_suspended: false,
    is_verified: true,
    reports_count: 24,
    flags_count: 0,
    created_at: '2026-01-10T08:00:00Z',
    last_active_at: '2026-11-15T09:12:00Z',
    stats: {
      total_reports: 24,
      published_reports: 22,
      under_review_reports: 1,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_admin_1',
        device: 'Chrome on macOS (M3 Max)',
        ip_address: '182.185.120.12',
        created_at: '2026-11-15T08:00:00Z',
        last_seen_at: '2026-11-15T09:12:00Z',
        is_current: true,
      },
      {
        id: 'sess_admin_2',
        device: 'Inzar Mobile App (iOS 18.2)',
        ip_address: '39.40.112.54',
        created_at: '2026-11-12T14:30:00Z',
        last_seen_at: '2026-11-14T20:10:00Z',
        is_current: false,
      },
    ],
    moderation_history: [
      {
        id: 'mod_hist_0',
        action: 'role_change',
        reason: 'Initial system provisioning',
        actor: 'System Superuser',
        created_at: '2026-01-10T08:00:00Z',
        new_value: 'admin',
      },
    ],
  },
  {
    id: 'usr_mod_002',
    display_name: 'Ali Khan',
    email: 'moderator@inzar.app',
    role: 'moderator',
    is_suspended: false,
    is_verified: true,
    reports_count: 11,
    flags_count: 1,
    created_at: '2026-02-15T10:30:00Z',
    last_active_at: '2026-11-15T08:45:00Z',
    stats: {
      total_reports: 11,
      published_reports: 10,
      under_review_reports: 0,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 1,
    },
    sessions: [
      {
        id: 'sess_mod_1',
        device: 'Firefox on Windows 11',
        ip_address: '110.39.24.88',
        created_at: '2026-11-15T07:45:00Z',
        last_seen_at: '2026-11-15T08:45:00Z',
        is_current: true,
      },
    ],
    moderation_history: [
      {
        id: 'mod_hist_1',
        action: 'role_change',
        reason: 'Promoted to operational moderator after staff onboarding',
        actor: 'Sana Rehman (Admin)',
        created_at: '2026-02-15T10:30:00Z',
        previous_value: 'user',
        new_value: 'moderator',
      },
    ],
  },
  {
    id: 'usr_user_003',
    display_name: 'Zahid Mahmood',
    email: 'user@inzar.app',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    reports_count: 4,
    flags_count: 0,
    created_at: '2026-03-20T14:15:00Z',
    last_active_at: '2026-11-14T19:30:00Z',
    stats: {
      total_reports: 4,
      published_reports: 3,
      under_review_reports: 1,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_user_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '202.142.160.10',
        created_at: '2026-11-14T18:00:00Z',
        last_seen_at: '2026-11-14T19:30:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_004',
    display_name: 'Hamza Malik',
    email: 'hamza.malik@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 16,
    flags_count: 3,
    created_at: '2026-02-14T10:00:00Z',
    last_active_at: '2026-11-15T08:30:00Z',
    stats: {
      total_reports: 16,
      published_reports: 11,
      under_review_reports: 2,
      rejected_reports: 2,
      false_reports: 1,
      removed_reports: 0,
      flags_received: 3,
    },
    sessions: [
      {
        id: 'sess_hm_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '182.185.120.12',
        created_at: '2026-11-10T14:22:00Z',
        last_seen_at: '2026-11-15T08:30:00Z',
        is_current: false,
      },
    ],
    moderation_history: [
      {
        id: 'mod_hm_1',
        action: 'false_report_penalty',
        reason: 'Submitted staged photo as emergency fire incident on Margalla road',
        actor: 'Sana Rehman (Admin)',
        created_at: '2026-10-04T11:15:00Z',
      },
    ],
  },
  {
    id: 'usr_user_005',
    display_name: 'Ayesha Khan',
    email: 'ayesha.khan@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 9,
    flags_count: 0,
    created_at: '2026-03-01T11:20:00Z',
    last_active_at: '2026-11-14T16:45:00Z',
    stats: {
      total_reports: 9,
      published_reports: 8,
      under_review_reports: 1,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_ak_1',
        device: 'Inzar Mobile App (iOS 18.1)',
        ip_address: '39.40.119.23',
        created_at: '2026-11-14T12:00:00Z',
        last_seen_at: '2026-11-14T16:45:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_006',
    display_name: 'Bilal Ahmed',
    email: 'bilal.ahmed@example.com',
    role: 'user',
    is_suspended: true,
    is_verified: false,
    reports_count: 7,
    flags_count: 5,
    created_at: '2026-03-12T09:10:00Z',
    last_active_at: '2026-10-12T14:00:00Z',
    suspension_reason: 'Repeated submission of spam and fake incident reports',
    suspended_at: '2026-10-12T14:00:00Z',
    suspended_by: 'Sana Rehman (Admin)',
    stats: {
      total_reports: 7,
      published_reports: 1,
      under_review_reports: 0,
      rejected_reports: 4,
      false_reports: 2,
      removed_reports: 0,
      flags_received: 5,
    },
    sessions: [],
    moderation_history: [
      {
        id: 'mod_ba_1',
        action: 'suspension',
        reason: 'Repeated submission of spam and fake incident reports',
        actor: 'Sana Rehman (Admin)',
        created_at: '2026-10-12T14:00:00Z',
      },
    ],
  },
  {
    id: 'usr_user_007',
    display_name: 'Zainab Tariq',
    email: 'zainab.tariq@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 12,
    flags_count: 1,
    created_at: '2026-04-05T14:30:00Z',
    last_active_at: '2026-11-15T06:15:00Z',
    stats: {
      total_reports: 12,
      published_reports: 11,
      under_review_reports: 1,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 1,
    },
    sessions: [
      {
        id: 'sess_zt_1',
        device: 'Inzar Mobile App (Android 13)',
        ip_address: '110.39.28.14',
        created_at: '2026-11-15T05:00:00Z',
        last_seen_at: '2026-11-15T06:15:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_008',
    display_name: 'Usman Farooq',
    email: 'usman.farooq@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    reports_count: 3,
    flags_count: 0,
    created_at: '2026-04-18T16:00:00Z',
    last_active_at: '2026-11-13T12:40:00Z',
    stats: {
      total_reports: 3,
      published_reports: 2,
      under_review_reports: 1,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_uf_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '182.180.44.77',
        created_at: '2026-11-13T10:00:00Z',
        last_seen_at: '2026-11-13T12:40:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_009',
    display_name: 'Fatima Noor',
    email: 'fatima.noor@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 19,
    flags_count: 2,
    created_at: '2026-05-02T08:45:00Z',
    last_active_at: '2026-11-15T07:50:00Z',
    stats: {
      total_reports: 19,
      published_reports: 17,
      under_review_reports: 1,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 2,
    },
    sessions: [
      {
        id: 'sess_fn_1',
        device: 'Inzar Mobile App (iOS 18.0)',
        ip_address: '175.107.20.90',
        created_at: '2026-11-15T06:30:00Z',
        last_seen_at: '2026-11-15T07:50:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_010',
    display_name: 'Tariq Mehmood',
    email: 'tariq.mehmood@example.com',
    role: 'user',
    is_suspended: true,
    is_verified: true,
    reports_count: 8,
    flags_count: 4,
    created_at: '2026-05-15T11:10:00Z',
    last_active_at: '2026-11-01T09:30:00Z',
    suspension_reason: 'Coordinated manipulation of traffic hazard alerts',
    suspended_at: '2026-11-01T09:30:00Z',
    suspended_by: 'Ali Khan (Moderator)',
    stats: {
      total_reports: 8,
      published_reports: 3,
      under_review_reports: 0,
      rejected_reports: 3,
      false_reports: 2,
      removed_reports: 0,
      flags_received: 4,
    },
    sessions: [],
    moderation_history: [
      {
        id: 'mod_tm_1',
        action: 'suspension',
        reason: 'Coordinated manipulation of traffic hazard alerts',
        actor: 'Ali Khan (Moderator)',
        created_at: '2026-11-01T09:30:00Z',
      },
    ],
  },
  {
    id: 'usr_user_011',
    display_name: 'Maryam Bibi',
    email: 'maryam.bibi@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 5,
    flags_count: 0,
    created_at: '2026-06-01T10:00:00Z',
    last_active_at: '2026-11-12T15:20:00Z',
    stats: {
      total_reports: 5,
      published_reports: 5,
      under_review_reports: 0,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_mb_1',
        device: 'Inzar Mobile App (Android 13)',
        ip_address: '115.186.130.40',
        created_at: '2026-11-12T14:00:00Z',
        last_seen_at: '2026-11-12T15:20:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_012',
    display_name: 'Kamran Akram',
    email: 'kamran.akram@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    reports_count: 2,
    flags_count: 1,
    created_at: '2026-06-14T13:40:00Z',
    last_active_at: '2026-11-10T11:00:00Z',
    stats: {
      total_reports: 2,
      published_reports: 1,
      under_review_reports: 0,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 1,
    },
    sessions: [
      {
        id: 'sess_ka_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '39.40.115.10',
        created_at: '2026-11-10T09:30:00Z',
        last_seen_at: '2026-11-10T11:00:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_013',
    display_name: 'Saad Rafiq',
    email: 'saad.rafiq@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 14,
    flags_count: 1,
    created_at: '2026-07-03T09:15:00Z',
    last_active_at: '2026-11-15T09:00:00Z',
    stats: {
      total_reports: 14,
      published_reports: 12,
      under_review_reports: 1,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 1,
    },
    sessions: [
      {
        id: 'sess_sr_1',
        device: 'Inzar Mobile App (iOS 18.1)',
        ip_address: '182.185.110.45',
        created_at: '2026-11-15T07:00:00Z',
        last_seen_at: '2026-11-15T09:00:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_014',
    display_name: 'Hina Rabbani',
    email: 'hina.rabbani@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 6,
    flags_count: 0,
    created_at: '2026-07-20T15:50:00Z',
    last_active_at: '2026-11-14T21:10:00Z',
    stats: {
      total_reports: 6,
      published_reports: 6,
      under_review_reports: 0,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_hr_1',
        device: 'Inzar Mobile App (iOS 18.0)',
        ip_address: '202.142.155.80',
        created_at: '2026-11-14T20:00:00Z',
        last_seen_at: '2026-11-14T21:10:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_015',
    display_name: 'Omar Cheema',
    email: 'omar.cheema@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    reports_count: 1,
    flags_count: 0,
    created_at: '2026-08-11T12:00:00Z',
    last_active_at: '2026-11-09T18:40:00Z',
    stats: {
      total_reports: 1,
      published_reports: 1,
      under_review_reports: 0,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_oc_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '110.39.30.99',
        created_at: '2026-11-09T17:00:00Z',
        last_seen_at: '2026-11-09T18:40:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_016',
    display_name: 'Nida Dar',
    email: 'nida.dar@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 10,
    flags_count: 0,
    created_at: '2026-08-25T14:10:00Z',
    last_active_at: '2026-11-15T08:10:00Z',
    stats: {
      total_reports: 10,
      published_reports: 9,
      under_review_reports: 1,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_nd_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '175.107.15.22',
        created_at: '2026-11-15T07:00:00Z',
        last_seen_at: '2026-11-15T08:10:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_017',
    display_name: 'Asif Bajwa',
    email: 'asif.bajwa@example.com',
    role: 'user',
    is_suspended: true,
    is_verified: true,
    reports_count: 4,
    flags_count: 3,
    created_at: '2026-09-02T10:30:00Z',
    last_active_at: '2026-11-05T16:20:00Z',
    suspension_reason: 'Abusive language in incident description',
    suspended_at: '2026-11-05T16:20:00Z',
    suspended_by: 'Sana Rehman (Admin)',
    stats: {
      total_reports: 4,
      published_reports: 2,
      under_review_reports: 0,
      rejected_reports: 2,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 3,
    },
    sessions: [],
    moderation_history: [
      {
        id: 'mod_ab_1',
        action: 'suspension',
        reason: 'Abusive language in incident description',
        actor: 'Sana Rehman (Admin)',
        created_at: '2026-11-05T16:20:00Z',
      },
    ],
  },
  {
    id: 'usr_user_018',
    display_name: 'Rabia Basri',
    email: 'rabia.basri@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 7,
    flags_count: 0,
    created_at: '2026-09-15T11:45:00Z',
    last_active_at: '2026-11-14T17:15:00Z',
    stats: {
      total_reports: 7,
      published_reports: 7,
      under_review_reports: 0,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [
      {
        id: 'sess_rb_1',
        device: 'Inzar Mobile App (iOS 18.2)',
        ip_address: '182.180.50.60',
        created_at: '2026-11-14T16:00:00Z',
        last_seen_at: '2026-11-14T17:15:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
  {
    id: 'usr_user_019',
    display_name: 'Fawad Chaudhry',
    email: 'fawad.chaudhry@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    reports_count: 0,
    flags_count: 0,
    created_at: '2026-10-01T16:00:00Z',
    last_active_at: '2026-10-25T14:30:00Z',
    stats: {
      total_reports: 0,
      published_reports: 0,
      under_review_reports: 0,
      rejected_reports: 0,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 0,
    },
    sessions: [],
    moderation_history: [],
  },
  {
    id: 'usr_user_020',
    display_name: 'Mahnoor Baloch',
    email: 'mahnoor.baloch@example.com',
    role: 'user',
    is_suspended: false,
    is_verified: true,
    reports_count: 22,
    flags_count: 1,
    created_at: '2026-02-01T08:00:00Z',
    last_active_at: '2026-11-15T09:20:00Z',
    stats: {
      total_reports: 22,
      published_reports: 20,
      under_review_reports: 1,
      rejected_reports: 1,
      false_reports: 0,
      removed_reports: 0,
      flags_received: 1,
    },
    sessions: [
      {
        id: 'sess_mb2_1',
        device: 'Inzar Mobile App (Android 14)',
        ip_address: '115.186.120.55',
        created_at: '2026-11-15T08:30:00Z',
        last_seen_at: '2026-11-15T09:20:00Z',
        is_current: false,
      },
    ],
    moderation_history: [],
  },
];

// In-memory store initialized with deep clones
let mockUsersStore: UserDetail[] = JSON.parse(JSON.stringify(INITIAL_USERS));

export function resetMockUsers(): void {
  mockUsersStore = JSON.parse(JSON.stringify(INITIAL_USERS));
}

export function getAllMockUsers(): UserDetail[] {
  return mockUsersStore;
}

export function queryMockUsers(
  searchParams: URLSearchParams,
  viewerRole: string = 'admin'
): UsersListResponse {
  let list = [...mockUsersStore];

  // 1. Text search q
  const q = searchParams.get('q')?.trim().toLowerCase();
  if (q) {
    list = list.filter((user) => {
      const matchName = user.display_name.toLowerCase().includes(q);
      const matchEmail = (viewerRole === 'admin' && user.email) ? user.email.toLowerCase().includes(q) : false;
      const matchId = user.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchId;
    });
  }

  // 2. Role filter
  const role = searchParams.get('role')?.trim().toLowerCase();
  if (role && role !== 'all') {
    list = list.filter((user) => user.role.toLowerCase() === role);
  }

  // 3. Suspended / Active status
  const status = searchParams.get('status')?.trim().toLowerCase();
  if (status && status !== 'all') {
    if (status === 'suspended') {
      list = list.filter((user) => user.is_suspended);
    } else if (status === 'active') {
      list = list.filter((user) => !user.is_suspended);
    }
  }

  // 4. Verified filter
  const verified = searchParams.get('verified')?.trim().toLowerCase();
  if (verified && verified !== 'all') {
    if (verified === 'verified') {
      list = list.filter((user) => user.is_verified);
    } else if (verified === 'unverified') {
      list = list.filter((user) => !user.is_verified);
    }
  }

  // 5. Date filter
  const datePreset = searchParams.get('date_preset')?.trim().toLowerCase();
  const createdFrom = searchParams.get('created_from') || searchParams.get('from');
  const createdTo = searchParams.get('created_to') || searchParams.get('to');

  const now = new Date('2026-11-15T18:00:00Z').getTime();
  if (datePreset === 'today' || datePreset === '24h') {
    const cutoff = now - 24 * 60 * 60 * 1000;
    list = list.filter((u) => new Date(u.created_at).getTime() >= cutoff);
  } else if (datePreset === '7d') {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    list = list.filter((u) => new Date(u.created_at).getTime() >= cutoff);
  } else if (datePreset === '30d') {
    const cutoff = now - 30 * 24 * 60 * 60 * 1000;
    list = list.filter((u) => new Date(u.created_at).getTime() >= cutoff);
  } else if (createdFrom || createdTo) {
    if (createdFrom) {
      const fromTime = new Date(createdFrom).getTime();
      list = list.filter((u) => new Date(u.created_at).getTime() >= fromTime);
    }
    if (createdTo) {
      const toTime = new Date(createdTo).getTime();
      list = list.filter((u) => new Date(u.created_at).getTime() <= toTime);
    }
  }

  // 6. Sorting
  const sort = searchParams.get('sort') || 'created_at:desc';
  const [field, direction] = sort.split(':');
  list.sort((a, b) => {
    let cmp = 0;
    if (field === 'display_name') {
      cmp = a.display_name.localeCompare(b.display_name);
    } else if (field === 'reports_count') {
      cmp = a.reports_count - b.reports_count;
    } else {
      // default created_at
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return direction === 'asc' ? cmp : -cmp;
  });

  const total_count = list.length;

  // 7. Pagination
  const cursorParam = searchParams.get('cursor');
  const offset = cursorParam ? parseInt(cursorParam, 10) || 0 : 0;
  const limit = parseInt(searchParams.get('limit') || '25', 10) || 25;

  const paginatedItems = list.slice(offset, offset + limit);
  const nextOffset = offset + limit < total_count ? offset + limit : null;

  // 8. Omit/Mask email if viewer is not admin
  const sanitizedItems: UserListItem[] = paginatedItems.map((u) => ({
    id: u.id,
    display_name: u.display_name,
    email: viewerRole === 'admin' ? u.email : null,
    role: u.role,
    is_suspended: u.is_suspended,
    is_verified: u.is_verified,
    reports_count: u.reports_count,
    flags_count: u.flags_count,
    created_at: u.created_at,
    last_active_at: u.last_active_at,
    suspension_reason: u.suspension_reason,
    suspended_at: u.suspended_at,
    suspended_by: u.suspended_by,
  }));

  return {
    items: sanitizedItems,
    total_count,
    next_cursor: nextOffset !== null ? String(nextOffset) : null,
  };
}

export function getMockUserDetail(userId: string, viewerRole: string = 'admin'): UserDetail | null {
  const user = mockUsersStore.find((u) => u.id === userId);
  if (!user) return null;

  return {
    ...user,
    email: viewerRole === 'admin' ? user.email : null,
  };
}

export function updateMockUserSuspension(
  userId: string,
  isSuspended: boolean,
  reason: string,
  actor: string
): { user?: UserDetail; error?: { code: string; message: string } } {
  const userIndex = mockUsersStore.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return { error: { code: 'USER_NOT_FOUND', message: `User ${userId} not found.` } };
  }

  const user = mockUsersStore[userIndex]!;

  if (isSuspended && !reason?.trim()) {
    return { error: { code: 'REASON_REQUIRED', message: 'A reason is required to suspend an account.' } };
  }

  user.is_suspended = isSuspended;
  if (isSuspended) {
    user.suspension_reason = reason;
    user.suspended_at = new Date().toISOString();
    user.suspended_by = actor;
    // Invalidate sessions on suspension
    user.sessions = [];
  } else {
    user.suspension_reason = null;
    user.suspended_at = null;
    user.suspended_by = null;
  }

  user.moderation_history.unshift({
    id: `mod_${Date.now()}`,
    action: isSuspended ? 'suspension' : 'unsuspension',
    reason,
    actor,
    created_at: new Date().toISOString(),
  });

  return { user };
}

export function updateMockUserRole(
  userId: string,
  newRole: UserRole,
  reason: string,
  actor: string
): { user?: UserDetail; error?: { code: string; message: string } } {
  const userIndex = mockUsersStore.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return { error: { code: 'USER_NOT_FOUND', message: `User ${userId} not found.` } };
  }

  const user = mockUsersStore[userIndex]!;

  // Last-admin guard: if user is admin and demoting, ensure another admin exists
  if (user.role === 'admin' && newRole !== 'admin') {
    const adminCount = mockUsersStore.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      return {
        error: {
          code: 'LAST_ADMIN_GUARD',
          message: 'Cannot demote the last remaining administrator in the system.',
        },
      };
    }
  }

  const oldRole = user.role;
  user.role = newRole;

  user.moderation_history.unshift({
    id: `mod_${Date.now()}`,
    action: 'role_change',
    reason: reason || `Role updated from ${oldRole} to ${newRole}`,
    actor,
    created_at: new Date().toISOString(),
    previous_value: oldRole,
    new_value: newRole,
  });

  return { user };
}

export function revokeMockUserSessions(
  userId: string,
  reason: string = 'Staff administrative session revocation',
  actor: string = 'Staff Administrator'
): { success: boolean; revoked_count: number; error?: { code: string; message: string } } {
  const user = mockUsersStore.find((u) => u.id === userId);
  if (!user) {
    return { success: false, revoked_count: 0, error: { code: 'USER_NOT_FOUND', message: `User ${userId} not found.` } };
  }

  const count = user.sessions.length;
  user.sessions = [];

  user.moderation_history.unshift({
    id: `mod_${Date.now()}`,
    action: 'session_revocation',
    reason,
    actor,
    created_at: new Date().toISOString(),
  });

  return { success: true, revoked_count: count };
}

export function getMockUserIncidents(userId: string): Incident[] {
  // Return incidents seeded for this user or map from mockIncidentsDataset
  const charCode = userId.charCodeAt(userId.length - 1) || 0;
  // Match incidents where hash matches or return subset of dataset
  const userIncidents = mockIncidentsDataset.filter((_, idx) => (idx + charCode) % 7 === 0).slice(0, 8);
  return userIncidents;
}
