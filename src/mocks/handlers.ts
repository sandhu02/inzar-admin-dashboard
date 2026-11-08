import { http, HttpResponse } from 'msw';

export const mockUsers = {
  admin: {
    id: 'usr_admin_001',
    email: 'admin@inzar.app',
    display_name: 'Sana Rehman',
    role: 'admin',
    is_suspended: false,
    is_verified: true,
    created_at: '2026-01-10T08:00:00Z',
  },
  moderator: {
    id: 'usr_mod_002',
    email: 'moderator@inzar.app',
    display_name: 'Ali Khan',
    role: 'moderator',
    is_suspended: false,
    is_verified: true,
    created_at: '2026-02-15T10:30:00Z',
  },
  user: {
    id: 'usr_user_003',
    email: 'user@inzar.app',
    display_name: 'Zahid Mahmood',
    role: 'user',
    is_suspended: false,
    is_verified: false,
    created_at: '2026-03-20T14:15:00Z',
  },
};

export const mockCategories = [
  {
    id: 'cat_accident',
    slug: 'accident',
    name: 'Accident',
    color_hex: '#FFC14D',
    icon_key: 'alert-triangle',
    is_active: true,
    sort_order: 1,
    urgency: 'high',
  },
  {
    id: 'cat_road_block',
    slug: 'road_block',
    name: 'Road Block',
    color_hex: '#E2DDD5',
    icon_key: 'shield-alert',
    is_active: true,
    sort_order: 2,
    urgency: 'routine',
  },
  {
    id: 'cat_fire',
    slug: 'fire',
    name: 'Fire',
    color_hex: '#FF6B2C',
    icon_key: 'flame',
    is_active: true,
    sort_order: 3,
    urgency: 'high',
  },
  {
    id: 'cat_flooding',
    slug: 'flooding',
    name: 'Flooding',
    color_hex: '#7CC4FF',
    icon_key: 'droplets',
    is_active: true,
    sort_order: 4,
    urgency: 'routine',
  },
  {
    id: 'cat_gathering',
    slug: 'gathering',
    name: 'Gathering',
    color_hex: '#A8A094',
    icon_key: 'users',
    is_active: true,
    sort_order: 5,
    urgency: 'routine',
  },
  {
    id: 'cat_other',
    slug: 'other',
    name: 'Other',
    color_hex: '#706B63',
    icon_key: 'help-circle',
    is_active: true,
    sort_order: 6,
    urgency: 'routine',
  },
];

export const handlers = [
  // Auth login
  http.post(/.*\/auth\/login$/, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.password !== 'Password123!') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    if (body.email === 'admin@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_admin_token',
        refresh_token: 'mock_jwt_refresh_admin_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.admin,
      });
    }

    if (body.email === 'moderator@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_mod_token',
        refresh_token: 'mock_jwt_refresh_mod_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.moderator,
      });
    }

    if (body.email === 'user@inzar.app') {
      return HttpResponse.json({
        access_token: 'mock_jwt_access_user_token',
        refresh_token: 'mock_jwt_refresh_user_token',
        token_type: 'bearer',
        expires_in: 900,
        user: mockUsers.user,
      });
    }

    return HttpResponse.json(
      {
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email.',
        },
      },
      { status: 404 }
    );
  }),

  // Auth refresh
  http.post(/.*\/auth\/refresh$/, async ({ request }) => {
    const body = (await request.json()) as { refresh_token?: string };
    if (!body.refresh_token || body.refresh_token.includes('invalid')) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Refresh token is invalid or expired.',
          },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      access_token: `mock_jwt_access_refreshed_${Date.now()}`,
      refresh_token: `mock_jwt_refresh_rotated_${Date.now()}`,
      expires_in: 900,
    });
  }),

  // Auth logout
  http.post(/.*\/auth\/logout$/, () => {
    return HttpResponse.json({ success: true });
  }),

  // Get current user profile
  http.get(/.*\/me$/, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication credentials were not provided.',
          },
        },
        { status: 401 }
      );
    }

    if (authHeader.includes('mod')) {
      return HttpResponse.json(mockUsers.moderator);
    }
    return HttpResponse.json(mockUsers.admin);
  }),

  // Categories list
  http.get(/.*\/admin\/categories$/, () => {
    return HttpResponse.json(mockCategories);
  }),

  // Overview stats
  http.get(/.*\/admin\/stats\/overview$/, () => {
    return HttpResponse.json({
      queue_size: 14,
      oldest_queue_item_age_minutes: 38,
      new_incidents_count: 212,
      flags_awaiting_action: 9,
      flags_distinct_incidents: 6,
      job_failures_count: 3,
      job_backlog_count: 27,
      active_users_count: 1284,
      alerts_sent_count: 3906,
    });
  }),
];
