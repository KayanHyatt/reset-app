import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("reset.db");

export function initDb() {
  db.execSync(`
    create table if not exists journal_entries (
      id text primary key not null,
      created_at integer not null,
      text text not null
    );

    create table if not exists checkins (
      id text primary key not null,
      created_at integer not null,
      mood integer not null,
      stress integer not null,
      sleep_hours real not null
    );

    create table if not exists daily_logs (
      id text primary key not null,
      created_at integer not null,
      date_key text not null,
      mood integer,
      stress_level integer,
      main_stressors text,
      coping_methods text,
      daily_time text,
      water_ml integer not null default 0,
      notes text
    );

    create index if not exists idx_daily_logs_date_key on daily_logs(date_key);
  `);
}
