// Recommendation Engine
// Provides intelligent hero and item recommendations based on user preferences, meta data, and game context

class RecommendationEngine {
  constructor() {
    this.weights = {
      user_preference: 0.3,
      meta_score: 0.25,
      synergy_score: 0.2,
      win_rate: 0.15,
      user_history: 0.1
    };
  }

  // Main recommendation filtering method
  filterRecommendations(recommendations, filters = {}, userProfile = null) {
    try {
      let filtered = { ...recommendations };

      // Apply role filter
      if (filters.role && filtered.role_based?.[filters.role]) {
        filtered.role_based = {
          [filters.role]: filtered.role_based[filters.role]
        };
      }

      // Apply difficulty filter
      if (filters.difficulty) {
        filtered.beginner_friendly = this.filterByDifficulty(
          filtered.beginner_friendly || [],
          filters.difficulty
        );
      }

      // Apply user preferences
      if (userProfile) {
        filtered = this.applyUserPreferences(filtered, userProfile);
      }

      // Apply meta filters
      if (filters.meta_tier) {
        filtered.meta_picks = this.filterByMetaTier(
          filtered.meta_picks || [],
          filters.meta_tier
        );
      }

      // Sort recommendations by computed scores
      filtered = this.sortRecommendations(filtered, userProfile);

      return filtered;
    } catch (error) {
      console.error('Error filtering recommendations:', error);
      return recommendations;
    }
  }

  // Filter heroes by difficulty level
  filterByDifficulty(heroes, difficulty) {
    const difficultyMap = {
      'beginner': ['easy'],
      'intermediate': ['easy', 'medium'],
      'advanced': ['easy', 'medium', 'hard'],
      'expert': ['hard', 'very_hard']
    };

    const allowedDifficulties = difficultyMap[difficulty] || ['easy', 'medium', 'hard'];
    
    return heroes.filter(hero => 
      allowedDifficulties.includes(hero.difficulty)
    );
  }

  // Filter by meta tier
  filterByMetaTier(heroes, tier) {
    const tierOrder = ['S', 'A', 'B', 'C', 'D'];
    const maxTierIndex = tierOrder.indexOf(tier);
    
    if (maxTierIndex === -1) return heroes;
    
    const allowedTiers = tierOrder.slice(0, maxTierIndex + 1);
    
    return heroes.filter(hero => 
      allowedTiers.includes(hero.tier)
    );
  }

  // Apply user preferences to recommendations
  applyUserPreferences(recommendations, userProfile) {
    const prefs = userProfile.preferences || {};
    let filtered = { ...recommendations };

    // Role preference
    if (prefs.role_preference && prefs.role_preference !== 'any') {
      if (filtered.role_based?.[prefs.role_preference]) {
        // Boost preferred role
        filtered.role_based[prefs.role_preference] = filtered.role_based[prefs.role_preference]
          .map(hero => ({
            ...hero,
            preference_boost: 0.2
          }));
      }
    }

    // Hero complexity preference
    if (prefs.hero_complexity && prefs.hero_complexity !== 'any') {
      filtered.beginner_friendly = this.filterByDifficulty(
        filtered.beginner_friendly || [],
        prefs.hero_complexity
      );
    }

    // Playstyle preference
    if (prefs.playstyle && prefs.playstyle !== 'any') {
      filtered = this.applyPlaystylePreference(filtered, prefs.playstyle);
    }

    // Boost favorite heroes
    if (userProfile.favorite_heroes) {
      filtered = this.boostFavoriteHeroes(filtered, userProfile.favorite_heroes);
    }

    return filtered;
  }

  // Apply playstyle preferences
  applyPlaystylePreference(recommendations, playstyle) {
    const playstyleHeroes = {
      'aggressive': [1, 8, 21, 38], // Anti-Mage, Juggernaut, Bloodseeker, Bristleback
      'farming': [1, 11, 74], // Anti-Mage, Shadow Fiend, Invoker
      'support': [23, 5, 31], // Crystal Maiden, Vengeful Spirit, Lich
      'teamfight': [18, 74, 43], // Enigma, Invoker, Death Prophet
      'splitpush': [1, 39, 58] // Anti-Mage, Queen of Pain, Morphling
    };

    const preferredHeroes = playstyleHeroes[playstyle] || [];
    
    // Boost heroes that match playstyle
    Object.keys(recommendations.role_based || {}).forEach(role => {
      recommendations.role_based[role] = recommendations.role_based[role].map(hero => {
        if (preferredHeroes.includes(hero.hero_id)) {
          return {
            ...hero,
            playstyle_boost: 0.15
          };
        }
        return hero;
      });
    });

    return recommendations;
  }

  // Boost user's favorite heroes in recommendations
  boostFavoriteHeroes(recommendations, favoriteHeroes) {
    const favoriteIds = favoriteHeroes.map(h => h.hero_id);

    Object.keys(recommendations.role_based || {}).forEach(role => {
      recommendations.role_based[role] = recommendations.role_based[role].map(hero => {
        if (favoriteIds.includes(hero.hero_id)) {
          return {
            ...hero,
            favorite_boost: 0.25
          };
        }
        return hero;
      });
    });

    return recommendations;
  }

  // Sort recommendations by computed scores
  sortRecommendations(recommendations, userProfile) {
    const sorted = { ...recommendations };

    // Sort role-based recommendations
    Object.keys(sorted.role_based || {}).forEach(role => {
      sorted.role_based[role] = sorted.role_based[role]
        .map(hero => ({
          ...hero,
          computed_score: this.computeHeroScore(hero, userProfile)
        }))
        .sort((a, b) => b.computed_score - a.computed_score);
    });

    // Sort meta picks
    if (sorted.meta_picks) {
      sorted.meta_picks = sorted.meta_picks
        .map(hero => ({
          ...hero,
          computed_score: this.computeHeroScore(hero, userProfile)
        }))
        .sort((a, b) => b.computed_score - a.computed_score);
    }

    // Sort beginner friendly
    if (sorted.beginner_friendly) {
      sorted.beginner_friendly = sorted.beginner_friendly
        .map(hero => ({
          ...hero,
          computed_score: this.computeHeroScore(hero, userProfile)
        }))
        .sort((a, b) => b.computed_score - a.computed_score);
    }

    return sorted;
  }

  // Compute overall score for a hero
  computeHeroScore(hero, userProfile) {
    let score = 0;

    // Base scores
    const metaScore = hero.meta_score || 0;
    const synergyScore = hero.synergy_score || 0;
    const winRate = hero.win_rate || 0;

    // User preference boosts
    const preferenceBoost = hero.preference_boost || 0;
    const playstyleBoost = hero.playstyle_boost || 0;
    const favoriteBoost = hero.favorite_boost || 0;

    // User history score
    let historyScore = 0;
    if (userProfile?.match_history_cache) {
      const heroMatches = userProfile.match_history_cache.filter(
        match => match.hero_id === hero.hero_id
      );
      
      if (heroMatches.length > 0) {
        const winCount = heroMatches.filter(match => match.result === 'win').length;
        historyScore = winCount / heroMatches.length;
      }
    }

    // Weighted score calculation
    score = (
      metaScore * this.weights.meta_score +
      synergyScore * this.weights.synergy_score +
      winRate * this.weights.win_rate +
      historyScore * this.weights.user_history +
      (preferenceBoost + playstyleBoost + favoriteBoost) * this.weights.user_preference
    );

    return Math.min(1.0, Math.max(0.0, score));
  }

  // Get personalized hero recommendations
  getPersonalizedRecommendations(allRecommendations, userProfile, context = {}) {
    try {
      const { role, gameMode, teamComposition, enemyTeam } = context;
      
      let recommendations = [];

      // Start with role-based recommendations if role is specified
      if (role && allRecommendations.role_based?.[role]) {
        recommendations = [...allRecommendations.role_based[role]];
      } else {
        // Aggregate from all roles based on user preference
        const preferredRole = userProfile?.preferences?.role_preference;
        
        if (preferredRole && preferredRole !== 'any' && allRecommendations.role_based?.[preferredRole]) {
          recommendations = [...allRecommendations.role_based[preferredRole]];
        } else {
          // Mix from all roles
          Object.values(allRecommendations.role_based || {}).forEach(roleHeroes => {
            recommendations = recommendations.concat(roleHeroes.slice(0, 3));
          });
        }
      }

      // Apply context-based filtering
      if (teamComposition) {
        recommendations = this.filterBySynergy(recommendations, teamComposition, allRecommendations);
      }

      if (enemyTeam) {
        recommendations = this.filterByCounters(recommendations, enemyTeam, allRecommendations);
      }

      // Apply game mode considerations
      if (gameMode) {
        recommendations = this.filterByGameMode(recommendations, gameMode);
      }

      // Score and sort
      recommendations = recommendations
        .map(hero => ({
          ...hero,
          computed_score: this.computeHeroScore(hero, userProfile),
          context_score: this.computeContextScore(hero, context, allRecommendations)
        }))
        .sort((a, b) => (b.computed_score + b.context_score) - (a.computed_score + a.context_score))
        .slice(0, 10); // Top 10 recommendations

      return {
        recommendations,
        reasoning: this.generateRecommendationReasoning(recommendations, context, userProfile)
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return { recommendations: [], reasoning: [] };
    }
  }

  // Filter by synergy with team composition
  filterBySynergy(heroes, teamComposition, allRecommendations) {
    const synergies = allRecommendations.synergies?.strong_combos || [];
    
    return heroes.map(hero => {
      let synergyBoost = 0;
      
      // Check for synergies with team
      synergies.forEach(combo => {
        const heroInCombo = combo.heroes.find(h => h.hero_id === hero.hero_id);
        if (heroInCombo) {
          const teammateSynergy = combo.heroes.some(h => 
            h.hero_id !== hero.hero_id && teamComposition.includes(h.hero_id)
          );
          
          if (teammateSynergy) {
            synergyBoost += combo.synergy_score * 0.2;
          }
        }
      });
      
      return {
        ...hero,
        synergy_boost: synergyBoost
      };
    });
  }

  // Filter by counters to enemy team
  filterByCounters(heroes, enemyTeam, allRecommendations) {
    const counterData = allRecommendations.counter_picks || {};
    
    return heroes.map(hero => {
      let counterBoost = 0;
      
      // Check if this hero counters enemy heroes
      enemyTeam.forEach(enemyHeroId => {
        const enemyCounters = counterData[enemyHeroId];
        if (enemyCounters?.counters) {
          const counterMatch = enemyCounters.counters.find(c => c.hero_id === hero.hero_id);
          if (counterMatch) {
            counterBoost += counterMatch.effectiveness * 0.15;
          }
        }
      });
      
      return {
        ...hero,
        counter_boost: counterBoost
      };
    });
  }

  // Filter by game mode preferences
  filterByGameMode(heroes, gameMode) {
    const gameModePreferences = {
      'all_pick': [], // No specific preferences
      'ranked_matchmaking': ['meta', 'high_win_rate'],
      'turbo': ['early_game', 'fast_paced'],
      'ability_draft': ['unique_abilities'],
      'captains_mode': ['meta', 'versatile']
    };

    const preferences = gameModePreferences[gameMode] || [];
    
    return heroes.map(hero => {
      let gameModeBoost = 0;
      
      if (preferences.includes('meta') && hero.tier && ['S', 'A'].includes(hero.tier)) {
        gameModeBoost += 0.1;
      }
      
      if (preferences.includes('high_win_rate') && hero.win_rate > 0.52) {
        gameModeBoost += 0.1;
      }
      
      if (preferences.includes('early_game') && hero.roles?.includes('Nuker')) {
        gameModeBoost += 0.1;
      }
      
      return {
        ...hero,
        game_mode_boost: gameModeBoost
      };
    });
  }

  // Compute context-based score
  computeContextScore(hero) {
    let score = 0;
    
    score += hero.synergy_boost || 0;
    score += hero.counter_boost || 0;
    score += hero.game_mode_boost || 0;
    
    return Math.min(0.5, Math.max(0.0, score)); // Max 0.5 boost from context
  }

  // Generate reasoning for recommendations
  generateRecommendationReasoning(recommendations, context, userProfile) {
    return recommendations.slice(0, 5).map(hero => {
      const reasons = [];
      
      if (hero.computed_score > 0.8) {
        reasons.push('High overall match for your preferences');
      }
      
      if (hero.favorite_boost) {
        reasons.push('One of your favorite heroes');
      }
      
      if (hero.synergy_boost > 0.1) {
        reasons.push('Good synergy with your team');
      }
      
      if (hero.counter_boost > 0.1) {
        reasons.push('Counters enemy heroes');
      }
      
      if (hero.tier && ['S', 'A'].includes(hero.tier)) {
        reasons.push(`${hero.tier}-tier in current meta`);
      }
      
      if (hero.win_rate > 0.52) {
        reasons.push(`High win rate (${Math.round(hero.win_rate * 100)}%)`);
      }
      
      if (userProfile?.preferences?.role_preference === hero.role) {
        reasons.push('Matches your preferred role');
      }
      
      return {
        hero_id: hero.hero_id,
        hero_name: hero.name,
        reasons: reasons.length > 0 ? reasons : ['Solid pick for the situation']
      };
    });
  }

  // Item recommendation methods
  getItemRecommendations() {
    try {
      const recommendations = {
        core_items: [],
        situational_items: [],
        luxury_items: []
      };

      // This would integrate with item builds data
      // For now, return basic structure
      
      return recommendations;
    } catch (error) {
      console.error('Error getting item recommendations:', error);
      return { core_items: [], situational_items: [], luxury_items: [] };
    }
  }

  // Update recommendation weights based on user feedback
  updateWeights(feedback) {
    try {
      // This would implement machine learning to adjust weights
      // based on user acceptance/rejection of recommendations
      // Updating recommendation weights with feedback
    } catch (error) {
      console.error('Error updating weights:', error);
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();

// Default export
export default recommendationEngine;