function FilterBar({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className="filter-bar" role="tablist" aria-label="تصنيفات الألعاب">
      {categories.map((category) => (
        <button
          key={category}
          className={`filter-btn ${
            activeCategory === category ? "active" : ""
          }`}
          onClick={() => setActiveCategory(category)}
          role="tab"
          aria-selected={activeCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
