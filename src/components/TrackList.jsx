import React, { useState } from "react";

export default function TrackList({ tracks, currentIndex, onPlayTrack, onDeleteTrack }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);

  const openSheet = (e, index) => {
    e.stopPropagation();
    setSelectedTrackIndex(index);
    setClosing(false);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setClosing(true);
    setTimeout(() => {
      setSheetOpen(false);
      setSelectedTrackIndex(null);
    }, 300);
  };

  const handleDeleteClick = () => {
    if (selectedTrackIndex !== null) {
      onDeleteTrack(selectedTrackIndex);
    }
    closeSheet();
  };

  return (
    <div className="track-list">
      {tracks.map((track, i) => (
        <div
          key={track.id || track.name + i} // Use track.id if available, fallback for default tracks
          className={`track-item-list ${i === currentIndex ? "active" : ""}`}
          onClick={() => onPlayTrack(i)}
        >
          <span className="track-name">{track.name}</span>
          <button className="dots-btn" onClick={(e) => openSheet(e, i)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      ))}

      {sheetOpen && (
        <div className={`overlay ${closing ? "closing" : "open"}`} onClick={closeSheet}>
          <div className={`bottom-sheet ${closing ? "closing" : "open"}`} onClick={(e) => e.stopPropagation()}>
            <div className="sheet-content">
              <div className="sheet-title">Track Options</div>
              <button>ℹ️ Info (Feature on the way!)</button>
              <button onClick={handleDeleteClick}>🗑️ Delete</button>
              <button className="close-btn" onClick={closeSheet}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}