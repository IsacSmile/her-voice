import React, { useEffect, useRef } from 'react';
import '../index.css';

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
  setIsSearchVisible
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Automatically focus the input when it becomes visible
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  return (
    <header className="app-header">
      <div className="header-top-row">
        <button onClick={onMenuClick} className="hamburger-btn">☰</button>
        <h2 className="tittle">Her_Voicee 💞</h2>
        <button onClick={() => setIsSearchVisible(true)} className="search-icon-btn">🔍</button>

        {/* This is the search bar that overlaps */}
        <div className={`search-overlay ${isSearchVisible ? 'visible' : ''}`}>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input-expanded"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => setIsSearchVisible(false)} className="close-search-btn">✖</button>
        </div>
      </div>

      {isSelectMode && (
        <div className="selection-controls">
          <button onClick={onSelectAll} className="control-button">
            Select All
          </button>
          <button
            onClick={onDeleteSelected}
            className="control-button delete"
            disabled={selectedCount === 0}
          >
            Delete ({selectedCount})
          </button>
          <button onClick={toggleSelectMode} className="control-button cancel">
            Cancel
          </button>
        </div>
      )}

      {message && (
        <p className={`status-msg ${message.type}`}>
          {message.text}
        </p>
      )}
    </header>
  );
}