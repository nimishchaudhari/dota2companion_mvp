import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Draft Assistant Component - Real-time draft analysis and suggestions
const DraftAssistant = ({ onHeroPick, teamComposition = { radiant: [], dire: [] } }) => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [draftPhase, setDraftPhase] = useState('picking'); // picking, banning
  const [currentTeam, setCurrentTeam] = useState('radiant');
  const [heroDatabase, setHeroDatabase] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [winProbability, setWinProbability] = useState(50);

  // Mock hero database with detailed stats
  useEffect(() => {
    const mockHeroes = [
      {
        id: 1, name: 'Anti-Mage', localized_name: 'Anti-Mage',
        primary_attr: 'agi', roles: ['Carry', 'Escape'],
        winrate: 52.3, pickrate: 18.5, banrate: 12.4,
        counters: [2, 3, 4], synergies: [5, 6, 7],
        meta_score: 85, difficulty: 2.8,
        power_spikes: ['early', 'late'],
        lane_preference: 'safe'
      },
      {
        id: 2, name: 'Pudge', localized_name: 'Pudge',
        primary_attr: 'str', roles: ['Support', 'Initiator', 'Durable'],
        winrate: 49.8, pickrate: 25.1, banrate: 8.2,
        counters: [1, 8, 9], synergies: [10, 11, 12],
        meta_score: 78, difficulty: 2.1,
        power_spikes: ['mid'],
        lane_preference: 'support'
      },
      {
        id: 3, name: 'Invoker', localized_name: 'Invoker',
        primary_attr: 'int', roles: ['Carry', 'Nuker', 'Pusher'],
        winrate: 47.2, pickrate: 15.3, banrate: 22.1,
        counters: [1, 4, 5], synergies: [2, 6, 8],
        meta_score: 92, difficulty: 4.8,
        power_spikes: ['mid', 'late'],
        lane_preference: 'mid'
      }
    ];
    setHeroDatabase(mockHeroes);
  }, []);

  // Calculate recommendations based on current draft state
  const calculateRecommendations = useMemo(() => {
    if (!heroDatabase.length) return [];

    const currentPicks = [...teamComposition.radiant, ...teamComposition.dire];
    const availableHeroes = heroDatabase.filter(hero => 
      !currentPicks.some(pick => pick.id === hero.id)
    );

    return availableHeroes
      .map(hero => {
        let score = hero.meta_score;
        
        // Synergy bonus
        const teamPicks = teamComposition[currentTeam] || [];
        const synergyBonus = teamPicks.reduce((bonus, pick) => {
          return bonus + (hero.synergies?.includes(pick.id) ? 15 : 0);
        }, 0);
        
        // Counter bonus (against enemy team)
        const enemyTeam = currentTeam === 'radiant' ? 'dire' : 'radiant';
        const enemyPicks = teamComposition[enemyTeam] || [];
        const counterBonus = enemyPicks.reduce((bonus, pick) => {
          return bonus + (hero.counters?.includes(pick.id) ? 20 : 0);
        }, 0);
        
        // Role fit bonus
        const roleBonus = selectedRole === 'all' || hero.roles.includes(selectedRole) ? 10 : -20;
        
        // Meta bonus
        const metaBonus = hero.winrate > 50 ? 5 : -5;
        
        score += synergyBonus + counterBonus + roleBonus + metaBonus;
        
        return {
          ...hero,
          recommendation_score: Math.max(0, score),
          synergy_count: teamPicks.filter(pick => hero.synergies?.includes(pick.id)).length,
          counter_count: enemyPicks.filter(pick => hero.counters?.includes(pick.id)).length
        };
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 10);
  }, [heroDatabase, teamComposition, currentTeam, selectedRole]);

  // Calculate win probability based on team composition
  useEffect(() => {
    const radiantScore = teamComposition.radiant.reduce((score, hero) => score + (hero.meta_score || 75), 0);
    const direScore = teamComposition.dire.reduce((score, hero) => score + (hero.meta_score || 75), 0);
    
    if (radiantScore + direScore === 0) {
      setWinProbability(50);
      return;
    }
    
    const probability = (radiantScore / (radiantScore + direScore)) * 100;
    setWinProbability(Math.round(probability));
  }, [teamComposition]);

  const roles = ['all', 'Carry', 'Support', 'Initiator', 'Nuker', 'Pusher', 'Durable', 'Escape'];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDifficultyStars = (difficulty) => {
    return '★'.repeat(Math.round(difficulty)) + '☆'.repeat(5 - Math.round(difficulty));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          Draft Assistant
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDraftPhase(draftPhase === 'picking' ? 'banning' : 'picking')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              draftPhase === 'picking' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            {draftPhase === 'picking' ? '✓ Picking' : '✗ Banning'}
          </button>
        </div>
      </div>

      {/* Win Probability */}
      <div className="mb-6 bg-slate-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-400 font-medium">Radiant</span>
          <span className="text-white font-bold text-lg">Win Probability</span>
          <span className="text-red-400 font-medium">Dire</span>
        </div>
        <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400"
            initial={{ width: '50%' }}
            animate={{ width: `${winProbability}%` }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {winProbability}% - {100 - winProbability}%
            </span>
          </div>
        </div>
      </div>

      {/* Team Selection */}
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCurrentTeam('radiant')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              currentTeam === 'radiant' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Radiant ({teamComposition.radiant.length}/5)
          </button>
          <button
            onClick={() => setCurrentTeam('dire')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              currentTeam === 'dire' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Dire ({teamComposition.dire.length}/5)
          </button>
        </div>
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedRole === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">
          {draftPhase === 'picking' ? 'Recommended Picks' : 'Ban Suggestions'}
        </h3>
        
        <AnimatePresence>
          {calculateRecommendations.map((hero, index) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-all cursor-pointer border border-slate-600 hover:border-blue-500"
              onClick={() => onHeroPick && onHeroPick(hero)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                    ⚡
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white text-lg">{hero.localized_name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="capitalize">{hero.primary_attr}</span>
                      <span>•</span>
                      <span>{hero.roles.join(', ')}</span>
                      <span>•</span>
                      <span>{getDifficultyStars(hero.difficulty)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-green-400">
                        WR: {hero.winrate}%
                      </span>
                      <span className="text-blue-400">
                        PR: {hero.pickrate}%
                      </span>
                      {hero.synergy_count > 0 && (
                        <span className="text-purple-400">
                          ⚡ {hero.synergy_count} synergies
                        </span>
                      )}
                      {hero.counter_count > 0 && (
                        <span className="text-orange-400">
                          ⚔️ {hero.counter_count} counters
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(hero.recommendation_score)}`}>
                    {Math.round(hero.recommendation_score)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Score
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Draft Tips */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">💡 Draft Tips</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Consider team synergies and power spikes</li>
          <li>• Pick counters to enemy cores early</li>
          <li>• Save flexible picks for later phases</li>
          <li>• Balance your team's damage types</li>
          <li>• Don't forget initiation and save abilities</li>
        </ul>
      </div>
    </div>
  );
};

export default DraftAssistant;