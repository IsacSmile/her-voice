import React, { useState, useCallback, useEffect } from "react";
import "./index.css";
import { defaultTracks } from "./data";
import Header from "./components/Header";
import Player from "./components/Player";
import TrackList from "./components/TrackList";
import ReloadPrompt from "./components/ReloadPrompt";
import { getState, saveState, getTracks, saveTracks, deleteTrack } from "./utils/db";

const generateUniqueId = () => `track_${Date.now()}_${Math.random()}`;

const DELETED_DEFAULTS_KEY = 'deletedDefaultIds';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // The message state is now initialized to null
  const [message, setMessage] = useState(null); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  // No changes needed in the useEffect hooks or playback controls...
  useEffect(() => {
    async function restore() {
      try {
        const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
        const activeDefaultTracks = defaultTracks.filter(track => !deletedIds.includes(track.id));
        const savedTracks = await getTracks();
        const combinedTracks = [...activeDefaultTracks, ...savedTracks];

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

  useEffect(() => {
    const timer = setTimeout(() => {
      saveState("currentIndex", currentIndex);
      saveState("isPlaying", isPlaying);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (currentIndex >= queue.length && queue.length > 0) {
      setCurrentIndex(0);
    }
  }, [queue, currentIndex]);

  const playNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1 < queue.length ? prev + 1 : isLooping ? 0 : prev));
    setIsPlaying(true);
  }, [queue, isLooping]);

  const playPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 >= 0 ? prev - 1 : isLooping ? queue.length - 1 : prev));
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
      files.map(async (f) => {
        const url = await fileToBase64(f);
        if (!url) return null;
        return { id: generateUniqueId(), name: f.name, url };
      })
    );
    const validTracks = newTracks.filter(Boolean);
    if (validTracks.length) {
      setTracks(prev => [...prev, ...validTracks]);
      setQueue(prev => [...prev, ...validTracks]);
      await saveTracks(validTracks);
      // CHANGED: Set message as an object with type 'success'
      setMessage({ text: `${validTracks.length} file(s) added ✅`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteTrack = async (indexToDelete) => {
    const trackToDelete = queue[indexToDelete];
    if (!trackToDelete) return;

    if (indexToDelete === currentIndex) {
      setIsPlaying(false);
    }
    if (indexToDelete < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
    
    const isDefaultTrack = trackToDelete.id && trackToDelete.id.startsWith('default-');

    const newQueue = queue.filter(track => track.id !== trackToDelete.id);
    const newTracks = tracks.filter(t => t.id !== trackToDelete.id);
    setQueue(newQueue);
    setTracks(newTracks);

    if (isDefaultTrack) {
        const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
        if (!deletedIds.includes(trackToDelete.id)) {
            const newDeletedIds = [...deletedIds, trackToDelete.id];
            localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(newDeletedIds));
        }
    } else {
      try {
        await deleteTrack(trackToDelete.id);
      } catch (err) {
        console.error("Failed to delete track from DB:", err);
      }
    }
    
    // CHANGED: Set message as an object with type 'delete'
    setMessage({ text: 'Deleted!', type: 'delete' });
    setTimeout(() => setMessage(null), 3000);
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
          tracks={queue}
          currentIndex={currentIndex}
          onPlayTrack={(i) => {
            if (queue[i] && queue[i].url) {
              setCurrentIndex(i);
              setIsPlaying(true);
            }
          }}
          onDeleteTrack={handleDeleteTrack}
        />
      </div>
      <ReloadPrompt currentIndex={currentIndex} queue={queue} isPlaying={isPlaying} />
    </div>
  );
}