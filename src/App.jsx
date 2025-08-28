import React, { useState, useCallback, useEffect } from "react";
import "./index.css";
import { defaultTracks } from "./data";
import Header from "./components/Header";
import Player from "./components/Player";
import TrackList from "./components/TrackList";
import ReloadPrompt from "./components/ReloadPrompt";
import SideMenu from "./components/SideMenu";
import BottomSheet from "./components/BottomSheet"; // Import the new component
import { getState, saveState, getTracks, saveTracks, deleteTrack } from "./utils/db";

const generateUniqueId = () => `track_${Date.now()}_${Math.random()}`;
const DELETED_DEFAULTS_KEY = 'deletedDefaultIds';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // New state for the bottom sheet menu
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState(null);

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
    const filesToAdd = files.filter(file => !tracks.some(track => track.name === file.name));
    if (files.length > 0 && filesToAdd.length === 0) {
      setMessage({ text: "That song is already in your playlist.", type: 'delete' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const newTracks = await Promise.all(
      filesToAdd.map(async (f) => {
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
      setMessage({ text: `${validTracks.length} file(s) added ✅`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedTracks([]);
  };

  const handleSelectTrack = (trackId) => {
    setSelectedTracks(prevSelected =>
      prevSelected.includes(trackId)
        ? prevSelected.filter(id => id !== trackId)
        : [...prevSelected, trackId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTracks.length === filteredTracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(filteredTracks.map(track => track.id));
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedTracks.length === 0) return;
    const currentTrackId = queue[currentIndex]?.id;
    if (selectedTracks.includes(currentTrackId)) {
      setIsPlaying(false);
    }
    const tracksToDelete = queue.filter(track => selectedTracks.includes(track.id));
    const defaultTracksToDelete = tracksToDelete.filter(t => t.id.startsWith('default-'));
    const userTracksToDelete = tracksToDelete.filter(t => !t.id.startsWith('default-'));
    const newQueue = queue.filter(track => !selectedTracks.includes(track.id));
    setQueue(newQueue);
    setTracks(newQueue);
    if (defaultTracksToDelete.length > 0) {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
      const newDeletedIds = [...deletedIds, ...defaultTracksToDelete.map(t => t.id)];
      localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(newDeletedIds));
    }
    if (userTracksToDelete.length > 0) {
      for (const track of userTracksToDelete) {
        try {
          await deleteTrack(track.id);
        } catch (err) {
          console.error("Failed to delete track from DB:", err);
        }
      }
    }
    setMessage({ text: `${selectedTracks.length} song(s) deleted.`, type: 'delete' });
    setTimeout(() => setMessage(null), 3000);
    setIsSelectMode(false);
    setSelectedTracks([]);
  };
  
  // New function for single track deletion from bottom sheet
  const handleSingleDelete = async (trackToDelete) => {
    if (!trackToDelete) return;
    if (queue[currentIndex]?.id === trackToDelete.id) {
      setIsPlaying(false);
    }
    const newQueue = queue.filter(track => track.id !== trackToDelete.id);
    setQueue(newQueue);
    setTracks(newQueue);

    if (trackToDelete.id.startsWith('default-')) {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
      const newDeletedIds = [...deletedIds, trackToDelete.id];
      localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(newDeletedIds));
    } else {
      try {
        await deleteTrack(trackToDelete.id);
      } catch (err) {
        console.error("Failed to delete track from DB:", err);
      }
    }
    setMessage({ text: 'Deleted.', type: 'delete' });
    setTimeout(() => setMessage(null), 3000);
  };

  // New functions to open and close the bottom sheet
  const openSheetForTrack = (track) => {
    setSelectedTrackForMenu(track);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedTrackForMenu(null);
  };

  const filteredTracks = queue.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-parent">
      <input type="file" id="file-upload" accept="audio/*" multiple onChange={handleFiles} className="file-input" />
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onSelectMode={toggleSelectMode} />
      <div className="sub-container">
        <Header
          message={message}
          onMenuClick={() => setIsMenuOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSelectMode={isSelectMode}
          toggleSelectMode={toggleSelectMode}
          onDeleteSelected={handleMultipleDelete}
          onSelectAll={handleSelectAll}
          selectedCount={selectedTracks.length}
          isSearchVisible={isSearchVisible}
          setIsSearchVisible={setIsSearchVisible}
        />
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
          tracks={filteredTracks}
          currentIndex={currentIndex}
          onPlayTrack={(i) => {
            const trackToPlay = filteredTracks[i];
            const originalIndex = queue.findIndex(t => t.id === trackToPlay.id);
            if (originalIndex !== -1) {
              setCurrentIndex(originalIndex);
              setIsPlaying(true);
            }
          }}
          isSelectMode={isSelectMode}
          selectedTracks={selectedTracks}
          onSelectTrack={handleSelectTrack}
          onOpenSheet={openSheetForTrack} // Pass the function to open the sheet
        />
      </div>
      <ReloadPrompt currentIndex={currentIndex} queue={queue} isPlaying={isPlaying} />
      <BottomSheet 
        isOpen={isSheetOpen}
        onClose={closeSheet}
        track={selectedTrackForMenu}
        onDelete={handleSingleDelete}
      />
    </div>
  );
}