// Web Worker for heavy data processing tasks
// This runs in a separate thread to avoid blocking the main UI

// Worker message handler
self.onmessage = function(e) {
  const { type, data, id } = e.data;

  try {
    let result;
    
    switch (type) {
      case 'PROCESS_HEROES':
        result = processHeroes(data);
        break;
      case 'CALCULATE_MATCH_STATS':
        result = calculateMatchStats(data);
        break;
      case 'FILTER_RECOMMENDATIONS':
        result = filterRecommendations(data);
        break;
      case 'SORT_LARGE_LIST':
        result = sortLargeList(data);
        break;
      case 'SEARCH_PLAYERS':
        result = searchPlayers(data);
        break;
      case 'COMPRESS_DATA':
        result = compressData(data);
        break;
      case 'DECOMPRESS_DATA':
        result = decompressData(data);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // Send result back to main thread
    self.postMessage({
      id,
      type: 'SUCCESS',
      result
    });

  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      type: 'ERROR',
      error: error.message
    });
  }
};

// Hero processing functions
function processHeroes(heroes) {
  return heroes.map(hero => ({
    ...hero,
    // Pre-calculate search terms
    searchTerms: generateSearchTerms(hero),
    // Calculate difficulty score
    difficultyScore: calculateHeroDifficulty(hero),
    // Generate role weights
    roleWeights: calculateRoleWeights(hero.roles),
    // Attribute strengths
    attributeBonus: calculateAttributeBonus(hero.primary_attr)
  }));
}

function generateSearchTerms(hero) {
  const terms = [
    hero.name?.toLowerCase() || '',
    hero.localized_name?.toLowerCase() || '',
    ...(hero.roles || []).map(role => role.toLowerCase()),
    hero.primary_attr?.toLowerCase() || '',
    hero.attack_type?.toLowerCase() || ''
  ];
  return terms.filter(term => term.length > 0).join(' ');
}

function calculateHeroDifficulty(hero) {
  // Simple difficulty calculation based on roles and attributes
  const complexRoles = ['Carry', 'Initiator', 'Jungler'];
  const hasComplexRole = hero.roles?.some(role => complexRoles.includes(role));
  
  let difficulty = 1; // Base difficulty
  if (hasComplexRole) difficulty += 1;
  if (hero.roles?.length > 2) difficulty += 1;
  if (hero.primary_attr === 'int') difficulty += 0.5; // Spell casters often more complex
  
  return Math.min(3, difficulty);
}

function calculateRoleWeights(roles) {
  const weights = {};
  const roleImportance = {
    'Carry': 0.9,
    'Support': 0.8,
    'Initiator': 0.85,
    'Disabler': 0.75,
    'Nuker': 0.7,
    'Pusher': 0.6,
    'Escape': 0.5,
    'Durable': 0.6,
    'Jungler': 0.4
  };
  
  roles?.forEach(role => {
    weights[role] = roleImportance[role] || 0.5;
  });
  
  return weights;
}

function calculateAttributeBonus(primaryAttr) {
  const bonuses = {
    'str': { health: 22, damage: 1, healthRegen: 0.1 },
    'agi': { armor: 0.17, attackSpeed: 1, moveSpeed: 0.05 },
    'int': { mana: 12, manaRegen: 0.05, spellDamage: 0.07 }
  };
  return bonuses[primaryAttr] || bonuses.str;
}

// Match statistics calculation
function calculateMatchStats(matches) {
  const stats = {
    totalMatches: matches.length,
    wins: 0,
    losses: 0,
    averageDuration: 0,
    heroStats: {},
    performanceMetrics: {
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgKDA: 0
    },
    streaks: {
      currentWinStreak: 0,
      currentLossStreak: 0,
      maxWinStreak: 0,
      maxLossStreak: 0
    }
  };

  let totalDuration = 0;
  let totalKills = 0, totalDeaths = 0, totalAssists = 0;
  let currentWinStreak = 0, currentLossStreak = 0;
  let maxWinStreak = 0, maxLossStreak = 0;

  matches.forEach(match => {
    const won = match.won || ((match.player_slot < 128) === match.radiant_win);
    
    // Win/Loss tracking
    if (won) {
      stats.wins++;
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else {
      stats.losses++;
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }

    // Duration
    totalDuration += match.duration || 0;

    // KDA
    totalKills += match.kills || 0;
    totalDeaths += match.deaths || 0;
    totalAssists += match.assists || 0;

    // Hero stats
    const heroId = match.hero_id;
    if (heroId) {
      if (!stats.heroStats[heroId]) {
        stats.heroStats[heroId] = {
          matches: 0,
          wins: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0
        };
      }
      stats.heroStats[heroId].matches++;
      if (won) stats.heroStats[heroId].wins++;
      stats.heroStats[heroId].totalKills += match.kills || 0;
      stats.heroStats[heroId].totalDeaths += match.deaths || 0;
      stats.heroStats[heroId].totalAssists += match.assists || 0;
    }
  });

  // Calculate averages
  stats.averageDuration = matches.length > 0 ? totalDuration / matches.length : 0;
  stats.performanceMetrics.avgKills = matches.length > 0 ? totalKills / matches.length : 0;
  stats.performanceMetrics.avgDeaths = matches.length > 0 ? totalDeaths / matches.length : 0;
  stats.performanceMetrics.avgAssists = matches.length > 0 ? totalAssists / matches.length : 0;
  stats.performanceMetrics.avgKDA = stats.performanceMetrics.avgDeaths > 0 ? 
    (stats.performanceMetrics.avgKills + stats.performanceMetrics.avgAssists) / stats.performanceMetrics.avgDeaths : 0;

  // Final streak values
  stats.streaks.currentWinStreak = currentWinStreak;
  stats.streaks.currentLossStreak = currentLossStreak;
  stats.streaks.maxWinStreak = maxWinStreak;
  stats.streaks.maxLossStreak = maxLossStreak;

  // Process hero stats
  Object.keys(stats.heroStats).forEach(heroId => {
    const heroStat = stats.heroStats[heroId];
    heroStat.winRate = heroStat.matches > 0 ? (heroStat.wins / heroStat.matches) * 100 : 0;
    heroStat.avgKDA = heroStat.totalDeaths > 0 ? 
      (heroStat.totalKills + heroStat.totalAssists) / heroStat.totalDeaths : 0;
  });

  return stats;
}

// Recommendation filtering
function filterRecommendations(data) {
  const { recommendations, filters, userPreferences } = data;
  
  return recommendations.filter(rec => {
    // Role filter
    if (filters.roles?.length > 0) {
      const hasMatchingRole = rec.roles?.some(role => 
        filters.roles.includes(role)
      );
      if (!hasMatchingRole) return false;
    }

    // Difficulty filter
    if (filters.difficulty?.length > 0) {
      if (!filters.difficulty.includes(rec.difficulty)) return false;
    }

    // Attribute filter
    if (filters.primaryAttr?.length > 0) {
      if (!filters.primaryAttr.includes(rec.primary_attr)) return false;
    }

    // User preference scoring
    if (userPreferences) {
      rec.preferenceScore = calculatePreferenceScore(rec, userPreferences);
    }

    return true;
  }).sort((a, b) => {
    // Sort by preference score if available, otherwise by win rate
    const scoreA = a.preferenceScore || a.winrate || 0;
    const scoreB = b.preferenceScore || b.winrate || 0;
    return scoreB - scoreA;
  });
}

function calculatePreferenceScore(recommendation, preferences) {
  let score = 0;
  
  // Preferred roles
  if (preferences.preferredRoles?.length > 0) {
    const roleMatches = recommendation.roles?.filter(role => 
      preferences.preferredRoles.includes(role)
    ).length || 0;
    score += roleMatches * 20;
  }

  // Preferred attributes
  if (preferences.preferredAttributes?.includes(recommendation.primary_attr)) {
    score += 15;
  }

  // Difficulty preference
  if (preferences.difficultyLevel === recommendation.difficulty) {
    score += 10;
  }

  // Recently played penalty (to encourage variety)
  if (preferences.recentlyPlayedHeroes?.includes(recommendation.id)) {
    score -= 25;
  }

  return score;
}

// Large list sorting
function sortLargeList(data) {
  const { items, sortKey, sortOrder, filterFn } = data;
  
  let filteredItems = items;
  
  // Apply filter if provided
  if (filterFn && typeof filterFn === 'string') {
    // Convert string function back to function (limited security context in worker)
    try {
      filteredItems = items.filter(eval(`(${filterFn})`));
    } catch (e) {
      console.warn('Filter function failed:', e);
    }
  }

  // Sort
  filteredItems.sort((a, b) => {
    let aVal = getNestedValue(a, sortKey);
    let bVal = getNestedValue(b, sortKey);
    
    // Handle different data types
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filteredItems;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Player search
function searchPlayers(data) {
  const { players, query, limit = 50 } = data;
  const normalizedQuery = query.toLowerCase();
  
  return players
    .filter(player => 
      player.personaName?.toLowerCase().includes(normalizedQuery) ||
      player.steamId?.toString().includes(query)
    )
    .slice(0, limit)
    .map(player => ({
      ...player,
      matchScore: calculateSearchScore(player, normalizedQuery)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function calculateSearchScore(player, query) {
  let score = 0;
  
  // Exact match bonus
  if (player.personaName?.toLowerCase() === query) score += 100;
  
  // Starts with bonus
  if (player.personaName?.toLowerCase().startsWith(query)) score += 50;
  
  // Contains bonus
  if (player.personaName?.toLowerCase().includes(query)) score += 25;
  
  // ID match
  if (player.steamId?.toString().includes(query)) score += 75;
  
  return score;
}

// Data compression utilities
function compressData(data) {
  try {
    // Simple JSON compression (in real app, use proper compression library)
    const jsonString = JSON.stringify(data);
    
    // Basic compression: remove repeated whitespace and use shorter keys
    const compressed = jsonString
      .replace(/\s+/g, ' ')
      .replace(/,\s/g, ',')
      .replace(/:\s/g, ':');
      
    return {
      compressed,
      originalSize: jsonString.length,
      compressedSize: compressed.length,
      ratio: (1 - compressed.length / jsonString.length) * 100
    };
  } catch (error) {
    throw new Error('Compression failed: ' + error.message);
  }
}

function decompressData(compressedData) {
  try {
    return JSON.parse(compressedData.compressed);
  } catch (error) {
    throw new Error('Decompression failed: ' + error.message);
  }
}

// Signal that worker is ready
self.postMessage({ type: 'WORKER_READY' });