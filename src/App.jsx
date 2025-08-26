// src/App.jsx
import React, { useState, useCallback, useEffect } from "react";
import "./index.css";
import { defaultTracks } from "./data";
import Header from "./components/Header";
import Player from "./components/Player";
import TrackList from "./components/TrackList";
import ReloadPrompt from "./components/ReloadPrompt";
import { getState } from "./utils/db";

export default function App() {
  const [tracks, setTracks] = useState(defaultTracks);
  const [queue, setQueue] = useState(defaultTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  // Restore last session state from IndexedDB
  useEffect(() => {
    async function restore() {
      const savedIndex = await getState("currentIndex");
      const savedQueue = await getState("queue");
      const savedPlaying = await getState("isPlaying");

      if (savedQueue) setQueue(savedQueue);
      if (savedIndex !== undefined) setCurrentIndex(savedIndex);
      if (savedPlaying !== undefined) setIsPlaying(savedPlaying);
    }
    restore();
  }, []);

  // --- Playback Controls ---
  const playNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev + 1 < queue.length ? prev + 1 : isLooping ? 0 : prev
    );
    setIsPlaying(true);
  }, [queue, isLooping]);

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : isLooping ? queue.length - 1 : prev
    );
    setIsPlaying(true);
  }, [queue, isLooping]);

  const toggleLoop = () => setIsLooping((prev) => !prev);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    const audioEl = document.querySelector("audio");
    if (audioEl) audioEl.currentTime = newTime;
  };

  // --- File Upload ---
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    const newTracks = await Promise.all(
      files
        .filter((f) => !tracks.some((t) => t.name === f.name))
        .map(async (f) => ({ name: f.name, url: await fileToBase64(f) }))
    );

    if (newTracks.length) {
      setTracks((prev) => [...prev, ...newTracks]);
      setQueue((prev) => [...prev, ...newTracks]);
      setMessage(`${newTracks.length} file(s) added ✅`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="main-parent">
      <div className="sub-container">
        <Header onFiles={handleFiles} message={message} />

        {queue.length > 0 && (
          <Player
            track={queue[currentIndex]}
            isPlaying={isPlaying}
            onNext={playNext}
            onPrev={playPrev}
            togglePlay={togglePlay}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            setDuration={setDuration}
            setCurrentTime={setCurrentTime}
            onLoop={toggleLoop}
            isLooping={isLooping}
          />
        )}

        <TrackList
          tracks={tracks}
          currentIndex={currentIndex}
          onPlayTrack={(i) => {
            setCurrentIndex(i);
            setIsPlaying(true);
          }}
        />
      </div>

      <ReloadPrompt
        currentIndex={currentIndex}
        queue={queue}
        isPlaying={isPlaying}
      />
    </div>
  );
}
