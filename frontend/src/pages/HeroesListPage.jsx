// frontend/src/pages/HeroesListPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

const HeroesListPage = () => {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterName, setFilterName] = useState('');
    const [filterAttr, setFilterAttr] = useState('');
    const [selectedHero, setSelectedHero] = useState(null);

    useEffect(() => {
        api.getHeroes()
            .then(heroes => {
                setHeroes(heroes);
                setError(null);
            })
            .catch(err => {
                console.error("Failed to fetch heroes", err);
                setError(err.message || 'Failed to load hero data.');
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredHeroes = heroes.filter(hero => {
        return (
            hero.localized_name.toLowerCase().includes(filterName.toLowerCase()) &&
            (filterAttr === '' || hero.primary_attr === filterAttr)
        );
    });

    if (loading) return <div className="text-center p-10">Loading heroes...</div>;
    if (error) return <div className="text-center p-10 text-red-500 font-semibold">Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-700 mb-6">Dota 2 Heroes</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input 
                    type="text" 
                    placeholder="Filter by name..." 
                    value={filterName} 
                    onChange={e => setFilterName(e.target.value)}
                    className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <select 
                    value={filterAttr} 
                    onChange={e => setFilterAttr(e.target.value)} 
                    className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                >
                    <option value="">All Attributes</option>
                    <option value="str">Strength</option>
                    <option value="agi">Agility</option>
                    <option value="int">Intelligence</option>
                    <option value="all">Universal</option> 
                </select>
            </div>

            {/* Modal for Selected Hero */}
            {selectedHero && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{selectedHero.localized_name}</h2>
                            <button onClick={() => setSelectedHero(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <img 
                            src={selectedHero.img} 
                            alt={selectedHero.localized_name} 
                            className="w-full max-w-xs mx-auto h-auto rounded-md mb-4 shadow"
                        />
                        <p className="text-gray-700 mb-1"><strong className="font-medium">Attribute:</strong> {selectedHero.primary_attr?.toUpperCase()}</p>
                        <p className="text-gray-700 mb-1"><strong className="font-medium">Attack Type:</strong> {selectedHero.attack_type}</p>
                        <p className="text-gray-700 mb-4"><strong className="font-medium">Roles:</strong> {selectedHero.roles?.join(', ')}</p>
                        <button 
                            onClick={() => setSelectedHero(null)} 
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredHeroes.map(hero => (
                    <div 
                        key={hero.id} 
                        className="border border-gray-200 bg-gray-50 p-3 rounded-lg text-center cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-200 ease-in-out"
                        onClick={() => setSelectedHero(hero)}
                    >
                        <img 
                            src={hero.icon} 
                            alt={hero.localized_name} 
                            className="w-full h-auto max-w-[80px] mx-auto mb-2 rounded"
                        />
                        <p className="text-sm font-medium text-gray-700">{hero.localized_name}</p>
                    </div>
                ))}
            </div>
            {filteredHeroes.length === 0 && !loading && (
                <p className="mt-6 text-center text-gray-600">No heroes match your filters.</p>
            )}
        </div>
    );
};
export default HeroesListPage;
