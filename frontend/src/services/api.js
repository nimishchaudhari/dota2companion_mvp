// Frontend API service for client-side operations
const api = {
  async searchPlayers(query) {
    const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed.');
    }
    return response.json();
  }
};

export { api };