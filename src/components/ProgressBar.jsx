import React from "react";
import { formatTime } from "../utils/format";

export default function ProgressBar({ currentTime, duration, onSeek }) {
  return (
    <div className="progress">
      <span>{formatTime(currentTime)}</span>
      <input
        className="range"
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={onSeek}
      />
      <span>{formatTime(duration)}</span>
    </div>
  );
}
