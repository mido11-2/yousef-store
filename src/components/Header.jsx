function Header({ search, setSearch }) {
  return (
    <header className="header">
      <div>
        <h1>🎮 Yousef Store</h1>
        <p>PS4 Game Library</p>
      </div>

      <input
        className="search"
        type="text"
        placeholder="🔍 Search for a PS4 game..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </header>
  );
}

export default Header;