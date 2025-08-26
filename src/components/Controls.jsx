import React from "react";

export default function Controls({
  isPlaying,
  onPlay,
  onNext,
  onPrev,
  onLoop,
  isLooping,
}) {
  return (
    <div className="controler">
      <button onClick={onPrev} title="Previous">⏮️</button>
      <button onClick={onPlay} title="Play / Pause">
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <button onClick={onNext} title="Next">⏭️</button>
      <button
        onClick={onLoop}
        className={`loop-btn ${isLooping ? "active" : ""}`}
        title="Toggle Loop"
      >
        🔁
      </button>
    </div>
  );
}
