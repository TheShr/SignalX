# SignalX Database Schema

This schema is designed for a high-throughput, real-time decision engine using Supabase PostgreSQL with proper indexing and pagination support.

## Tables

### users
- `id` uuid primary key default `gen_random_uuid()`
- `firebase_uid` text unique not null
- `email` text unique not null
- `created_at` timestamp with time zone default `now()`

### events
- `id` uuid primary key default `gen_random_uuid()`
- `user_id` uuid references `users(id)` on delete cascade
- `source` text not null
- `payload` jsonb not null default `'{}'`
- `status` text not null default `'pending'`
- `created_at` timestamp with time zone default `now()`
- `updated_at` timestamp with time zone default `now()`

### insights
- `id` uuid primary key default `gen_random_uuid()`
- `event_id` uuid references `events(id)` on delete cascade unique
- `user_id` uuid references `users(id)` on delete cascade
- `title` text not null
- `explanation` text not null
- `suggested_action` text not null
- `confidence` numeric not null default `0`
- `impact` text not null
- `created_at` timestamp with time zone default `now()`

### alerts
- `id` uuid primary key default `gen_random_uuid()`
- `user_id` uuid references `users(id)` on delete cascade
- `event_id` uuid references `events(id)` on delete set null
- `title` text not null
- `message` text not null
- `priority` text not null
- `resolved` boolean not null default `false`
- `created_at` timestamp with time zone default `now()`

## Indexes

```sql
create index idx_events_user_created_at on events(user_id, created_at desc);
create index idx_events_status_created_at on events(status, created_at asc);
create index idx_insights_user_created_at on insights(user_id, created_at desc);
create index idx_alerts_user_created_at on alerts(user_id, created_at desc);
create index idx_alerts_resolved_created_at on alerts(user_id, resolved, created_at desc);
```

## Notes

- `events` is intentionally write-optimized: simple fields, jsonb payload, and indexes on `status` + `created_at` for worker batching.
- `insights` and `alerts` use descending timestamp indexes to support fast recent-first feeds.
- Pagination is implemented via `LIMIT`/`OFFSET` on user-scoped queries.
- In production, partial indexes or time-based partitioning can be added for very large tables.
