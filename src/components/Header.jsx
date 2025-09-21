import React, { useEffect, useRef } from 'react';
import '../index.css';
import { IoSearch } from "react-icons/io5";

export default function Header({
  message,
  onMenuClick,
  searchQuery,
  setSearchQuery,
  isSelectMode,
  toggleSelectMode,
  onDeleteSelected,
  onSelectAll,
  selectedCount,
  isSearchVisible,
  setIsSearchVisible,
  currentView,
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  const getTitle = (view) => {
    switch(view) {
      case 'favorites': return 'Favorites';
      case 'wishlist': return 'Wishlist';
      case 'recent': return 'Recently Played';
      default: return 'Be Happy 💞';
    }
  };

  return (
    <header className="app-header">
      <div className="header-top-row">
        <button onClick={onMenuClick} className="hamburger-btn">☰</button>
        <h2 className="tittle">{getTitle(currentView)}</h2>
        <button onClick={() => setIsSearchVisible(true)} className="search-icon-btn"><IoSearch />
</button>

        <div className={`search-overlay ${isSearchVisible ? 'visible' : ''}`}>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input-expanded"
            placeholder="Search only local songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => setIsSearchVisible(false)} className="close-search-btn">✖</button>
        </div>
      </div>

      {isSelectMode && (
        <div className="selection-controls">
          <button onClick={onSelectAll} className="control-button">Select All</button>
          <button onClick={onDeleteSelected} className="control-button delete" disabled={selectedCount === 0}>Delete ({selectedCount})</button>
          <button onClick={toggleSelectMode} className="control-button cancel">Cancel</button>
        </div>
      )}

      {message && (
        <p className={`status-msg ${message.type}`}>{message.text}</p>
      )}
    </header>
  );
}
