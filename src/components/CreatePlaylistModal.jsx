import React, { useState } from 'react';
import '../index.css';

export default function CreatePlaylistModal({ isOpen, onClose, onCreate }) {
  const [playlistName, setPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (playlistName.trim()) {
      onCreate(playlistName.trim());
      setPlaylistName('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Playlist</h3>
        <input
          type="text"
          placeholder="My Awesome Playlist"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="playlist-name-input"
          autoFocus
        />
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button cancel">Cancel</button>
          <button onClick={handleCreate} className="modal-button create">Create</button>
        </div>
      </div>
    </div>
  );
}
