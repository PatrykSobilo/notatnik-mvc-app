import React, { useState, useEffect } from "react";

function SearchArea({ onSearch, onClear }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debouncing - opóźnione wyszukiwanie po przestaniu pisania
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        onClear();
      }
    }, 500); // 500ms opóźnienia

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      await onSearch(searchQuery.trim());
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onClear();
  };

  return (
    <div className="search-area">
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Wyszukaj notatki..."
          className="search-input"
        />
        <div className="search-buttons">
          {searchQuery && (
            <button 
              type="button" 
              onClick={handleClear}
              className="clear-btn"
              title="Wyczyść wyszukiwanie"
            >
              ✕
            </button>
          )}
          {isSearching && (
            <span className="search-loader">🔍</span>
          )}
        </div>
      </div>
      {searchQuery && (
        <div className="search-info">
          Wyszukiwanie: "{searchQuery}"
        </div>
      )}
    </div>
  );
}

export default SearchArea;
