import { useState } from "react";

function GameCard({ game, isSelected = false, onToggleSelection = () => {} }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showImage, setShowImage] = useState(false);

  return (
    <>
      <article className="card">
        <div
          className="card-image"
          onClick={() => setShowImage(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setShowImage(true);
          }}
          aria-label={`تكبير صورة ${game.name}`}
        >
          <img loading="lazy" src={game.image} alt={game.name} />
          <div className="image-overlay" />
        </div>

        <button
          type="button"
          className={`game-select-btn${isSelected ? " selected" : ""}`}
          onClick={onToggleSelection}
          aria-pressed={isSelected}
          aria-label={isSelected ? `إلغاء اختيار ${game.name}` : `اختيار ${game.name}`}
        >
          <span className="game-select-check">{isSelected ? "✓" : "+"}</span>
          {isSelected ? "تم" : "اطلب"}
        </button>

        <div className="card-content">
          <div className="card-title-row">
            <h2 className="game-title">{game.name}</h2>
            <span className="category">{game.category}</span>
          </div>

          <div className="card-divider" />

          
        </div>
      </article>

      {showImage && (
        <div
          className="image-modal"
          onClick={() => setShowImage(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`صورة ${game.name}`}
        >
          <button
            className="image-modal-close"
            onClick={() => setShowImage(false)}
            aria-label="إغلاق الصورة"
          >
            ×
          </button>

          <img
            src={game.image}
            alt={game.name}
            className="image-modal-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default GameCard;
