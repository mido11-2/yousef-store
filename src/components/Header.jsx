function Header({ search, setSearch }) {
  return (
    <header className="header">
      <div className="header-info">
        <h1>🎮 <span>Yousef Store</span></h1>
        
      </div>

      <div className="search-box">
        <div className="search-box">
  <span className="search-icon">🔍</span>

  <input
    className="search"
    type="text"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>
      </div>
    </header>
  );
}

export default Header;