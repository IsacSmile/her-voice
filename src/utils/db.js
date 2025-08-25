import { openDB } from "idb";

const DB_NAME = "herVoiceDB";
const STORE_NAME = "appState";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveState(key, value) {
  const db = await getDB();
  await db.put(STORE_NAME, value, key);
}

export async function getState(key) {
  const db = await getDB();
  return await db.get(STORE_NAME, key);
}

export async function clearState(key) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}
