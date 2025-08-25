import React from "react";
import { truncateName } from "../utils/format";
import "../index.css"; // ✅ import global CSS

export default function TrackList({ tracks, currentIndex, onPlayTrack }) {
  return (
    <ul className="track-list">
      {tracks.map((t, i) => (
        <li
          key={t.name}
          className={`track-item ${i === currentIndex ? "active" : ""}`}
          onClick={() => onPlayTrack(i)}
        >
          {truncateName(t.name)}
        </li>
      ))}
    </ul>
  );
}
