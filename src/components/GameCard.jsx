import { useState } from "react";

function GameCard({ game }) {
  const [favorite, setFavorite] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="card fade-card">

      <div className="card-image">

        {game.isNew && (
          <span className="badge">🔥 NEW</span>
        )}

        <img src={game.image} alt={game.name} />

        <div className="image-overlay"></div>

        <button
          className={`fav-btn ${favorite ? "active" : ""}`}
          onClick={() => setFavorite(!favorite)}
        >
          ❤
        </button>

      </div>

      <div className="card-content">

        <h2>{game.name}</h2>

        <div className="rating">
          ⭐⭐⭐⭐⭐
        </div>

        <div className="game-info">

          <span className="platform">
            🎮 {game.platform}
          </span>

          <span className="category">
            {game.category}
          </span>

        </div>

        <div className="order-wrapper">

          <button
            className="buy-btn"
            onClick={() => setShowOptions(!showOptions)}
          >
            🛒 اطلب الآن
          </button>

          {showOptions && (

            <div className="order-menu">

              {game.whatsappOptions.map((option, index) => (

                <a
                  key={index}
                  href={option.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="order-option"
                  onClick={() => setShowOptions(false)}
                >
                  {option.label}
                </a>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default GameCard;