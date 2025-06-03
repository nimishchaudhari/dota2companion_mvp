import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DraftAssistant from '../components/DraftAssistant';
import BuildCalculator from '../components/BuildCalculator';

// Draft Page - Comprehensive draft analysis tool
const DraftPage = () => {
  const [currentHero, setCurrentHero] = useState(null);
  const [teamComposition, setTeamComposition] = useState({
    radiant: [],
    dire: []
  });
  const [activeTab, setActiveTab] = useState('draft'); // draft, builds, analysis
  const [selectedBuild, setSelectedBuild] = useState([]);

  const handleHeroPick = (hero) => {
    setCurrentHero(hero);
    // Add to team composition logic here
    const currentTeam = 'radiant'; // This would be dynamic based on UI state
    setTeamComposition(prev => ({
      ...prev,
      [currentTeam]: [...prev[currentTeam], hero].slice(0, 5)
    }));
  };

  const handleBuildChange = (build) => {
    setSelectedBuild(build);
  };

  const tabs = [
    { id: 'draft', name: 'Draft Assistant', icon: '⚔️' },
    { id: 'builds', name: 'Build Calculator', icon: '🛠️' },
    { id: 'analysis', name: 'Match Analysis', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          🏟️ Dota 2 Draft Arena
        </h1>
        <p className="text-slate-300">
          Professional-grade draft analysis and team building tools
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'draft' && (
          <DraftAssistant
            onHeroPick={handleHeroPick}
            teamComposition={teamComposition}
          />
        )}

        {activeTab === 'builds' && (
          <BuildCalculator
            selectedHero={currentHero}
            onBuildChange={handleBuildChange}
          />
        )}

        {activeTab === 'analysis' && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Match Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Comparison */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Team Comparison</h3>
                
                <div className="space-y-4">
                  {/* Radiant Team */}
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Radiant</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, index) => {
                        const hero = teamComposition.radiant[index];
                        return (
                          <div
                            key={index}
                            className={`aspect-square border-2 border-dashed border-green-500/30 rounded-lg flex items-center justify-center ${
                              hero ? 'bg-green-900/20 border-solid border-green-500' : 'bg-slate-700'
                            }`}
                          >
                            {hero ? (
                              <div className="text-2xl">⚡</div>
                            ) : (
                              <span className="text-slate-500">+</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dire Team */}
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Dire</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, index) => {
                        const hero = teamComposition.dire[index];
                        return (
                          <div
                            key={index}
                            className={`aspect-square border-2 border-dashed border-red-500/30 rounded-lg flex items-center justify-center ${
                              hero ? 'bg-red-900/20 border-solid border-red-500' : 'bg-slate-700'
                            }`}
                          >
                            {hero ? (
                              <div className="text-2xl">⚡</div>
                            ) : (
                              <span className="text-slate-500">+</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Power Spikes */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Power Spikes Analysis</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Early Game (0-15 min)</span>
                    <div className="flex gap-2">
                      <div className="w-16 h-2 bg-green-500 rounded"></div>
                      <span className="text-green-400 text-sm">Strong</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Mid Game (15-35 min)</span>
                    <div className="flex gap-2">
                      <div className="w-12 h-2 bg-yellow-500 rounded"></div>
                      <span className="text-yellow-400 text-sm">Average</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Late Game (35+ min)</span>
                    <div className="flex gap-2">
                      <div className="w-20 h-2 bg-green-500 rounded"></div>
                      <span className="text-green-400 text-sm">Very Strong</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Damage Composition */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Damage Composition</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-red-400">Physical Damage</span>
                      <span className="text-white">65%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-400">Magical Damage</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-purple-400">Pure Damage</span>
                      <span className="text-white">10%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Roles */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Team Roles Coverage</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Carry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Initiator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Disabler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Nuker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Pusher</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Recommendations */}
            <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-3">🎯 Strategy Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-blue-200 font-medium mb-2">Early Game</h5>
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>• Secure last hits and deny creeps</li>
                    <li>• Ward key jungle entrances</li>
                    <li>• Stack neutral camps for cores</li>
                    <li>• Coordinate ganks on enemy mid</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-blue-200 font-medium mb-2">Late Game</h5>
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>• Group up for team fights</li>
                    <li>• Control Roshan and high ground</li>
                    <li>• Focus enemy carry in fights</li>
                    <li>• Use buybacks strategically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DraftPage;