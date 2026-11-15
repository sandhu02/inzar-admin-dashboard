export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserListItem {
  id: string;
  display_name: string;
  email: string | null;
  role: UserRole;
  is_suspended: boolean;
  is_verified: boolean;
  reports_count: number;
  flags_count: number;
  created_at: string;
  last_active_at: string;
  suspension_reason?: string | null;
  suspended_at?: string | null;
  suspended_by?: string | null;
}

export interface UserSession {
  id: string;
  device: string;
  ip_address: string;
  created_at: string;
  last_seen_at: string;
  is_current: boolean;
}

export interface UserModerationHistoryItem {
  id: string;
  action: 'false_report_penalty' | 'rejection' | 'suspension' | 'unsuspension' | 'role_change' | 'session_revocation';
  reason: string;
  actor: string;
  created_at: string;
  previous_value?: string;
  new_value?: string;
}

export interface UserStats {
  total_reports: number;
  published_reports: number;
  under_review_reports: number;
  rejected_reports: number;
  false_reports: number;
  removed_reports: number;
  flags_received: number;
}

export interface UserDetail extends UserListItem {
  stats: UserStats;
  sessions: UserSession[];
  moderation_history: UserModerationHistoryItem[];
}

export interface UsersListResponse {
  items: UserListItem[];
  total_count: number;
  next_cursor: string | null;
}

export interface UserFilterValues {
  q?: string;
  role?: string;
  status?: 'all' | 'active' | 'suspended';
  verified?: 'all' | 'verified' | 'unverified';
  date_preset?: string;
  created_from?: string;
  created_to?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
}

export interface SuspendUserPayload {
  is_suspended: boolean;
  reason: string;
  notes?: string;
}

export interface ChangeUserRolePayload {
  role: UserRole;
  reason: string;
  notes?: string;
}

export interface RevokeUserSessionsPayload {
  reason?: string;
}
