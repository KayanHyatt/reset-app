import { db } from "./db";

export type DailyLog = {
  id: string;
  created_at: number;
  date_key: string; // YYYY-MM-DD
  mood: number | null;
  stress_level: number | null;
  main_stressors: string | null;
  coping_methods: string | null;
  daily_time: string | null;
  water_ml: number; // always number
  notes: string | null;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// helpers to ensure no undefined reaches SQLite
const asNull = <T>(v: T | null | undefined): T | null => (v === undefined ? null : v);
const asNumOrZero = (v: number | null | undefined): number => (typeof v === "number" ? v : 0);

export function upsertTodayLog(partial: Partial<DailyLog>) {
  const date_key = todayKey();

  const existing = db.getAllSync<DailyLog>(
    "select id, created_at, date_key, mood, stress_level, main_stressors, coping_methods, daily_time, water_ml, notes from daily_logs where date_key = ? limit 1",
    [date_key]
  );

  if (existing.length === 0) {
    const row: DailyLog = {
      id: makeId(),
      created_at: Date.now(),
      date_key,
      mood: asNull(partial.mood),
      stress_level: asNull(partial.stress_level),
      main_stressors: asNull(partial.main_stressors),
      coping_methods: asNull(partial.coping_methods),
      daily_time: asNull(partial.daily_time),
      water_ml: asNumOrZero(partial.water_ml),
      notes: asNull(partial.notes),
    };

    db.runSync(
      `insert into daily_logs
        (id, created_at, date_key, mood, stress_level, main_stressors, coping_methods, daily_time, water_ml, notes)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.created_at,
        row.date_key,
        row.mood,
        row.stress_level,
        row.main_stressors,
        row.coping_methods,
        row.daily_time,
        row.water_ml,
        row.notes,
      ]
    );

    return row;
  }

  const current = existing[0];

  // merge current + partial, then sanitize
  const next: DailyLog = {
    id: current.id,
    created_at: current.created_at,
    date_key: current.date_key,
    mood: asNull(partial.mood ?? current.mood),
    stress_level: asNull(partial.stress_level ?? current.stress_level),
    main_stressors: asNull(partial.main_stressors ?? current.main_stressors),
    coping_methods: asNull(partial.coping_methods ?? current.coping_methods),
    daily_time: asNull(partial.daily_time ?? current.daily_time),
    water_ml: typeof partial.water_ml === "number" ? partial.water_ml : current.water_ml ?? 0,
    notes: asNull(partial.notes ?? current.notes),
  };

  db.runSync(
    `update daily_logs set
      mood = ?,
      stress_level = ?,
      main_stressors = ?,
      coping_methods = ?,
      daily_time = ?,
      water_ml = ?,
      notes = ?
     where date_key = ?`,
    [
      next.mood,
      next.stress_level,
      next.main_stressors,
      next.coping_methods,
      next.daily_time,
      next.water_ml,
      next.notes,
      next.date_key,
    ]
  );

  return next;
}

export function getTodayLog(): DailyLog | null {
  const date_key = todayKey();
  const rows = db.getAllSync<DailyLog>(
    "select id, created_at, date_key, mood, stress_level, main_stressors, coping_methods, daily_time, water_ml, notes from daily_logs where date_key = ? limit 1",
    [date_key]
  );
  return rows.length ? rows[0] : null;
}
