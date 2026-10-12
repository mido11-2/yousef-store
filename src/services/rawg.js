const API_KEY = import.meta.env.VITE_RAWG_API_KEY;

export async function getGame(name) {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(name)}&page_size=10`
    );

    const data = await response.json();

    if (!data.results) return null;

    const game = data.results.find(
      (g) => g.name.toLowerCase() === name.toLowerCase()
    );

    return game || data.results[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}