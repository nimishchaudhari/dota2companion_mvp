import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PlayerSearch = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

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

  const handleSelectPlayer = (player) => {
    navigate(`/player/${player.steamId}`);
    setResults(null);
    setQuery('');
  };

  return (
    <div className="player-search w-80">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by Steam ID, Dota 2 ID, or persona name"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input input-bordered w-full"
          aria-label="Player search input"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2" role="alert">{error}</div>}
      {results && results.length > 1 && (
        <div className="bg-white text-black rounded shadow p-2 absolute z-10 w-80">
          <div className="mb-1 font-semibold">Multiple players found. Please select:</div>
          <ul className="list-disc ml-6">
            {results.map(player => (
              <li key={player.steamId} className="mb-1 flex items-center gap-2">
                {player.avatar && (
                  <img src={player.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                )}
                <button
                  className="text-blue-600 hover:underline text-left"
                  onClick={() => handleSelectPlayer(player)}
                >
                  {player.personaName} (Steam ID: {player.steamId})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {results && results.length === 1 && (
        <div className="bg-white text-black rounded shadow p-2 absolute z-10 w-80">
          <div className="mb-1 font-semibold">Player found:</div>
          <div className="flex items-center gap-2">
            {results[0].avatar && (
              <img src={results[0].avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            )}
            <button
              className="text-blue-600 hover:underline text-left"
              onClick={() => handleSelectPlayer(results[0])}
            >
              {results[0].personaName} (Steam ID: {results[0].steamId})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSearch;
