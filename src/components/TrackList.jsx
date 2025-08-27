import React, { useState } from "react";

export default function TrackList({ tracks, currentIndex, onPlayTrack }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const openSheet = (e) => {
    e.stopPropagation(); // prevent triggering play
    setClosing(false);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setClosing(true);
    setTimeout(() => setSheetOpen(false), 300); // wait for animation
  };

  return (
    <div className="track-list">
      {tracks.map((track, i) => (
        <div
          key={track.name}
          className={`track-item-list ${i === currentIndex ? "active" : ""}`}
          onClick={() => onPlayTrack(i)}
        >
          <span className="track-name">{track.name}</span>
          <button className="dots-btn" onClick={openSheet}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      ))}

      {sheetOpen && (
        <div
          className={`overlay ${closing ? "closing" : "open"}`}
          onClick={closeSheet}
        >
          <div
            className={`bottom-sheet ${closing ? "closing" : "open"}`}
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            <div className="sheet-content">
              <div className="sheet-title">Track Options</div>
              <button>▶️ Play Next</button>
              <button>ℹ️ Info</button>
              <button>🗑️ Delete</button>
              <button className="close-btn" onClick={closeSheet}>
                F* Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
