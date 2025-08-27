const DB_NAME = "music-player-db";
// 1. INCREMENT THE DATABASE VERSION
const DB_VERSION = 2; 
const STORE_NAME = "tracks";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    // 2. THIS LOGIC NOW RUNS AGAIN BECAUSE THE VERSION CHANGED
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      
      // Delete the old version of the store if it exists
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      
      // Create a fresh, correct version of the store
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
  });
}

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

export async function deleteTrack(trackId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(trackId);
    request.onsuccess = () => {
      console.log(`🗑️ Deleted track with ID '${trackId}' from IndexedDB`);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

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

export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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