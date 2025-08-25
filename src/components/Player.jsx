// src/components/Player.jsx
import React, { useRef, useEffect } from "react";
import "../index.css"; // import global styles

export default function Player({
  track,
  isPlaying,
  onNext,
  onPrev,
  togglePlay,
  currentTime,
  duration,
  onSeek,
  setDuration,
  setCurrentTime,
}) {
  const audioRef = useRef(null);

  // Play/pause audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => console.log("User interaction required"));
    else audio.pause();
  }, [isPlaying, track]);

  // Update time & duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));

    return () => audio.removeEventListener("timeupdate", updateTime);
  }, [track, setCurrentTime, setDuration]);

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="second_part">
      <p className="now-playing-main">
        <span className="now-playing-title">Playing:</span> {track.name}
      </p>

      <audio ref={audioRef} src={track.url} onEnded={onNext} />

      <div className="progress-container" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <span>{formatTime(currentTime)}</span>
        <input
          className="range"
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={onSeek}
          style={{ flex: 1 }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="controler" style={{ marginTop: 10 }}>
        <button onClick={onPrev}>⏮️</button>
        <button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
        <button onClick={onNext}>⏭️</button>
      </div>
    </div>
  );
}
