const DB_NAME = "music-player-db";
const DB_VERSION = 1;
const STORE_NAME = "tracks";

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "name" });
      }
    };
  });
}

// Save multiple tracks to IndexedDB
export async function saveTracks(tracks) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    tracks.forEach(track => store.put(track));

    tx.oncomplete = () => {
      console.log("💾 Saved tracks to IndexedDB");
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

// Get all tracks from IndexedDB
export async function getTracks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Clear all tracks in IndexedDB
export async function clearTracksDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      console.log("🗑️ Cleared tracks in IndexedDB");
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// --- localStorage for lightweight session state ---
export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`💾 Saved ${key} in localStorage`);
  } catch (err) {
    console.warn("⚠️ Failed to save state:", err);
  }
}

export function getState(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : undefined;
  } catch (err) {
    console.warn("⚠️ Failed to get state:", err);
    return undefined;
  }
}
