<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f66c071b-9a28-415f-8105-1b79f0fe1049

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set required keys
3. Run the app:
   `npm run dev`
# scenefinds

## Supabase Setup

Set in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Create tables in Supabase SQL editor:

```sql
create table if not exists public.watchlist (
  user_id uuid not null,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie','tv')),
  title text not null,
  poster_path text,
  added_at timestamptz not null default now(),
  primary key (user_id, tmdb_id, media_type)
);

create table if not exists public.continue_watching (
  user_id uuid not null,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie','tv')),
  title text not null,
  poster_path text,
  progress double precision,
  season integer,
  episode integer,
  updated_at timestamptz not null default now(),
  primary key (user_id, tmdb_id, media_type)
);

alter table public.watchlist enable row level security;
alter table public.continue_watching enable row level security;

drop policy if exists "watchlist_owner_rw" on public.watchlist;
create policy "watchlist_owner_rw"
on public.watchlist
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "continue_watching_owner_rw" on public.continue_watching;
create policy "continue_watching_owner_rw"
on public.continue_watching
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```
