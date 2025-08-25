import React from "react";

export default function Controls({ isPlaying, onPlay, onNext, onPrev }) {
  return (
    <div className="controler">
      <button onClick={onPrev}>⏮️</button>
      <button onClick={onPlay}>{isPlaying ? "⏸️" : "▶️"}</button>
      <button onClick={onNext}>⏯️</button>
    </div>
  );
}
