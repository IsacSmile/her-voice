import React, { useState, useCallback, useEffect } from "react";
import "./index.css";
import { defaultTracks } from "./data";
import Header from "./components/Header";
import Player from "./components/Player";
import TrackList from "./components/TrackList";
import ReloadPrompt from "./components/ReloadPrompt";
import SideMenu from "./components/SideMenu";
import BottomSheet from "./components/BottomSheet";
import CreatePlaylistModal from "./components/CreatePlaylistModal";
import AddToPlaylistModal from "./components/AddToPlaylistModal";
import { 
  saveState, loadState, getAllTracks, saveTrack, deleteTrack,
  saveWishlist, loadWishlist, saveFavorites, loadFavorites,
  saveRecentlyPlayed, loadRecentlyPlayed
} from "./utils/db.js";

const generateUniqueId = () => `track_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
const generatePlaylistId = () => `playlist_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState(null);
  
  // Feature States
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentView, setCurrentView] = useState('all');
  
  // Modal States
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);

  // Restore saved state once on startup and validate IDs
  useEffect(() => {
    async function restore() {
      try {
        const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
        const activeDefaultTracks = defaultTracks.filter(track => !deletedIds.includes(track.id));
        const savedTracks = await getAllTracks();
        const combinedTracks = [...activeDefaultTracks, ...savedTracks];

        if (combinedTracks.length) {
          setTracks(combinedTracks);
          setQueue(combinedTracks);
        }

        const savedIndex = await loadState("currentIndex");
        if (savedIndex !== null && Number.isFinite(savedIndex) && savedIndex < combinedTracks.length) {
          setCurrentIndex(savedIndex);
        } else if (combinedTracks.length > 0) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(-1);
        }

        const playingState = await loadState("isPlaying");
        setIsPlaying(!!playingState);

        // Validate IDs
        const existingIds = new Set(combinedTracks.map(t => t.id));

        // Load from IndexedDB
        const wl = await loadWishlist();
        setWishlist((wl || []).filter(id => existingIds.has(id)));

        const fav = await loadFavorites();
        setFavorites((fav || []).filter(id => existingIds.has(id)));

        const rec = await loadRecentlyPlayed();
        setRecentlyPlayed((rec || []).filter(id => existingIds.has(id)));

        const savedPlaylists = (await loadState('playlists')) || [];
        const validatedPlaylists = (savedPlaylists || []).map(pl => ({
          ...pl,
          trackIds: (pl.trackIds || []).filter(id => existingIds.has(id))
        }));
        setPlaylists(validatedPlaylists);

      } catch (err) {
        console.error("Restore error:", err);
        setTracks(defaultTracks);
        setQueue(defaultTracks);
        setFavorites([]);
        setWishlist([]);
        setRecentlyPlayed([]);
        setPlaylists([]);
      }
    }
    restore();
  }, []);

  // Persist small pieces of state when they update
  useEffect(() => { saveState("currentIndex", currentIndex); }, [currentIndex]);
  useEffect(() => { saveState("isPlaying", isPlaying); }, [isPlaying]);

  // Persist favorites, wishlist, recentlyPlayed into IndexedDB
  useEffect(() => { saveFavorites(favorites); }, [favorites]);
  useEffect(() => { saveWishlist(wishlist); }, [wishlist]);
  useEffect(() => { saveRecentlyPlayed(recentlyPlayed); }, [recentlyPlayed]);

  useEffect(() => { saveState('playlists', playlists); }, [playlists]);

  useEffect(() => {
    if (isPlaying && currentIndex > -1 && queue[currentIndex]) {
      const currentTrackId = queue[currentIndex].id;
      setRecentlyPlayed(prev => {
        const arr = [currentTrackId, ...prev.filter(id => id !== currentTrackId)];
        return arr.slice(0, 50);
      });
    }
  }, [isPlaying, currentIndex, queue]);

  const playNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1 < queue.length ? prev + 1 : isLooping ? 0 : prev));
    setIsPlaying(true);
  }, [queue.length, isLooping]);

  const playPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 >= 0 ? prev - 1 : isLooping ? queue.length - 1 : prev));
    setIsPlaying(true);
  }, [queue.length, isLooping]);

  const toggleLoop = () => setIsLooping(p => !p);
  const togglePlay = () => setIsPlaying(p => !p);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    const filesToAdd = files.filter(file => !tracks.some(track => track.name === file.name));
    if (files.length > 0 && filesToAdd.length === 0) {
      setMessage({ text: "Song already exists.", type: 'delete' });
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
      for (const track of validTracks) {
        await saveTrack(track);
      }
      setMessage({ text: `${validTracks.length} song(s) added.`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
    e.target.value = "";
  };

  const getDisplayedTracks = () => {
    let list;
    if (typeof currentView === 'string' && currentView.startsWith('playlist_')) {
      const playlistId = currentView;
      const playlist = playlists.find(p => p.id === playlistId);
      list = playlist ? playlist.trackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean) : [];
    } else {
      switch (currentView) {
        case 'favorites': list = tracks.filter(t => favorites.includes(t.id)); break;
        case 'wishlist': list = tracks.filter(t => wishlist.includes(t.id)); break;
        case 'recent': list = recentlyPlayed.map(id => tracks.find(t => t.id === id)).filter(Boolean); break;
        default: list = queue;
      }
    }
    return list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };
  const displayedTracks = getDisplayedTracks();

  const handleSelectAll = () => setSelectedTracks(p => p.length === displayedTracks.length ? [] : displayedTracks.map(t => t.id));
  const toggleSelectMode = () => {
    setIsSelectMode(p => !p);
    setSelectedTracks([]);
  };
  const handleSelectTrack = (trackId) => setSelectedTracks(p => p.includes(trackId) ? p.filter(id => id !== trackId) : [...p, trackId]);

  const removeTracksById = async (idsToRemove) => {
    if (idsToRemove.includes(queue[currentIndex]?.id)) setIsPlaying(false);
    const tracksToDelete = tracks.filter(t => idsToRemove.includes(t.id));
    const defaultTracksToDelete = tracksToDelete.filter(t => t.id.startsWith('default-'));
    const userTracksToDelete = tracksToDelete.filter(t => !t.id.startsWith('default-'));
    
    setQueue(p => p.filter(t => !idsToRemove.includes(t.id)));
    setTracks(p => p.filter(t => !idsToRemove.includes(t.id)));

    if (defaultTracksToDelete.length > 0) {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_DEFAULTS_KEY)) || [];
      const newDeletedIds = [...new Set([...deletedIds, ...defaultTracksToDelete.map(t => t.id)])];
      localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(newDeletedIds));
    }
    if (userTracksToDelete.length > 0) {
      for (const track of userTracksToDelete) {
        try { await deleteTrack(track.id); } 
        catch (err) { console.error("DB delete error:", err); }
      }
    }
  };

  const handleMultipleDelete = async () => {
    if (selectedTracks.length === 0) return;
    await removeTracksById(selectedTracks);
    setMessage({ text: `${selectedTracks.length} song(s) deleted.`, type: 'delete' });
    setTimeout(() => setMessage(null), 3000);
    setIsSelectMode(false);
    setSelectedTracks([]);
  };

  const handleSingleDelete = async (trackToDelete) => {
    if (!trackToDelete) return;
    if (typeof currentView === 'string' && currentView.startsWith('playlist_')) {
      const playlistId = currentView;
      setPlaylists(p => p.map(pl => pl.id === playlistId ? { ...pl, trackIds: pl.trackIds.filter(id => id !== trackToDelete.id) } : pl));
      setMessage({ text: `Removed from playlist.`, type: 'delete' });
    } else {
      await removeTracksById([trackToDelete.id]);
      setMessage({ text: 'Deleted.', type: 'delete' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const openSheetForTrack = (track) => { setSelectedTrackForMenu(track); setIsSheetOpen(true); };
  const closeSheet = () => setIsSheetOpen(false);
  const toggleFavorite = (trackId) => setFavorites(p => p.includes(trackId) ? p.filter(id => id !== trackId) : [trackId, ...p]);
  const toggleWishlist = (trackId) => setWishlist(p => p.includes(trackId) ? p.filter(id => id !== trackId) : [trackId, ...p]);
  const handleNavigate = (view) => { setCurrentView(view); setIsMenuOpen(false); };
  
  const handleCreatePlaylist = (name) => {
    const newPlaylist = { id: generatePlaylistId(), name, trackIds: [] };
    setPlaylists(p => [...p, newPlaylist]);
    setIsCreatePlaylistModalOpen(false);
  };
  
  const handleDeletePlaylist = (playlistId) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setPlaylists(p => p.filter(pl => pl.id !== playlistId));
      if (currentView === playlistId) setCurrentView('all');
    }
  };
  
  const addTrackToPlaylist = (playlistId) => {
    if (!selectedTrackForMenu) return;
    const trackId = selectedTrackForMenu.id;
    setPlaylists(p => p.map(pl => pl.id === playlistId && !pl.trackIds.includes(trackId) ? { ...pl, trackIds: [trackId, ...pl.trackIds] } : pl));
    setMessage({ text: `Added to playlist.`, type: 'success' });
    setTimeout(() => setMessage(null), 2000);
    setIsAddToPlaylistModalOpen(false);
  };

  return (
    <div className="main-parent">
      <input type="file" id="file-upload" accept="audio/*" multiple onChange={handleFiles} className="file-input" />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectMode={toggleSelectMode}
        onNavigate={handleNavigate}
        playlists={playlists}
        onCreatePlaylist={() => setIsCreatePlaylistModalOpen(true)}
        onDeletePlaylist={handleDeletePlaylist}
      />
      <CreatePlaylistModal 
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        playlists={playlists}
        onSelectPlaylist={addTrackToPlaylist}
      />
      <div className="sub-container">
        <Header
          message={message} onMenuClick={() => setIsMenuOpen(true)}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          isSelectMode={isSelectMode} toggleSelectMode={toggleSelectMode}
          onDeleteSelected={handleMultipleDelete} onSelectAll={handleSelectAll}
          selectedCount={selectedTracks.length} isSearchVisible={isSearchVisible}
          setIsSearchVisible={setIsSearchVisible} currentView={currentView} playlists={playlists}
        />
        {queue.length > 0 && currentIndex > -1 && queue[currentIndex] && (
          <Player
            key={queue[currentIndex].id}
            track={queue[currentIndex]}
            isPlaying={isPlaying}
            onNext={playNext}
            onPrev={playPrev}
            togglePlay={togglePlay}
            currentTime={currentTime}
            duration={duration}
            setCurrentTime={setCurrentTime}
            setDuration={setDuration}
            onLoop={toggleLoop}
            isLooping={isLooping}
          />
        )}
        <TrackList
          tracks={displayedTracks}
          currentIndex={queue.findIndex(t => t?.id === (queue[currentIndex]?.id))}
          onPlayTrack={(i) => {
            const trackToPlay = displayedTracks[i];
            const originalIndex = queue.findIndex(t => t.id === trackToPlay.id);
            if (originalIndex !== -1) {
              setCurrentIndex(originalIndex);
              setIsPlaying(true);
            }
          }}
          isSelectMode={isSelectMode}
          selectedTracks={selectedTracks}
          onSelectTrack={handleSelectTrack}
          onOpenSheet={openSheetForTrack}
        />
      </div>
      <ReloadPrompt currentIndex={currentIndex} queue={queue} isPlaying={isPlaying} />
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        track={selectedTrackForMenu}
        onDelete={handleSingleDelete}
        onToggleFavorite={toggleFavorite}
        onToggleWishlist={toggleWishlist}
        isFavorite={favorites.includes(selectedTrackForMenu?.id)}
        isWishlisted={wishlist.includes(selectedTrackForMenu?.id)}
        onAddToPlaylist={() => { setIsAddToPlaylistModalOpen(true); closeSheet(); }}
        currentView={currentView}
      />
    </div>
  );
}
