import React, { useState, useCallback, useEffect } from "react";
import "./index.css";
import { defaultTracks } from "./data";
import Header from "./components/Header";
import Player from "./components/Player";
import TrackList from "./components/TrackList";
import ReloadPrompt from "./components/ReloadPrompt";
import { getState, saveState, getTracks, saveTracks } from "./utils/db";

export default function App() {
  const [tracks, setTracks] = useState(defaultTracks); // all tracks
  const [queue, setQueue] = useState(defaultTracks);   // playback queue
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  // Restore tracks & playback state
  useEffect(() => {
    async function restore() {
      try {
        const savedTracks = await getTracks();
        const combinedTracks = [...defaultTracks, ...savedTracks];
        if (combinedTracks.length) {
          setTracks(combinedTracks);
          setQueue(combinedTracks);
        }

        const savedIndex = await getState("currentIndex");
        const savedPlaying = await getState("isPlaying");

        if (savedIndex !== undefined && savedIndex < combinedTracks.length)
          setCurrentIndex(savedIndex);
        if (savedPlaying !== undefined) setIsPlaying(savedPlaying);
      } catch (err) {
        console.warn("⚠️ Error restoring state:", err);
      }
    }
    restore();
  }, []);

  // Save session state (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveState("currentIndex", currentIndex);
      saveState("isPlaying", isPlaying);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  // Reset currentIndex if queue shrinks
  useEffect(() => {
    if (currentIndex >= queue.length) setCurrentIndex(0);
  }, [queue, currentIndex]);

  // --- Playback Controls ---
  const playNext = useCallback(() => {
    setCurrentIndex(prev =>
      prev + 1 < queue.length ? prev + 1 : isLooping ? 0 : prev
    );
    setIsPlaying(true);
  }, [queue, isLooping]);

  const playPrev = useCallback(() => {
    setCurrentIndex(prev =>
      prev - 1 >= 0 ? prev - 1 : isLooping ? queue.length - 1 : prev
    );
    setIsPlaying(true);
  }, [queue, isLooping]);

  const toggleLoop = () => setIsLooping(prev => !prev);
  const togglePlay = () => setIsPlaying(prev => !prev);

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
        .filter(f => !tracks.some(t => t.name === f.name))
        .map(async f => {
          const url = await fileToBase64(f);
          if (!url) return null;
          return { name: f.name, url };
        })
    );

    const validTracks = newTracks.filter(Boolean);
    if (validTracks.length) {
      setTracks(prev => [...prev, ...validTracks]);
      setQueue(prev => [...prev, ...validTracks]);
      await saveTracks(validTracks); // IndexedDB only
      setMessage(`${validTracks.length} file(s) added ✅`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="main-parent">
      <div className="sub-container">
        <Header onFiles={handleFiles} message={message} />

        {queue.length > 0 && queue[currentIndex] && (
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
          tracks={queue} // use queue here
          currentIndex={currentIndex}
          onPlayTrack={(i) => {
            if (queue[i] && queue[i].url) {
              setCurrentIndex(i);
              setIsPlaying(true);
            }
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
