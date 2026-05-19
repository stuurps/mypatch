import { createMockDb } from '../helpers/mockDb';
import {
  initDatabase,
  insertJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
} from '@/db/database';
import type { JournalEntry } from '@/db/database';

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'entry-1',
    patch_id: 'patch-1',
    body: 'Heard a cuckoo calling from the east hedge.',
    created_at: '2026-05-01T08:30:00.000Z',
    ...overrides,
  };
}

describe('journal DB helpers', () => {
  let db: ReturnType<typeof createMockDb>;

  beforeEach(async () => {
    db = createMockDb();
    await initDatabase(db);
  });

  it('stores the body you wrote', async () => {
    const entry = makeEntry();
    await insertJournalEntry(db, entry);
    const entries = await getJournalEntries(db, entry.patch_id);
    expect(entries[0].body).toBe(entry.body);
  });

  it('gives each entry a unique id', async () => {
    await insertJournalEntry(db, makeEntry({ id: 'id-1', created_at: '2026-05-01T08:00:00.000Z' }));
    await insertJournalEntry(db, makeEntry({ id: 'id-2', created_at: '2026-05-02T08:00:00.000Z' }));
    const entries = await getJournalEntries(db, 'patch-1');
    const ids = entries.map(e => e.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('returns entries newest first', async () => {
    await insertJournalEntry(db, makeEntry({ id: 'id-1', body: 'First morning out.', created_at: '2026-04-01T07:00:00.000Z' }));
    await insertJournalEntry(db, makeEntry({ id: 'id-2', body: 'Swifts arrived today.', created_at: '2026-05-10T09:00:00.000Z' }));
    const entries = await getJournalEntries(db, 'patch-1');
    expect(entries[0].body).toBe('Swifts arrived today.');
    expect(entries[1].body).toBe('First morning out.');
  });

  it('only returns entries for your patch', async () => {
    await insertJournalEntry(db, makeEntry({ id: 'id-1', patch_id: 'patch-1' }));
    await insertJournalEntry(db, makeEntry({ id: 'id-2', patch_id: 'patch-2' }));
    const entries = await getJournalEntries(db, 'patch-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('id-1');
  });

  it('returns nothing for a new patch', async () => {
    const entries = await getJournalEntries(db, 'empty-patch');
    expect(entries).toHaveLength(0);
  });

  it('updating an entry changes only the body', async () => {
    const entry = makeEntry();
    await insertJournalEntry(db, entry);
    await updateJournalEntry(db, entry.id, 'Spotted a kingfisher on the way back.');
    const entries = await getJournalEntries(db, entry.patch_id);
    expect(entries[0].body).toBe('Spotted a kingfisher on the way back.');
    expect(entries[0].patch_id).toBe(entry.patch_id);
    expect(entries[0].created_at).toBe(entry.created_at);
  });

  it('deleting an entry removes it completely', async () => {
    const entry = makeEntry();
    await insertJournalEntry(db, entry);
    await deleteJournalEntry(db, entry.id);
    const entries = await getJournalEntries(db, entry.patch_id);
    expect(entries).toHaveLength(0);
  });

  it('deleting one entry leaves others intact', async () => {
    await insertJournalEntry(db, makeEntry({ id: 'id-1', created_at: '2026-05-01T08:00:00.000Z' }));
    await insertJournalEntry(db, makeEntry({ id: 'id-2', created_at: '2026-05-02T08:00:00.000Z' }));
    await deleteJournalEntry(db, 'id-1');
    const entries = await getJournalEntries(db, 'patch-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('id-2');
  });
});
