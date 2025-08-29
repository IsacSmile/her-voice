import React from 'react';
import '../index.css';

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  playlists,
  onSelectPlaylist,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add to Playlist</h3>
        <ul className="playlist-selection-list">
          {playlists.length > 0 ? (
            playlists.map(playlist => (
              <li key={playlist.id} onClick={() => onSelectPlaylist(playlist.id)}>
                {playlist.name}
              </li>
            ))
          ) : (
            <p className="no-playlists-text">You haven't created any playlists yet.</p>
          )}
        </ul>
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-button cancel full-width">Close</button>
        </div>
      </div>
    </div>
  );
}
