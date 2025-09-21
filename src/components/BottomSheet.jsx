import React, { useState, useEffect } from 'react';
import '../index.css';


export default function BottomSheet({
  isOpen,
  onClose,
  track,
  onDelete,
  onToggleFavorite,
  onToggleWishlist,
  isFavorite,
  isWishlisted,
  onAddToPlaylist,
  currentView,
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
  
  const handleDeleteClick = () => {
    onDelete(track);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className={`overlay ${isOpen ? 'show' : 'closing'}`} onClick={onClose}>
      <div
        className={`bottom-sheet ${isOpen ? 'open' : 'closing'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <span className="sheet-track-name">{track?.name}</span>
        </div>
        <div className="sheet-content">
          <button className="sheet-button" onClick={onAddToPlaylist}>➕ Add to Playlist</button>
          <button className="sheet-button" onClick={() => onToggleFavorite(track.id)}>
            {isFavorite ? '❤️ Remove from Favorites' : '♡ Add to Favorites'}
          </button>
          <button className="sheet-button" onClick={() => onToggleWishlist(track.id)}>
            {isWishlisted ? '🌟 Remove from Wishlist' : '☆ Add to Wishlist'}
          </button>
          <button className="sheet-button delete" onClick={handleDeleteClick}>
            {currentView.startsWith('playlist_') ? '🗑️ Remove from Playlist' : '<RiDeleteBin5Line /> Delete Song'}
          </button>
          <button className="sheet-button close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
