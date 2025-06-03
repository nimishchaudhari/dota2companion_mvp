import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Build Calculator Component - Interactive item builder and calculator
const BuildCalculator = ({ selectedHero, onBuildChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [heroLevel, setHeroLevel] = useState(25);
  const [gameTime, setGameTime] = useState(30); // minutes
  const [itemDatabase, setItemDatabase] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonBuild, setComparisonBuild] = useState([]);

  // Mock item database
  useEffect(() => {
    const mockItems = [
      {
        id: 1, name: 'power_treads', display_name: 'Power Treads',
        cost: 1400, damage: 0, strength: 0, agility: 25, intelligence: 0,
        attack_speed: 25, move_speed: 45, armor: 0, magic_resistance: 0,
        category: 'boots', components: ['boots', 'gloves', 'belt_of_strength'],
        description: 'Boots that allow the wearer to alter their foot speed.',
        icon: '🥾', active: false, passive_description: 'Attribute switching'
      },
      {
        id: 2, name: 'battle_fury', display_name: 'Battle Fury', 
        cost: 4100, damage: 65, strength: 0, agility: 0, intelligence: 0,
        health_regen: 7.5, mana_regen: 4.5, cleave: 60, armor: 0,
        category: 'weapon', components: ['broadsword', 'claymore', 'perseverance'],
        description: 'An axe made of reflective materials that causes confusion.',
        icon: '⚔️', active: false, passive_description: '60% cleave damage'
      },
      {
        id: 3, name: 'black_king_bar', display_name: 'Black King Bar',
        cost: 4050, damage: 24, strength: 10, agility: 0, intelligence: 0,
        health: 250, magic_immunity_duration: 9, armor: 0,
        category: 'armor', components: ['ogre_axe', 'mithril_hammer', 'recipe'],
        description: 'A powerful staff imbued with the strength of giants.',
        icon: '👑', active: true, active_description: 'Avatar - Magic immunity'
      },
      {
        id: 4, name: 'daedalus', display_name: 'Daedalus',
        cost: 5150, damage: 88, strength: 0, agility: 0, intelligence: 0,
        crit_chance: 30, crit_multiplier: 2.2, armor: 0,
        category: 'weapon', components: ['crystalys', 'demon_edge', 'recipe'],
        description: 'A weapon of incredible power that is difficult for even the strongest to control.',
        icon: '💀', active: false, passive_description: '30% chance for 2.2x critical strike'
      },
      {
        id: 5, name: 'heart_of_tarrasque', display_name: 'Heart of Tarrasque',
        cost: 5000, strength: 40, agility: 0, intelligence: 0,
        health: 1000, health_regen: 1.6, damage: 0, armor: 0,
        category: 'armor', components: ['vitality_booster', 'reaver', 'recipe'],
        description: 'Preserved heart of an extinct monster, it bolsters the bearer\'s fortitude.',
        icon: '❤️', active: false, passive_description: 'Health regeneration outside combat'
      },
      {
        id: 6, name: 'butterfly', display_name: 'Butterfly',
        cost: 4975, damage: 35, agility: 35, attack_speed: 35,
        evasion: 35, flutter_speed: 20, armor: 0,
        category: 'weapon', components: ['eaglesong', 'talisman_of_evasion', 'quarterstaff'],
        description: 'Preserved through unknown magical means, the Hand of Midas is a weapon of greed.',
        icon: '🦋', active: true, active_description: 'Flutter - Bonus movement speed and evasion'
      }
    ];
    setItemDatabase(mockItems);
  }, []);

  // Mock hero base stats
  const heroBaseStats = useMemo(() => {
    if (!selectedHero) return null;
    
    return {
      strength: 22, agility: 20, intelligence: 15,
      strength_gain: 1.8, agility_gain: 2.8, intelligence_gain: 1.2,
      base_damage: [29, 33], base_armor: 1, base_move_speed: 310,
      base_attack_speed: 100, primary_attribute: 'agility'
    };
  }, [selectedHero]);

  // Calculate total stats with items
  const calculatedStats = useMemo(() => {
    if (!heroBaseStats) return null;

    let totalStats = {
      strength: heroBaseStats.strength + (heroBaseStats.strength_gain * heroLevel),
      agility: heroBaseStats.agility + (heroBaseStats.agility_gain * heroLevel),
      intelligence: heroBaseStats.intelligence + (heroBaseStats.intelligence_gain * heroLevel),
      damage: heroBaseStats.base_damage[1],
      armor: heroBaseStats.base_armor,
      attack_speed: heroBaseStats.base_attack_speed,
      move_speed: heroBaseStats.base_move_speed,
      health: 0,
      mana: 0,
      health_regen: 0,
      mana_regen: 0
    };

    // Add item bonuses
    selectedItems.forEach(item => {
      totalStats.strength += item.strength || 0;
      totalStats.agility += item.agility || 0;
      totalStats.intelligence += item.intelligence || 0;
      totalStats.damage += item.damage || 0;
      totalStats.armor += item.armor || 0;
      totalStats.attack_speed += item.attack_speed || 0;
      totalStats.move_speed += item.move_speed || 0;
      totalStats.health += item.health || 0;
      totalStats.mana += item.mana || 0;
      totalStats.health_regen += item.health_regen || 0;
      totalStats.mana_regen += item.mana_regen || 0;
    });

    // Calculate derived stats
    totalStats.health += totalStats.strength * 22;
    totalStats.mana += totalStats.intelligence * 12;
    totalStats.health_regen += totalStats.strength * 0.1;
    totalStats.mana_regen += totalStats.intelligence * 0.05;
    totalStats.armor += totalStats.agility * 0.167;

    // Primary attribute damage bonus
    if (heroBaseStats.primary_attribute === 'strength') {
      totalStats.damage += totalStats.strength;
    } else if (heroBaseStats.primary_attribute === 'agility') {
      totalStats.damage += totalStats.agility;
    } else {
      totalStats.damage += totalStats.intelligence;
    }

    return totalStats;
  }, [heroBaseStats, selectedItems, heroLevel]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return itemDatabase.filter(item => {
      const matchesSearch = item.display_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const notSelected = !selectedItems.some(selected => selected.id === item.id);
      return matchesSearch && matchesCategory && notSelected;
    });
  }, [itemDatabase, searchTerm, selectedCategory, selectedItems]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return selectedItems.reduce((total, item) => total + item.cost, 0);
  }, [selectedItems]);

  // Calculate DPS
  const calculateDPS = useMemo(() => {
    if (!calculatedStats) return 0;
    
    const attacksPerSecond = (100 + calculatedStats.attack_speed) / 100;
    const avgDamage = calculatedStats.damage;
    
    // Consider critical strike
    const critItem = selectedItems.find(item => item.crit_chance);
    let critMultiplier = 1;
    if (critItem) {
      critMultiplier = 1 + (critItem.crit_chance / 100) * (critItem.crit_multiplier - 1);
    }
    
    return Math.round(avgDamage * attacksPerSecond * critMultiplier);
  }, [calculatedStats, selectedItems]);

  const addItem = (item) => {
    if (selectedItems.length < 6) {
      setSelectedItems([...selectedItems, item]);
      onBuildChange && onBuildChange([...selectedItems, item]);
    }
  };

  const removeItem = (itemId) => {
    const newItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(newItems);
    onBuildChange && onBuildChange(newItems);
  };

  const categories = ['all', 'weapon', 'armor', 'boots', 'accessories', 'consumables'];

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-500';
    if (efficiency >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Calculate gold per damage efficiency
  const calculateEfficiency = (item) => {
    if (item.damage === 0) return 0;
    return Math.round((item.damage / item.cost) * 1000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🛠️</span>
          Build Calculator
          {selectedHero && (
            <span className="text-lg text-slate-300">- {selectedHero.localized_name}</span>
          )}
        </h2>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          {showComparison ? 'Hide' : 'Compare'} Builds
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Build & Stats */}
        <div className="space-y-6">
          {/* Level and Time Controls */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Hero Level</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={heroLevel}
                  onChange={(e) => setHeroLevel(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white font-bold">{heroLevel}</div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Game Time (min)</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={gameTime}
                  onChange={(e) => setGameTime(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white font-bold">{gameTime}:00</div>
              </div>
            </div>
          </div>

          {/* Current Build */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Current Build</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Array.from({ length: 6 }, (_, index) => {
                const item = selectedItems[index];
                return (
                  <div
                    key={index}
                    className={`aspect-square border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center ${
                      item ? 'bg-slate-700 border-solid border-blue-500' : 'bg-slate-750'
                    }`}
                  >
                    {item ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl cursor-pointer hover:bg-red-900 transition-all rounded-lg relative group"
                        onClick={() => removeItem(item.id)}
                      >
                        {item.icon}
                        <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-30 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">✕</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-4xl text-slate-500">+</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-white font-semibold">
                Total Cost: <span className="text-yellow-400">{totalCost.toLocaleString()}g</span>
              </div>
              <div className="text-white font-semibold">
                DPS: <span className="text-red-400">{calculateDPS}</span>
              </div>
            </div>
          </div>

          {/* Stats Display */}
          {calculatedStats && (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Hero Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-400">Strength:</span>
                    <span className="text-white">{Math.round(calculatedStats.strength)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Agility:</span>
                    <span className="text-white">{Math.round(calculatedStats.agility)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">Intelligence:</span>
                    <span className="text-white">{Math.round(calculatedStats.intelligence)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-400">Damage:</span>
                    <span className="text-white">{Math.round(calculatedStats.damage)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Health:</span>
                    <span className="text-white">{Math.round(calculatedStats.health)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">Mana:</span>
                    <span className="text-white">{Math.round(calculatedStats.mana)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Armor:</span>
                    <span className="text-white">{calculatedStats.armor.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">Move Speed:</span>
                    <span className="text-white">{Math.round(calculatedStats.move_speed)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Item Browser */}
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Item List */}
          <div className="bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-3">Available Items</h3>
            
            <div className="space-y-2">
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-all cursor-pointer border border-slate-600 hover:border-blue-500"
                    onClick={() => addItem(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <h4 className="font-semibold text-white">{item.display_name}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-yellow-400">{item.cost}g</span>
                            {item.damage > 0 && (
                              <span className="text-red-400">+{item.damage} dmg</span>
                            )}
                            {item.strength > 0 && (
                              <span className="text-red-300">+{item.strength} str</span>
                            )}
                            {item.agility > 0 && (
                              <span className="text-green-300">+{item.agility} agi</span>
                            )}
                            {item.intelligence > 0 && (
                              <span className="text-blue-300">+{item.intelligence} int</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {item.damage > 0 && (
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getEfficiencyColor(calculateEfficiency(item))}`}>
                            {calculateEfficiency(item)} eff
                          </div>
                          <div className="text-xs text-slate-400">
                            dmg/1000g
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(item.active_description || item.passive_description) && (
                      <div className="mt-2 text-xs text-slate-400">
                        {item.active && <span className="text-blue-400">[Active] </span>}
                        {item.passive_description || item.active_description}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">📊 Build Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-200 mb-1">Power Curve</div>
            <div className="text-blue-100">
              Early Game: {selectedItems.filter(item => item.cost < 3000).length > 2 ? 'Strong' : 'Weak'}
            </div>
          </div>
          <div>
            <div className="text-blue-200 mb-1">Survivability</div>
            <div className="text-blue-100">
              {selectedItems.some(item => item.category === 'armor') ? 'Good' : 'Low'}
            </div>
          </div>
          <div>
            <div className="text-blue-200 mb-1">Damage Type</div>
            <div className="text-blue-100">
              {selectedItems.some(item => item.damage > 0) ? 'Physical' : 'Utility'} Focus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildCalculator;