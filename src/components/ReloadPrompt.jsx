// src/components/ReloadPrompt.jsx
import React, { useState, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "../index.css";
import { saveState } from "../utils/db";

export default function ReloadPrompt({ currentIndex, queue, isPlaying }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log("✅ SW registered at:", swUrl);

      if (registration) {
        console.log("🔁 Setting periodic SW update check (every 30s)...");
        setInterval(() => {
          console.log("🔍 Checking for updates...");
          registration.update();
        }, 30000);
      }
    },
    onRegisterError(err) {
      console.error("❌ SW registration error:", err);
    },
    onNeedRefresh() {
      console.log("🚨 New version detected → needRefresh = true");
    },
    onOfflineReady() {
      console.log("📦 App ready to work offline");
    },
  });

  const [dismissed, setDismissed] = useState(false);

  if ((!needRefresh && !offlineReady) || dismissed) return null;

  const handleUpdate = async () => {
    try {
      console.log("💾 Saving playback state before update...");
      await saveState("currentIndex", currentIndex);
      await saveState("queue", queue);
      await saveState("isPlaying", isPlaying);
    } catch (err) {
      console.warn("⚠️ Failed to save state before update:", err);
    }

    console.log("🔄 Updating service worker & reloading...");
    updateServiceWorker(true);
  };

  const handleLater = () => {
    console.log("⏸️ User chose Later, dismissing prompt");
    setDismissed(true);
    setNeedRefresh(false);
  };

  return (
    <div className="reload-overlay">
      <div className="reload-prompt">
        <span className="reload-text">🔄 A new version is available</span>
        <div className="reload-buttons">
          <button className="reload-btn" onClick={handleUpdate}>
            Update
          </button>
          <button className="reload-later-btn" onClick={handleLater}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
