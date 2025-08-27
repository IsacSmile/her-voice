import React, { useRef, useEffect } from "react";
import "../index.css";

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
  onLoop,
  isLooping,
}) {
  const audioRef = useRef(null);

  // Play/pause
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
    const setMeta = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, [track, setCurrentTime, setDuration]);

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const src = track.url instanceof Blob ? URL.createObjectURL(track.url) : track.url;

  // Heart progress calculation
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e) => {
    const bbox = e.target.getBoundingClientRect();
    const clickX = e.clientX - bbox.left;
    const percent = Math.min(Math.max(clickX / bbox.width, 0), 1);
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="second_part">
      {/* Fixed "Playing:" + scrolling track name */}
      <div className="now-playing-main">
        <span className="now-playing-label">Playing: </span>
        <div className="marquee">
          <span>{track?.name || "No Track"}</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} onEnded={onNext} loop={isLooping} />

      {/* Heart-shaped Progress */}
<div className="heart-progress-wrapper">
  <span>{formatTime(currentTime)}</span>
  <svg
    viewBox="0 0 100 100"
    className="heart-progress"
    onClick={handleSeek}
  >
    {/* Background Path (soft glowing white outline) */}
    <path
      d="M10,30 
         A20,20 0,0,1 50,30 
         A20,20 0,0,1 90,30 
         Q90,60 50,90 
         Q10,60 10,30 Z"
      fill="none"
      stroke="rgba(255,255,255,0.9)"  // more white
      strokeWidth="9"
      style={{
        filter: "drop-shadow(0px 0px 6px rgba(255,255,255,0.8))"
      }}
    />
    {/* Progress Path (smooth soft red) */}
    <path
      d="M10,30 
         A20,20 0,0,1 50,30 
         A20,20 0,0,1 90,30 
         Q90,60 50,90 
         Q10,60 10,30 Z"
      fill="none"
      stroke="#ff3b5c"
      strokeWidth="9"
      strokeDasharray="250"
      strokeDashoffset={250 - (progress / 100) * 250}
      strokeLinecap="round"
      style={{
        transition: "stroke-dashoffset 0.4s ease",
        filter: "drop-shadow(0px 0px 4px rgba(255,59,92,0.7))"
      }}
    />
  </svg>
  <span>{formatTime(duration)}</span>
</div>


      {/* Controls */}
      <div className="controler" style={{ marginTop: 10 }}>
        <button onClick={onPrev}>⏮️</button>
        <button onClick={togglePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
        <button onClick={onNext}>⏭️</button>
        <button
          onClick={onLoop}
          className={`loop-btn ${isLooping ? "active" : ""}`}
          title="Toggle Loop"
        >
          {isLooping ? "🔂" : "🔁"}
        </button>
      </div>
    </div>
  );
}
