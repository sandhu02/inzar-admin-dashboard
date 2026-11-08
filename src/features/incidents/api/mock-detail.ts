import type { Incident, IncidentDetail, TimelineEvent, IncidentFlag, ReporterProfile } from '../types';

export function enrichIncidentDetail(base: Incident): IncidentDetail {
  const reportedTime = new Date(base.reported_at).getTime();
  const reportedIso = base.reported_at;

  const timeline: TimelineEvent[] = [
    {
      id: `tl_reported_${base.id}`,
      type: 'submitted',
      title: 'Incident Reported',
      description: `Report submitted via Inzar mobile app near ${base.place_label || 'reported location'}.`,
      timestamp: reportedIso,
      actor: 'Public Citizen',
    },
    {
      id: `tl_ai_${base.id}`,
      type: 'ai_reviewed',
      title: 'AI Multi-modal Verification',
      description: `Vision and NLP classifier verified visual consistency. Category matched to "${base.category.name}" (confidence: 93.8%).`,
      timestamp: new Date(reportedTime + 2 * 60 * 1000).toISOString(),
      actor: 'Inzar AI Reviewer v2.4',
    },
  ];

  if ((base.flags_count ?? 0) > 0) {
    timeline.push({
      id: `tl_flagged_${base.id}`,
      type: 'flagged',
      title: `${base.flags_count} Community Flag${(base.flags_count ?? 0) > 1 ? 's' : ''} Received`,
      description: 'Community members reported conflicting or outdated ground conditions.',
      timestamp: new Date(reportedTime + 18 * 60 * 1000).toISOString(),
      actor: 'Community Members',
    });
  }

  if (base.review_status === 'published') {
    timeline.push({
      id: `tl_decision_${base.id}`,
      type: 'decision',
      title: 'Approved and Published to Map',
      description: 'Incident verified by staff and broadcast to surrounding radius.',
      timestamp: new Date(reportedTime + 25 * 60 * 1000).toISOString(),
      actor: 'Sana Rehman (Admin)',
      notes: 'Confirmed by nearby traffic feed.',
    });
  } else if (base.review_status === 'not_approved') {
    timeline.push({
      id: `tl_decision_${base.id}`,
      type: 'decision',
      title: 'Report Rejected',
      description: 'Report does not meet safety broadcast criteria.',
      timestamp: new Date(reportedTime + 20 * 60 * 1000).toISOString(),
      actor: 'Staff Moderator',
      notes: 'Insufficient verifiable evidence.',
    });
  } else if (base.review_status === 'false_report') {
    timeline.push({
      id: `tl_decision_${base.id}`,
      type: 'decision',
      title: 'Marked as False Report',
      description: 'Report identified as misleading or intentional disinformation.',
      timestamp: new Date(reportedTime + 30 * 60 * 1000).toISOString(),
      actor: 'Staff Moderator',
      notes: 'Verified location is clear.',
    });
  } else if (base.review_status === 'removed') {
    timeline.push({
      id: `tl_decision_${base.id}`,
      type: 'decision',
      title: 'Soft-Removed by Moderator',
      description: 'Incident archived from public map.',
      timestamp: new Date(reportedTime + 45 * 60 * 1000).toISOString(),
      actor: 'Staff Moderator',
    });
  }

  if (base.lifecycle_status === 'resolved') {
    timeline.push({
      id: `tl_resolved_${base.id}`,
      type: 'resolved',
      title: 'Incident Resolved',
      description: 'Emergency response completed. Normal conditions restored.',
      timestamp: new Date(reportedTime + 90 * 60 * 1000).toISOString(),
      actor: 'Field Operations',
    });
  }

  // Deterministic reporter profile based on ID
  const reporterNames = [
    'Hamza Malik',
    'Ayesha Khan',
    'Bilal Ahmed',
    'Zainab Tariq',
    'Usman Farooq',
    'Fatima Noor',
  ];
  const charCode = base.id.charCodeAt(base.id.length - 1) || 0;
  const name = reporterNames[charCode % reporterNames.length]!;
  const emailName = name.toLowerCase().replace(' ', '.');

  const reporter: ReporterProfile = {
    id: `usr_${base.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}`,
    display_name: name,
    email: `${emailName}@example.com`,
    trust_score: 75 + (charCode % 23),
    account_created_at: '2026-02-14T10:00:00Z',
    incidents_count: 5 + (charCode % 12),
    flags_received_count: charCode % 3,
  };

  // Exact location slightly offset from fuzzed coordinates
  const fLat = base.fuzzed_location?.lat ?? 33.7294;
  const fLng = base.fuzzed_location?.lng ?? 73.0551;
  const exact_location = {
    lat: Number((fLat + 0.0018).toFixed(6)),
    lng: Number((fLng - 0.0014).toFixed(6)),
  };

  // Flags list
  const flagsCount = base.flags_count ?? 0;
  const flags: IncidentFlag[] = [];
  const flagReasons = [
    'Traffic has cleared up; road is now open.',
    'Location appears slightly different from description.',
    'Fire services have put out the flames.',
    'Duplicate of earlier report.',
  ];

  for (let i = 0; i < Math.min(flagsCount, 4); i++) {
    flags.push({
      id: `flag_${base.id}_${i + 1}`,
      type: i === 0 ? 'resolved' : i === 1 ? 'incorrect' : 'abuse',
      reason: flagReasons[i % flagReasons.length]!,
      created_at: new Date(reportedTime + (10 + i * 8) * 60 * 1000).toISOString(),
      flagger_count: 1 + i,
      status: 'pending',
    });
  }

  // Media URLs
  const mediaUrls: string[] = [];
  if (base.thumbnail_url) {
    mediaUrls.push(base.thumbnail_url);
  }

  return {
    ...base,
    media_urls: mediaUrls,
    exact_location,
    reporter,
    timeline,
    flags,
    published_at: base.review_status === 'published' ? new Date(reportedTime + 25 * 60 * 1000).toISOString() : null,
    expires_at: new Date(reportedTime + 12 * 3600 * 1000).toISOString(),
    last_confirmed_at: new Date(reportedTime + 15 * 60 * 1000).toISOString(),
    verification_label: base.flags_count === 0 ? 'ai_verified' : 'flagged',
  };
}
