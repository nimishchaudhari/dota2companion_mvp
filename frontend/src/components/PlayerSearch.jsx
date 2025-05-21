import React, { useState } from 'react';

const PlayerSearch = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    if (!query.trim()) {
      setError('Please enter a Steam ID, Dota 2 ID, or persona name.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed.');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.players && data.players.length === 0) {
        setError('No players found.');
      } else {
        setResults(data.players);
        if (onResult) onResult(data.players);
      }
    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="player-search">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by Steam ID, Dota 2 ID, or persona name"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {results && results.length > 1 && (
        <div>
          <div>Multiple players found. Please select:</div>
          <ul className="list-disc ml-6">
            {results.map(player => (
              <li key={player.steamId}>
                <button
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => {
                    if (onResult) onResult([player]);
                  }}
                >
                  {player.personaName} (Steam ID: {player.steamId})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {results && results.length === 1 && (
        <div>
          <div>Player found:</div>
          <button
            className="text-blue-600 underline hover:text-blue-800"
            onClick={() => {
              if (onResult) onResult(results);
            }}
          >
            {results[0].personaName} (Steam ID: {results[0].steamId})
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerSearch;
