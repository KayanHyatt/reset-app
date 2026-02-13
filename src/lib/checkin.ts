import { db } from "./db";

export type CheckInEntry = {
  id: string;
  created_at: number;
  mood: number; // 1-5
  stress: number; // 1-5
  sleep_hours: number;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function saveCheckIn(mood: number, stress: number, sleepHours: number): CheckInEntry {
  const row: CheckInEntry = {
    id: makeId(),
    created_at: Date.now(),
    mood,
    stress,
    sleep_hours: sleepHours,
  };

  db.runSync(
    "insert into checkins (id, created_at, mood, stress, sleep_hours) values (?, ?, ?, ?, ?)",
    [row.id, row.created_at, row.mood, row.stress, row.sleep_hours]
  );

  return row;
}

export function getLatestCheckIn(): CheckInEntry | null {
  const rows = db.getAllSync<CheckInEntry>(
    "select id, created_at, mood, stress, sleep_hours from checkins order by created_at desc limit 1"
  );
  return rows.length ? rows[0] : null;
}

export function listCheckIns(limit = 14): CheckInEntry[] {
  return db.getAllSync<CheckInEntry>(
    "select id, created_at, mood, stress, sleep_hours from checkins order by created_at desc limit ?",
    [limit]
  );
}
