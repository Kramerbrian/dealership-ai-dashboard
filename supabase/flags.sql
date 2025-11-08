-- Feature flags storage with RLS (service-key writes only)

create table if not exists feature_flags (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table feature_flags enable row level security;

-- lock down anon/authenticated
revoke all on feature_flags from anon, authenticated;

-- create a safe read-only view (optional); we keep reads service-side for now
-- writes guarded by service key via server

-- seed defaults (idempotent)
insert into feature_flags(key,value)
  values
  ('auto_detect_tracking_ids', '{"enabled": true, "rollout": 1.0}'),
  ('gtm_recipe_export', '{"enabled": true, "rollout": 0.5}'),
  ('sms_magic_link', '{"enabled": false, "rollout": 0.0}'),
  ('skills_marketplace', '{"enabled": true, "rollout": 1.0}'),
  ('time_saved_meter', '{"enabled": true, "rollout": 1.0}'),
  ('stress_reduction_index', '{"enabled": true, "rollout": 1.0}'),
  ('leaderboards_metro', '{"enabled": false, "rollout": 0.2}'),
  ('reduced_motion_mode', '{"enabled": true, "rollout": 1.0}')
  on conflict(key) do nothing;

