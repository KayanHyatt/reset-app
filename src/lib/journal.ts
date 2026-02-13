import { db } from "./db";

export type JournalEntry = {
  id: string;
  created_at: number;
  text: string;
};

function makeId() {
  // simple unique-enough id for MVP
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function addEntry(text: string): JournalEntry {
  const entry: JournalEntry = {
    id: makeId(),
    created_at: Date.now(),
    text,
  };

  db.runSync(
    "insert into journal_entries (id, created_at, text) values (?, ?, ?)",
    [entry.id, entry.created_at, entry.text]
  );

  return entry;
}

export function listEntries(limit = 50): JournalEntry[] {
  return db.getAllSync<JournalEntry>(
    "select id, created_at, text from journal_entries order by created_at desc limit ?",
    [limit]
  );
}
