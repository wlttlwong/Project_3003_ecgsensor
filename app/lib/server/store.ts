import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { SessionRecord } from "../../types/session";
import type { UserProfile } from "../../types/user";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession extends SessionRecord {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseShape {
  users: StoredUser[];
  profiles: UserProfile[];
  sessions: StoredSession[];
}

const DB_PATH = path.join(process.cwd(), "data", "demo-db.json");
const EMPTY_DB: DatabaseShape = {
  users: [],
  profiles: [],
  sessions: [],
};

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDatabaseFile(): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

async function loadDatabase(): Promise<DatabaseShape> {
  await ensureDatabaseFile();
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DatabaseShape>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function saveDatabase(db: DatabaseShape): Promise<void> {
  await ensureDatabaseFile();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function readDatabase(): Promise<DatabaseShape> {
  return loadDatabase();
}

export async function mutateDatabase<T>(
  mutator: (db: DatabaseShape) => T | Promise<T>
): Promise<T> {
  let result!: T;
  const task = writeQueue.then(async () => {
    const db = await loadDatabase();
    result = await mutator(db);
    await saveDatabase(db);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return result;
}
