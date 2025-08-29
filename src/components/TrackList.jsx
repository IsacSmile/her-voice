import React from "react";
import '../index.css';

export default function TrackList({
  tracks,
  currentIndex,
  onPlayTrack,
  isSelectMode,
  selectedTracks = [],
  onSelectTrack,
  onOpenSheet
}) {
  const handleClick = (track, index) => {
    if (isSelectMode) {
      onSelectTrack(track.id);
    } else {
      onPlayTrack(index);
    }
  };

  return (
    <div className="track-list">
      {tracks.map((track, i) => {
        const isSelected = Array.isArray(selectedTracks) && selectedTracks.includes(track.id);

        return (
          <div
            key={track.id || track.name + i}
            className={`
              track-item-list 
              ${currentIndex === i && !isSelectMode ? "active" : ""}
              ${isSelectMode ? "selectable" : ""}
              ${isSelected ? "selected" : ""}
            `}
            onClick={() => handleClick(track, i)}
          >
            {isSelectMode && (
              <div className="checkbox">
                {isSelected && <div className="checkmark">✔</div>}
              </div>
            )}
            <span className="track-name">{track.name}</span>
            {!isSelectMode && (
              <button className="dots-btn" onClick={(e) => {
                  e.stopPropagation();
                  onOpenSheet(track);
                }}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
