function Header({ search, setSearch }) {
  return (
    <header className="header">
      <div className="header-info">
        <h1>🎮 <span>Yousef Store</span></h1>
        <p>Premium PS4 Games Library</p>
      </div>

      <div className="search-box">
        <input
          className="search"
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </header>
  );
}

export default Header;