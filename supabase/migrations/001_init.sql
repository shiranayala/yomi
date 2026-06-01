-- yomi: initial schema

create table if not exists tasks (
  id text primary key,
  title text not null,
  cat text not null default 'personal',
  done boolean not null default false,
  time text,
  today boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists shopping (
  id text primary key,
  title text not null,
  done boolean not null default false,
  aisle text not null default 'אחר',
  created_at timestamptz default now()
);

create table if not exists notes (
  id text primary key,
  title text not null,
  body text not null default '',
  tone text not null default 'plain',
  pinned boolean not null default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (open read/write — tighten later with auth)
alter table tasks enable row level security;
alter table shopping enable row level security;
alter table notes enable row level security;

create policy "public access tasks" on tasks for all using (true) with check (true);
create policy "public access shopping" on shopping for all using (true) with check (true);
create policy "public access notes" on notes for all using (true) with check (true);
