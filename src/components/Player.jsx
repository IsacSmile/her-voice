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

    if (isPlaying)
      audio.play().catch(() => console.log("User interaction required"));
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
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const src =
    track.url instanceof Blob ? URL.createObjectURL(track.url) : track.url;

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




{/* Text Progress (FUC*) */}
<div
  className="text-progress-wrapper"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
    margin: "10px 0 0 0",
  }}
>
  <span className="progress-time">{formatTime(currentTime)}</span>

  <svg
    viewBox="0 0 400 150"
    width="50%"
    height="50"
    style={{ display: "block", cursor: "pointer" }}
    onClick={(e) => {
      const bbox = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - bbox.left;
      const percent = Math.min(Math.max(clickX / bbox.width, 0), 1);
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }}
  >
    <defs>
      <clipPath id="text-clip">
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="80"
          fontFamily="'Bimbo Pro', cursive"
          textLength="360"
          lengthAdjust="spacingAndGlyphs"
        >
          FuckYou
        </text>
      </clipPath>
    </defs>

    {/* Base milky white text */}
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="80"
      fontFamily="'Bimbo Pro', cursive"
      textLength="360"
      lengthAdjust="spacingAndGlyphs"
      fill="#f8f8f8"
      style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.25))" }}
    >
      FuckYou
    </text>

    {/* Red progress fill */}
    <rect
      x="20"
      y="35"
      width={(progress / 100) * 360}  // dynamically fill width
      height="80"
      fill="#ff3b5c"
      clipPath="url(#text-clip)"
      style={{ transition: "width 0.3s linear" }}
    />
  </svg>

  <span className="progress-time">{formatTime(duration)}</span>
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
