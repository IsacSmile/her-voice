import React, { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "../index.css";
import { saveState } from "../utils/db";

export default function ReloadPrompt({ currentIndex, queue, isPlaying } = {}) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Optional: periodic checks if registration available
      if (registration) {
        setInterval(() => registration.update(), 30000);
      }
    },
    onRegisterError(err) {
      console.error("SW registration error:", err);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onOfflineReady() {
      // nothing necessary here
    },
  });

  const [dismissed, setDismissed] = useState(false);

  if ((!needRefresh && !offlineReady) || dismissed) return null;

  const handleUpdate = async () => {
    try {
      await saveState("currentIndex", currentIndex);
      await saveState("queue", queue);
      await saveState("isPlaying", isPlaying);
    } catch (err) {
      console.warn("Failed to save state before update:", err);
    }
    updateServiceWorker(true);
  };

  const handleLater = () => {
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
