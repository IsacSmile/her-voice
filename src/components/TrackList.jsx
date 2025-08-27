import React from "react";

export default function TrackList({ tracks, currentIndex, onPlayTrack }) {
  return (
    <div className="track-list">
      {tracks.map((track, i) => (
        <div
          key={track.name}
          className={`track-item ${i === currentIndex ? "active" : ""}`}
          onClick={() => onPlayTrack(i)}
          title={track.name} // tooltip shows full name on hover
        >
          <span className="track-name">{track.name}</span>
        </div>
      ))}
    </div>
  );
}
