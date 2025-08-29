// src/utils/db.js

const DB_NAME = "music-player-db";
const STORE_STATE = "appState";
const STORE_TRACKS = "tracks";

// Open database and create stores if needed
function openDB() {
  return new Promise((resolve, reject) => {
    // IMPORTANT: Keep version = 7 (matches your existing DB)
    const req = indexedDB.open(DB_NAME, 7);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- STATE HELPERS ----------
export async function saveState(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, "readwrite");
    tx.objectStore(STORE_STATE).put({ key, value });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadState(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, "readonly");
    const req = tx.objectStore(STORE_STATE).get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

// ---------- TRACK HELPERS ----------
export async function saveTrack(track) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readwrite");
    tx.objectStore(STORE_TRACKS).put(track);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllTracks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readonly");
    const req = tx.objectStore(STORE_TRACKS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTrack(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, "readwrite");
    tx.objectStore(STORE_TRACKS).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- WISHLIST ----------
export async function saveWishlist(items) {
  await saveState("wishlist", items);
}
export async function loadWishlist() {
  return (await loadState("wishlist")) || [];
}

// ---------- FAVORITES ----------
export async function saveFavorites(items) {
  await saveState("favorites", items);
}
export async function loadFavorites() {
  return (await loadState("favorites")) || [];
}

// ---------- RECENTLY PLAYED ----------
export async function saveRecentlyPlayed(items) {
  await saveState("recentlyPlayed", items);
}
export async function loadRecentlyPlayed() {
  return (await loadState("recentlyPlayed")) || [];
}
