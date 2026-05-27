import type { SQLiteDatabase } from 'expo-sqlite';

export type JournalEntry = {
  id: string;
  patch_id: string;
  body: string;
  created_at: string;
};

export type Patch = {
  id: string;
  name: string;
  radius_km: number;
  created_at: string;
};

export type Sighting = {
  id: string;
  patch_id: string;
  species: string;
  count: number;
  notes: string | null;
  seen_at: string;
  created_at: string;
  time_of_day?: string | null;
  conditions?: string | null;
};

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS patches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      radius_km INTEGER DEFAULT 5,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sightings (
      id TEXT PRIMARY KEY,
      patch_id TEXT NOT NULL,
      species TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      notes TEXT,
      seen_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sightings_patch_id ON sightings(patch_id);
    CREATE INDEX IF NOT EXISTS idx_sightings_seen_at ON sightings(seen_at);
    CREATE INDEX IF NOT EXISTS idx_sightings_species ON sightings(species);

    CREATE TABLE IF NOT EXISTS journal (
      id TEXT PRIMARY KEY,
      patch_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_journal_patch_id ON journal(patch_id);
  `);

  try {
    await db.execAsync('ALTER TABLE sightings ADD COLUMN time_of_day TEXT');
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await db.execAsync('ALTER TABLE sightings ADD COLUMN conditions TEXT');
  } catch {
    // column already exists — safe to ignore
  }
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
  } catch {
    // table already exists — safe to ignore
  }
}

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export function setSetting(db: SQLiteDatabase, key: string, value: string) {
  return db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

export function getFirstPatch(db: SQLiteDatabase) {
  return db.getFirstAsync<Patch>('SELECT * FROM patches LIMIT 1');
}

export function insertPatch(db: SQLiteDatabase, patch: Patch) {
  return db.runAsync(
    'INSERT INTO patches (id, name, radius_km, created_at) VALUES (?, ?, ?, ?)',
    patch.id, patch.name, patch.radius_km, patch.created_at,
  );
}

export function updatePatch(db: SQLiteDatabase, id: string, name: string, radius_km: number) {
  return db.runAsync(
    'UPDATE patches SET name = ?, radius_km = ? WHERE id = ?',
    name, radius_km, id,
  );
}

export function insertSighting(db: SQLiteDatabase, sighting: Sighting) {
  return db.runAsync(
    'INSERT INTO sightings (id, patch_id, species, count, notes, seen_at, created_at, time_of_day, conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    sighting.id, sighting.patch_id, sighting.species, sighting.count,
    sighting.notes ?? null, sighting.seen_at, sighting.created_at,
    sighting.time_of_day ?? null, sighting.conditions ?? null,
  );
}

export async function getYearSpeciesCount(db: SQLiteDatabase, patchId: string, year: number) {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT species) as count FROM sightings
     WHERE patch_id = ? AND strftime('%Y', seen_at) = ?`,
    patchId, String(year),
  );
  return row?.count ?? 0;
}

export async function getAllTimeSpeciesCount(db: SQLiteDatabase, patchId: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT species) as count FROM sightings WHERE patch_id = ?',
    patchId,
  );
  return row?.count ?? 0;
}

export function getRecentSightings(db: SQLiteDatabase, patchId: string, limit = 50) {
  return db.getAllAsync<Sighting>(
    'SELECT * FROM sightings WHERE patch_id = ? ORDER BY seen_at DESC, created_at DESC LIMIT ?',
    patchId, limit,
  );
}

export function getSpeciesSightings(db: SQLiteDatabase, patchId: string, species: string) {
  return db.getAllAsync<Sighting>(
    'SELECT * FROM sightings WHERE patch_id = ? AND species = ? ORDER BY seen_at DESC, created_at DESC',
    patchId, species,
  );
}

export async function hasSpeciesBeenLogged(db: SQLiteDatabase, patchId: string, species: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sightings WHERE patch_id = ? AND species = ?',
    patchId, species,
  );
  return (row?.count ?? 0) > 0;
}

export async function getPatchSpecies(db: SQLiteDatabase, patchId: string, year?: number): Promise<string[]> {
  if (year !== undefined) {
    const rows = await db.getAllAsync<{ species: string }>(
      `SELECT DISTINCT species FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ? ORDER BY species ASC`,
      patchId, String(year),
    );
    return rows.map(r => r.species);
  }
  const rows = await db.getAllAsync<{ species: string }>(
    'SELECT DISTINCT species FROM sightings WHERE patch_id = ? ORDER BY species ASC',
    patchId,
  );
  return rows.map(r => r.species);
}

export function getPatchSpeciesWithCounts(
  db: SQLiteDatabase,
  patchId: string,
): Promise<{ species: string; record_count: number }[]> {
  return db.getAllAsync<{ species: string; record_count: number }>(
    'SELECT species, COUNT(*) as record_count FROM sightings WHERE patch_id = ? GROUP BY species ORDER BY species ASC',
    patchId,
  );
}

export async function getFirstSightingDate(
  db: SQLiteDatabase,
  patchId: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ first_seen: string | null }>(
    'SELECT MIN(seen_at) as first_seen FROM sightings WHERE patch_id = ?',
    patchId,
  );
  return row?.first_seen ?? null;
}

export function getSighting(db: SQLiteDatabase, id: string) {
  return db.getFirstAsync<Sighting>('SELECT * FROM sightings WHERE id = ?', id);
}

export function updateSighting(db: SQLiteDatabase, id: string, species: string, count: number, notes: string | null, seenAt: string, timeOfDay?: string | null, conditions?: string | null) {
  return db.runAsync(
    'UPDATE sightings SET species = ?, count = ?, notes = ?, seen_at = ?, time_of_day = ?, conditions = ? WHERE id = ?',
    species, count, notes, seenAt, timeOfDay ?? null, conditions ?? null, id,
  );
}

export function deleteSighting(db: SQLiteDatabase, id: string) {
  return db.runAsync('DELETE FROM sightings WHERE id = ?', id);
}

export function insertJournalEntry(db: SQLiteDatabase, entry: JournalEntry) {
  return db.runAsync(
    'INSERT INTO journal (id, patch_id, body, created_at) VALUES (?, ?, ?, ?)',
    entry.id, entry.patch_id, entry.body, entry.created_at,
  );
}

export function getJournalEntries(db: SQLiteDatabase, patchId: string) {
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal WHERE patch_id = ? ORDER BY created_at DESC',
    patchId,
  );
}

export function getJournalEntry(db: SQLiteDatabase, id: string) {
  return db.getFirstAsync<JournalEntry>('SELECT * FROM journal WHERE id = ?', id);
}

export function updateJournalEntry(db: SQLiteDatabase, id: string, body: string) {
  return db.runAsync('UPDATE journal SET body = ? WHERE id = ?', body, id);
}

export function deleteJournalEntry(db: SQLiteDatabase, id: string) {
  return db.runAsync('DELETE FROM journal WHERE id = ?', id);
}

export async function getYearSightingsCount(db: SQLiteDatabase, patchId: string, year: number) {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ?`,
    patchId, String(year),
  );
  return row?.count ?? 0;
}

export async function getAllTimeSightingsCount(db: SQLiteDatabase, patchId: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sightings WHERE patch_id = ?',
    patchId,
  );
  return row?.count ?? 0;
}

export async function getYearJournalCount(db: SQLiteDatabase, patchId: string, year: number) {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM journal WHERE patch_id = ? AND strftime('%Y', created_at) = ?`,
    patchId, String(year),
  );
  return row?.count ?? 0;
}

export async function getAllTimeJournalCount(db: SQLiteDatabase, patchId: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM journal WHERE patch_id = ?',
    patchId,
  );
  return row?.count ?? 0;
}

export async function getMonthJournalCount(db: SQLiteDatabase, patchId: string, year: number, month: number): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM journal WHERE patch_id = ? AND strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?`,
    patchId, String(year), String(month).padStart(2, '0'),
  );
  return row?.count ?? 0;
}

export async function getYearSpeciesList(db: SQLiteDatabase, patchId: string, year: number) {
  const rows = await db.getAllAsync<{ species: string }>(
    `SELECT DISTINCT species FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ?`,
    patchId, String(year),
  );
  return rows.map(r => r.species);
}

export function getAllPatches(db: SQLiteDatabase): Promise<Patch[]> {
  return db.getAllAsync<Patch>('SELECT * FROM patches ORDER BY created_at ASC');
}

export function getAllSightings(db: SQLiteDatabase): Promise<Sighting[]> {
  return db.getAllAsync<Sighting>('SELECT * FROM sightings ORDER BY seen_at ASC');
}

export function getAllJournalEntries(db: SQLiteDatabase): Promise<JournalEntry[]> {
  return db.getAllAsync<JournalEntry>('SELECT * FROM journal ORDER BY created_at ASC');
}

export async function getMonthSpeciesCount(db: SQLiteDatabase, patchId: string, year: number, month: number): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT species) as count FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ? AND strftime('%m', seen_at) = ?`,
    patchId, String(year), String(month).padStart(2, '0'),
  );
  return row?.count ?? 0;
}

export async function getMonthSpeciesList(db: SQLiteDatabase, patchId: string, year: number, month: number): Promise<string[]> {
  const rows = await db.getAllAsync<{ species: string }>(
    `SELECT DISTINCT species FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ? AND strftime('%m', seen_at) = ? ORDER BY species`,
    patchId, String(year), String(month).padStart(2, '0'),
  );
  return rows.map(r => r.species);
}

export async function getLastVisit(db: SQLiteDatabase, patchId: string): Promise<{ date: string; speciesCount: number } | null> {
  const row = await db.getFirstAsync<{ visit_date: string; species_count: number }>(
    `SELECT date(seen_at, 'localtime') as visit_date, COUNT(DISTINCT species) as species_count
     FROM sightings
     WHERE patch_id = ? AND date(seen_at, 'localtime') < date('now', 'localtime')
     GROUP BY visit_date
     ORDER BY visit_date DESC
     LIMIT 1`,
    patchId,
  );
  if (!row) return null;
  return { date: row.visit_date, speciesCount: row.species_count };
}
