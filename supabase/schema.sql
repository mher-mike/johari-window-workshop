create extension if not exists pgcrypto;

create table if not exists participants (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists adjectives (
  id text primary key,
  label text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  title text not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references sessions(id) on delete cascade,
  respondent_id text not null references participants(id) on delete cascade,
  target_id text not null references participants(id) on delete cascade,
  adjective_id text not null references adjectives(id) on delete cascade,
  response_type text not null check (response_type in ('self', 'peer')),
  created_at timestamptz not null default now(),
  constraint self_response_match check (
    (response_type = 'self' and respondent_id = target_id) or
    (response_type = 'peer' and respondent_id <> target_id)
  ),
  constraint one_adjective_per_target unique (session_id, respondent_id, target_id, adjective_id)
);

create index if not exists responses_session_idx on responses(session_id);
create index if not exists responses_respondent_idx on responses(session_id, respondent_id);
create index if not exists responses_target_idx on responses(session_id, target_id);

alter table participants enable row level security;
alter table adjectives enable row level security;
alter table sessions enable row level security;
alter table responses enable row level security;

drop policy if exists "Public read participants" on participants;
create policy "Public read participants"
  on participants for select
  using (true);

drop policy if exists "Public read adjectives" on adjectives;
create policy "Public read adjectives"
  on adjectives for select
  using (true);

drop policy if exists "Public read sessions" on sessions;
create policy "Public read sessions"
  on sessions for select
  using (true);
