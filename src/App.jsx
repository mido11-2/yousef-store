import { useEffect, useMemo, useState } from "react";
import "./App.css";
import games from "./data/games";

import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import GameCard from "./components/GameCard";
import AdminDashboard from "./components/AdminDashboard";
import { getGames, isSupabaseConfigured, supabase } from "./lib/supabaseRest";

function Storefront() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [storeGames, setStoreGames] = useState(games);
  const [selectedGames, setSelectedGames] = useState([]);
  const [showBulkOrderOptions, setShowBulkOrderOptions] = useState(false);

  const toggleSelectedGame = (game) => {
    setSelectedGames((current) =>
      current.some((item) => String(item.id ?? item.name) === String(game.id ?? game.name))
        ? current.filter((item) => String(item.id ?? item.name) !== String(game.id ?? game.name))
        : [...current, game]
    );
  };

const sendBulkOrder = (phone, contactName) => {
  if (!selectedGames.length) return;

  const gameList = selectedGames
    .map((game, index) => `${index + 1}. ${game.name}`)
    .join("\n");

const message = `السلام عليكم يا ${contactName}،
عايز أطلب الألعاب دي:
${gameList}`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
  setShowBulkOrderOptions(false);
};

useEffect(() => {
  if (!isSupabaseConfigured) return;

  let active = true;
  let refreshInProgress = false;

  const refreshGames = async () => {
    if (refreshInProgress) return;
    refreshInProgress = true;

    try {
      const rows = await getGames();
      if (!active || !Array.isArray(rows)) return;

      const supabaseGames = rows
        .map((g) => ({
          ...g,
          whatsappOptions: g.whatsapp_options || g.whatsappOptions || [],
        }))
        .filter((g) => g.is_visible !== false)
        .sort((a, b) => {
          const orderA = Number(a.sort_order) || 0;
          const orderB = Number(b.sort_order) || 0;
          return orderA - orderB || String(a.name || "").localeCompare(String(b.name || ""));
        });

      setStoreGames(supabaseGames);
    } catch (error) {
      console.error("Supabase games error:", error);
    } finally {
      refreshInProgress = false;
    }
  };

  // Load on entry, then refresh when the visitor returns to the tab.
  refreshGames();
  const onFocus = () => refreshGames();
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") refreshGames();
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Live updates when Supabase Realtime is enabled for the games table.
  const channel = supabase
    .channel("storefront-games-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "games" }, refreshGames)
    .subscribe();

  // Fallback polling in case Realtime is not enabled on the table.
  const intervalId = window.setInterval(() => {
    if (document.visibilityState === "visible") refreshGames();
  }, 10000);

  return () => {
    active = false;
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.clearInterval(intervalId);
    supabase.removeChannel(channel);
  };
}, []);

  const categories = useMemo(() => {
    const values = [
      ...new Set(storeGames.map((game) => game.category).filter(Boolean)),
    ];
    return ["الكل", ...values];
  }, [storeGames]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return storeGames.filter((game) => {
      const matchesSearch =
        !query || String(game.name || "").toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "الكل" || game.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [storeGames, search, activeCategory]);

  const scrollToGames = () => {
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app" dir="rtl">
      <Header search={search} setSearch={setSearch} onBrowse={scrollToGames} />

      <main>
        <section className="hero" aria-label="Yousef Store">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              مكتبة ألعاب PS4
            </span>

            <h2>
              لعبتك الجاية
              <span> مستنياك 🎮</span>
            </h2>

            <p>
              اختار لعبتك، شوف التفاصيل، واطلبها مباشرة من خلال WhatsApp.
              تجربة بسيطة وسريعة من أول البحث لحد الطلب.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={scrollToGames}>
                تصفح الألعاب <span>←</span>
              </button>
              <div className="hero-trust">
                <strong>{storeGames.length}+</strong>
                <span>لعبة متاحة</span>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="controller">
              <span className="controller-cross">✦</span>
              <span className="controller-dot controller-dot-one" />
              <span className="controller-dot controller-dot-two" />
              <span className="controller-line" />
            </div>
          </div>
        </section>

        

        <section className="catalog-section" id="games">
          <div className="catalog-heading">
            <div>
              <span className="section-kicker">GAME LIBRARY</span>
              <h2>كل الألعاب</h2>
            </div>
            <span className="results-count">{filteredGames.length} لعبة</span>
          </div>

          <FilterBar
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          <div className="games-grid">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id ?? game.name}
                game={game}
                isSelected={selectedGames.some(
                  (item) => String(item.id ?? item.name) === String(game.id ?? game.name)
                )}
                onToggleSelection={() => toggleSelectedGame(game)}
              />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="empty-state">
              <div>🔎</div>
              <h3>مش لاقيين اللعبة دي</h3>
              <p>جرّب اسم تاني أو اختار تصنيف مختلف.</p>
              <button
                className="primary-btn"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("الكل");
                }}
              >
                عرض كل الألعاب
              </button>
            </div>
          )}
        </section>
      </main>

      {selectedGames.length > 0 && (
        <div className="bulk-order-bar" dir="rtl">
          <div className="bulk-order-summary">
            <strong>🛒 {selectedGames.length} لعبة مختارة</strong>
            <button
              type="button"
              className="bulk-clear-btn"
              onClick={() => {
                setSelectedGames([]);
                setShowBulkOrderOptions(false);
              }}
            >
              إلغاء الاختيار
            </button>
          </div>
          <button
            type="button"
            className="bulk-order-btn"
            onClick={() => setShowBulkOrderOptions((value) => !value)}
            aria-expanded={showBulkOrderOptions}
          >
            إرسال الطلب عبر WhatsApp
          </button>
          {showBulkOrderOptions && (
            <div className="bulk-order-options">
              <div className="bulk-order-options-title">اختار الشخص اللي هتبعتله الطلب</div>
              <button type="button" onClick={() => sendBulkOrder("201026797229", "ميدو")}>
                <span>✆</span>
                 ميدو 
              </button>
              <button type="button" onClick={() => sendBulkOrder("201555371568", "يوسف")}>
                <span>✆</span>
                 يوسف 
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-logo">🎮</div>
          <div>
            <strong>Yousef Store</strong>
            <span>Premium PS4 Games Library</span>
          </div>
        </div>

        <div className="footer-note">
          <span>⚡</span>
          اختار لعبتك واطلبها بسهولة عبر WhatsApp
        </div>

        <div className="footer-bottom">
          <span>© 2026 Yousef Store</span>
          <a href="https://wa.me/201555371568">تواصل معنا</a>
        </div>
      </footer>

      <button
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="العودة للأعلى"
      >
        ↑
      </button>
    </div>
  );
}

function App() {
  const [admin, setAdmin] = useState(window.location.pathname === "/admin");

  useEffect(() => {
    const onPop = () => setAdmin(window.location.pathname === "/admin");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const back = () => {
    window.history.pushState({}, "", "/");
    setAdmin(false);
    window.scrollTo(0, 0);
  };

  return admin ? <AdminDashboard onBack={back} /> : <Storefront />;
}

export default App;
