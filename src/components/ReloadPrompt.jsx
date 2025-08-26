import React, { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import "../index.css"; // global CSS
import { saveState } from "../utils/db";

export default function ReloadPrompt({ currentIndex, queue, isPlaying }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered: (r) => console.log("SW registered:", r),
    onRegisterError: (err) => console.log("SW registration error:", err),
  });

  const [dismissed, setDismissed] = useState(false);

  if (!needRefresh || dismissed) return null;

  const handleUpdate = async () => {
    // Save current state before reloading
    await saveState("currentIndex", currentIndex);
    await saveState("queue", queue);
    await saveState("isPlaying", isPlaying);

    updateServiceWorker(true);
  };

  const handleLater = () => {
    setDismissed(true);
    setNeedRefresh(false);
  };

  return (
    <div className="reload-overlay">
      <div className="reload-prompt">
        <span className="reload-text">🔄 New version available</span>
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
