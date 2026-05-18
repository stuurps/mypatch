import type { SQLiteDatabase } from 'expo-sqlite';

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
  `);
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

export function insertSighting(db: SQLiteDatabase, sighting: Sighting) {
  return db.runAsync(
    'INSERT INTO sightings (id, patch_id, species, count, notes, seen_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    sighting.id, sighting.patch_id, sighting.species, sighting.count,
    sighting.notes ?? null, sighting.seen_at, sighting.created_at,
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

export async function hasSpeciesBeenLogged(db: SQLiteDatabase, patchId: string, species: string) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sightings WHERE patch_id = ? AND species = ?',
    patchId, species,
  );
  return (row?.count ?? 0) > 0;
}

export async function getYearSpeciesList(db: SQLiteDatabase, patchId: string, year: number) {
  const rows = await db.getAllAsync<{ species: string }>(
    `SELECT DISTINCT species FROM sightings WHERE patch_id = ? AND strftime('%Y', seen_at) = ?`,
    patchId, String(year),
  );
  return rows.map(r => r.species);
}
