import BetterSQLite from 'better-sqlite3';
import type { SQLiteDatabase } from 'expo-sqlite';

export function createMockDb(): SQLiteDatabase {
  const sqlite = new BetterSQLite(':memory:');

  return {
    execAsync: async (sql: string) => {
      sqlite.exec(sql);
    },
    runAsync: async (sql: string, ...params: (string | number | null | boolean)[]) => {
      const stmt = sqlite.prepare(sql);
      stmt.run(...params);
      return { lastInsertRowId: 0, changes: 0 } as never;
    },
    getFirstAsync: async <T>(sql: string, ...params: (string | number | null | boolean)[]): Promise<T | null> => {
      const stmt = sqlite.prepare(sql);
      return (stmt.get(...params) as T) ?? null;
    },
    getAllAsync: async <T>(sql: string, ...params: (string | number | null | boolean)[]): Promise<T[]> => {
      const stmt = sqlite.prepare(sql);
      return stmt.all(...params) as T[];
    },
  } as unknown as SQLiteDatabase;
}
