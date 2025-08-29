import React, { useState, useEffect } from 'react';
import '../index.css';

export default function SideMenu({
  isOpen,
  onClose,
  onSelectMode,
  onNavigate,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelectClick = () => {
    onSelectMode();
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'show' : 'closing'}`} onClick={onClose} />
      <nav className={`side-menu ${isOpen ? 'open' : 'closing'}`}>
        <button onClick={onClose} className="close-menu-btn">✖</button>
        <ul>
          <li><button className="menu-item" onClick={() => onNavigate('all')}>All Songs</button></li>
          <li><label htmlFor="file-upload" className="menu-item" onClick={onClose}>Add Your Desired Song</label></li>
          <li><button className="menu-item" onClick={() => onNavigate('wishlist')}>Wishlist</button></li>
          <li><button className="menu-item" onClick={() => onNavigate('recent')}>Recently Played</button></li>
          <li><button className="menu-item" onClick={() => onNavigate('favorites')}>Favorite Songs</button></li>
          <li><button className="menu-item" onClick={handleSelectClick}>Multiselect to Delete</button></li>
        </ul>
        <div className="playlist-section">
          <h4 className="playlist-title">Playlists</h4>
          <button className="menu-item create-playlist" onClick={() => { onCreatePlaylist(); onClose(); }}>
            + Create New Playlist
          </button>
          {playlists.map(playlist => (
            <li key={playlist.id} className="playlist-item-container">
              <button className="menu-item playlist-item" onClick={() => onNavigate(playlist.id)}>
                {playlist.name}
              </button>
              <button className="delete-playlist-btn" onClick={() => onDeletePlaylist(playlist.id)}>
                🗑️
              </button>
            </li>
          ))}
        </div>
      </nav>
    </>
  );
}
