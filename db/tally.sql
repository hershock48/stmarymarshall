-- The one table the platform keeps: counts per day, host, kind and key.
-- No visitor is ever in it. See lib/tally.ts for what each kind means.
-- Apply once to the Neon database named by DATABASE_URL.
create table if not exists tally (
  day  date not null,
  host text not null,
  kind text not null,
  key  text not null,
  n    integer not null default 0,
  primary key (day, host, kind, key)
);
create index if not exists tally_kind_day on tally (kind, day);
