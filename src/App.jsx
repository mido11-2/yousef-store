import { useState } from "react";
import "./App.css";
import games from "./data/games";

import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import GameCard from "./components/GameCard";

function App() {
  const [search, setSearch] = useState("");

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <Header search={search} setSearch={setSearch} />


      <FilterBar />

      <div className="games-grid">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      <footer className="footer">
  <h3>Yousef Store</h3>

  <p>🎮 Premium PS4 Games Library</p>

  <p>⚡ Instant Delivery • Weekly Updates</p>

  <p>© 2026 Yousef Store</p>

  <div className="footer-social">
    <a href="https://wa.me/201555371568">💬</a>
    <a href="#">📘</a>
    <a href="#">📸</a>
    <a href="#">🎵</a>
  </div>
</footer>

<button
  className="scroll-top"
  onClick={() =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
>
  ↑
</button>
    </div>
  );
}

export default App;