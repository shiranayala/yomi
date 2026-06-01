-- Events table
create table if not exists events (
  id text primary key,
  title text not null,
  date text not null,
  time text not null,
  end_time text,
  cat text not null default 'personal',
  place text,
  reminder text not null default 'none',
  recurrence text not null default 'once',
  notes text,
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "public access events" on events for all using (true) with check (true);

-- Extend tasks table
alter table tasks
  add column if not exists type text default 'general',
  add column if not exists date text,
  add column if not exists reminder text default 'none',
  add column if not exists recurrence text default 'once',
  add column if not exists notes text;
