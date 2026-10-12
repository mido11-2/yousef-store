import { useState } from "react";
import { createPortal } from "react-dom";

function Header({ search, setSearch, onBrowse }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const mobileSearch = typeof document !== "undefined"
    ? createPortal(
        <>
          <button
            type="button"
            className="mobile-search-trigger"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? "×" : "⌕"}
          </button>

          {searchOpen && (
            <div className="floating-search-panel" dir="rtl">
              <input
                className="search"
                type="search"
                placeholder="ابحث عن لعبة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="البحث عن لعبة"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="مسح البحث"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </>,
        document.body
      )
    : null;

  return (
    <header className="header">
      <button className="brand" onClick={onBrowse} aria-label="Yousef Store">
        <span className="brand-mark">🎮</span>
        <span className="brand-copy">
          <strong>Yousef Store</strong>
          <small>PLAY • CHOOSE • ENJOY</small>
        </span>
      </button>

      <nav className="header-nav" aria-label="التنقل">
        <button onClick={onBrowse}>الألعاب</button>
        <a href="#contact">تواصل</a>
      </nav>

      <label className="search-box desktop-search-box">
        <span className="search-icon">⌕</span>
        <input
          className="search"
          type="search"
          placeholder="ابحث عن لعبة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="البحث عن لعبة"
        />
        {search && (
          <button
            type="button"
            className="clear-search"
            onClick={() => setSearch("")}
            aria-label="مسح البحث"
          >
            ×
          </button>
        )}
      </label>

      {mobileSearch}
    </header>
  );
}

export default Header;
