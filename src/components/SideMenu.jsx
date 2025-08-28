import React, { useState, useEffect } from 'react';
import '../index.css';

export default function SideMenu({
  isOpen,
  onClose,
  onSelectMode,
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

  const handleSelectClick = () => {
    onSelectMode();
    onClose();
  };
  
  // If the component shouldn't be rendered, return null to remove it
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div
        className={`menu-overlay ${isOpen ? 'show' : 'closing'}`}
        onClick={onClose}
      />
      <nav className={`side-menu ${isOpen ? 'open' : 'closing'}`}>
        <button onClick={onClose} className="close-menu-btn">✖</button>
        <ul>
          <li><label htmlFor="file-upload" className="menu-item" onClick={onClose}>Add Your Desired Song</label></li>
          <li><button className="menu-item" onClick={() => alert('Wishlist feature coming soon!')}>Wishlist</button></li>
          <li><button className="menu-item" onClick={() => alert('Create Playlist feature coming soon!')}>Create Your Own Playlist</button></li>
          <li><button className="menu-item" onClick={() => alert('Recently Played feature coming soon!')}>Recently Played</button></li>
          <li><button className="menu-item" onClick={() => alert('Favorite Songs feature coming soon!')}>Favorite Songs</button></li>
          <li><button className="menu-item" onClick={handleSelectClick}>Multiselect to Delete</button></li>
        </ul>
      </nav>
    </>
  );
}