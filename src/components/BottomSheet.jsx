import React, { useState, useEffect } from 'react';
import '../index.css';

export default function BottomSheet({
  isOpen,
  onClose,
  track,
  onDelete,
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Wait for the animation to complete before removing the component
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // This duration must match your CSS animation time
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDeleteClick = () => {
    onDelete(track);
    onClose(); // Tell the parent to start closing
  };
  
  // If the component shouldn't be rendered, return null to remove it
  if (!shouldRender) {
    return null;
  }

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
          <button className="sheet-button" onClick={() => alert('Song Info feature coming soon!')}>ℹ️ Info</button>
          <button className="sheet-button" onClick={() => alert('Add to Favorites feature coming soon!')}>❤️ Add to Favorites</button>
          <button className="sheet-button" onClick={() => alert('Add to Wishlist feature coming soon!')}>🌟 Add to Wishlist</button>
          <button className="sheet-button delete" onClick={handleDeleteClick}>🗑️ Delete</button>
          <button className="sheet-button close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}