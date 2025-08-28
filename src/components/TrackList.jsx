import React from "react";

export default function TrackList({
  tracks,
  currentIndex,
  onPlayTrack,
  isSelectMode,
  selectedTracks,
  onSelectTrack,
  onOpenSheet // New prop to open the bottom sheet
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
        const isSelected = selectedTracks.includes(track.id);
        return (
          <div
            key={track.id || track.name + i}
            className={`
              track-item-list 
              ${i === currentIndex && !isSelectMode ? "active" : ""}
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
            {/* Show dots button only when not in select mode */}
            {!isSelectMode && (
              <button className="dots-btn" onClick={(e) => {
                  e.stopPropagation(); // Prevent track from playing
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