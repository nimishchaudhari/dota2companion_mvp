// Advanced draft analysis service for Dota 2
export class DraftAnalysisService {
  constructor() {
    this.heroData = new Map();
    this.heroCounters = new Map();
    this.heroSynergies = new Map();
    this.metaData = {
      patchVersion: '7.37',
      lastUpdated: Date.now(),
      tierList: new Map(),
      pickRates: new Map(),
      winRates: new Map()
    };
    
    this.initializeData();
  }

  async initializeData() {
    // Initialize hero counter data (simplified for MVP)
    this.setupHeroCounters();
    this.setupHeroSynergies();
    this.setupMetaData();
  }

  setupHeroCounters() {
    // Counter relationships based on Dota 2 meta analysis
    const counters = {
      // Pudge counters and is countered by
      14: { // Pudge
        counters: [8, 34, 40], // Juggernaut, Tinker, Venomancer
        counteredBy: [1, 11, 33] // Anti-Mage, Shadow Fiend, Tinker
      },
      // Anti-Mage
      1: {
        counters: [25, 50, 101], // Lina, Dazzle, Skywrath Mage
        counteredBy: [5, 26, 73] // Crystal Maiden, Lion, Treant Protector
      },
      // Crystal Maiden
      5: {
        counters: [1, 8, 42], // Anti-Mage, Juggernaut, Wraith King
        counteredBy: [11, 17, 43] // Shadow Fiend, Storm Spirit, Death Prophet
      },
      // Add more hero counter relationships
      8: { // Juggernaut
        counters: [14, 21, 38], // Pudge, Kunkka, Broodmother
        counteredBy: [2, 31, 67] // Axe, Lich, Invoker
      }
    };

    this.heroCounters = new Map(Object.entries(counters).map(([id, data]) => [parseInt(id), data]));
  }

  setupHeroSynergies() {
    // Hero synergy relationships
    const synergies = {
      14: { // Pudge
        strongWith: [31, 26, 30], // Lich, Lion, Witch Doctor
        weakWith: [1, 8, 40] // Anti-Mage, Juggernaut, Venomancer
      },
      1: { // Anti-Mage
        strongWith: [5, 31, 54], // Crystal Maiden, Lich, Invoker
        weakWith: [14, 21, 15] // Pudge, Kunkka, Razor
      },
      5: { // Crystal Maiden
        strongWith: [1, 8, 42], // Anti-Mage, Juggernaut, Wraith King
        weakWith: [11, 17, 43] // Shadow Fiend, Storm Spirit, Death Prophet
      }
    };

    this.heroSynergies = new Map(Object.entries(synergies).map(([id, data]) => [parseInt(id), data]));
  }

  setupMetaData() {
    // Current meta tier list (simplified)
    const tierList = {
      'S': [1, 8, 11, 17, 67], // Anti-Mage, Juggernaut, Shadow Fiend, Storm Spirit, Invoker
      'A': [5, 14, 21, 26, 31], // Crystal Maiden, Pudge, Kunkka, Lion, Lich
      'B': [2, 15, 25, 30, 40], // Axe, Razor, Lina, Witch Doctor, Venomancer
      'C': [34, 38, 42, 43, 50], // Tinker, Broodmother, Wraith King, Death Prophet, Dazzle
      'D': [33, 54, 73, 101, 102] // Jakiro, Invoker, Treant Protector, Skywrath Mage, Abaddon
    };

    // Convert to map with hero_id -> tier
    for (const [tier, heroes] of Object.entries(tierList)) {
      heroes.forEach(heroId => {
        this.metaData.tierList.set(heroId, tier);
      });
    }

    // Mock pick and win rates
    const heroIds = [1, 2, 5, 8, 11, 14, 15, 17, 21, 25, 26, 30, 31, 33, 34, 38, 40, 42, 43, 50, 54, 67, 73, 101, 102];
    heroIds.forEach(heroId => {
      this.metaData.pickRates.set(heroId, Math.random() * 0.3 + 0.1); // 10-40% pick rate
      this.metaData.winRates.set(heroId, Math.random() * 0.2 + 0.45); // 45-65% win rate
    });
  }

  // Draft analysis methods
  analyzeCurrentDraft(radiantPicks = [], direPicks = [], radiantBans = [], direBans = []) {
    const analysis = {
      teamComposition: this.analyzeTeamComposition(radiantPicks, direPicks),
      powerSpikes: this.analyzePowerSpikes(radiantPicks, direPicks),
      winProbability: this.calculateWinProbability(radiantPicks, direPicks),
      recommendations: this.generateRecommendations(radiantPicks, direPicks, radiantBans, direBans),
      threats: this.identifyThreats(radiantPicks, direPicks),
      synergies: this.calculateTeamSynergy(radiantPicks, direPicks)
    };

    return analysis;
  }

  analyzeTeamComposition(radiantPicks, direPicks) {
    const analyzeTeam = (picks) => {
      const composition = {
        carry: 0,
        support: 0,
        initiator: 0,
        disabler: 0,
        jungler: 0,
        durable: 0,
        escape: 0,
        pusher: 0,
        nuker: 0
      };

      picks.forEach(heroId => {
        // Mock role data - in real implementation, get from hero data
        const roles = this.getHeroRoles(heroId);
        roles.forEach(role => {
          if (composition[role.toLowerCase()] !== undefined) {
            composition[role.toLowerCase()]++;
          }
        });
      });

      return composition;
    };

    return {
      radiant: analyzeTeam(radiantPicks),
      dire: analyzeTeam(direPicks)
    };
  }

  getHeroRoles(heroId) {
    // Mock hero roles - in real implementation, get from actual hero data
    const roleMap = {
      1: ['Carry', 'Escape'], // Anti-Mage
      2: ['Initiator', 'Durable'], // Axe
      5: ['Support', 'Disabler', 'Nuker'], // Crystal Maiden
      8: ['Carry', 'Pusher'], // Juggernaut
      11: ['Carry', 'Nuker'], // Shadow Fiend
      14: ['Disabler', 'Initiator', 'Durable'], // Pudge
      15: ['Carry', 'Durable'], // Razor
      17: ['Carry', 'Escape', 'Nuker'], // Storm Spirit
      21: ['Initiator', 'Disabler', 'Durable'], // Kunkka
      25: ['Support', 'Nuker', 'Disabler'], // Lina
      26: ['Support', 'Disabler'], // Lion
      30: ['Support', 'Disabler'], // Witch Doctor
      31: ['Support', 'Nuker', 'Disabler'], // Lich
      33: ['Support', 'Disabler', 'Nuker'], // Jakiro
      34: ['Nuker', 'Pusher'], // Tinker
      38: ['Carry', 'Pusher', 'Escape'], // Broodmother
      40: ['Support', 'Nuker', 'Pusher'], // Venomancer
      42: ['Carry', 'Durable'], // Wraith King
      43: ['Carry', 'Pusher', 'Nuker'], // Death Prophet
      50: ['Support'], // Dazzle
      54: ['Carry', 'Nuker', 'Disabler'], // Invoker
      67: ['Carry', 'Nuker', 'Disabler'], // Invoker (duplicate?)
      73: ['Support', 'Durable', 'Escape'], // Treant Protector
      101: ['Support', 'Nuker'], // Skywrath Mage
      102: ['Support', 'Durable'] // Abaddon
    };

    return roleMap[heroId] || ['Unknown'];
  }

  analyzePowerSpikes(radiantPicks, direPicks) {
    const getTeamPowerSpikes = (picks) => {
      return {
        early: picks.filter(heroId => this.isEarlyGameHero(heroId)).length / picks.length,
        mid: picks.filter(heroId => this.isMidGameHero(heroId)).length / picks.length,
        late: picks.filter(heroId => this.isLateGameHero(heroId)).length / picks.length
      };
    };

    return {
      radiant: getTeamPowerSpikes(radiantPicks),
      dire: getTeamPowerSpikes(direPicks)
    };
  }

  isEarlyGameHero(heroId) {
    const earlyGameHeroes = [5, 25, 26, 30, 31, 40]; // CM, Lina, Lion, WD, Lich, Veno
    return earlyGameHeroes.includes(heroId);
  }

  isMidGameHero(heroId) {
    const midGameHeroes = [2, 8, 14, 15, 21, 34]; // Axe, Jugg, Pudge, Razor, Kunkka, Tinker
    return midGameHeroes.includes(heroId);
  }

  isLateGameHero(heroId) {
    const lateGameHeroes = [1, 11, 17, 42, 54, 67]; // AM, SF, Storm, WK, Invoker
    return lateGameHeroes.includes(heroId);
  }

  calculateWinProbability(radiantPicks, direPicks) {
    let radiantScore = 0;
    let direScore = 0;

    // Base score from hero tiers
    radiantPicks.forEach(heroId => {
      const tier = this.metaData.tierList.get(heroId) || 'C';
      const tierScore = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[tier];
      radiantScore += tierScore;
    });

    direPicks.forEach(heroId => {
      const tier = this.metaData.tierList.get(heroId) || 'C';
      const tierScore = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[tier];
      direScore += tierScore;
    });

    // Calculate counter advantages
    radiantPicks.forEach(radiantHero => {
      direPicks.forEach(direHero => {
        const counterData = this.heroCounters.get(radiantHero);
        if (counterData?.counters?.includes(direHero)) {
          radiantScore += 1;
        }
        if (counterData?.counteredBy?.includes(direHero)) {
          radiantScore -= 1;
        }
      });
    });

    // Calculate team synergy bonuses
    const radiantSynergy = this.calculateTeamSynergyScore(radiantPicks);
    const direSynergy = this.calculateTeamSynergyScore(direPicks);
    
    radiantScore += radiantSynergy;
    direScore += direSynergy;

    // Normalize to probability
    const totalScore = radiantScore + direScore;
    const radiantWinProbability = totalScore > 0 ? radiantScore / totalScore : 0.5;

    return {
      radiant: Math.max(0.1, Math.min(0.9, radiantWinProbability)),
      dire: Math.max(0.1, Math.min(0.9, 1 - radiantWinProbability)),
      confidence: Math.min(radiantPicks.length + direPicks.length, 10) / 10
    };
  }

  calculateTeamSynergyScore(picks) {
    let synergyScore = 0;
    
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        const hero1 = picks[i];
        const hero2 = picks[j];
        
        const synergy1 = this.heroSynergies.get(hero1);
        if (synergy1?.strongWith?.includes(hero2)) {
          synergyScore += 1;
        }
        if (synergy1?.weakWith?.includes(hero2)) {
          synergyScore -= 0.5;
        }
      }
    }
    
    return synergyScore;
  }

  generateRecommendations(radiantPicks, direPicks, radiantBans, direBans) {
    const allBanned = [...radiantBans, ...direBans];
    const allPicked = [...radiantPicks, ...direPicks];
    const unavailable = [...allBanned, ...allPicked];

    const recommendations = {
      radiantPicks: [],
      direPicks: [],
      radiantBans: [],
      direBans: []
    };

    // Get available heroes (mock hero pool)
    const allHeroes = [1, 2, 5, 8, 11, 14, 15, 17, 21, 25, 26, 30, 31, 33, 34, 38, 40, 42, 43, 50, 54, 67, 73, 101, 102];
    const availableHeroes = allHeroes.filter(heroId => !unavailable.includes(heroId));

    // Recommend picks for Radiant
    recommendations.radiantPicks = this.getPickRecommendations(radiantPicks, direPicks, availableHeroes, 'radiant');
    
    // Recommend picks for Dire
    recommendations.direPicks = this.getPickRecommendations(direPicks, radiantPicks, availableHeroes, 'dire');

    // Recommend bans
    recommendations.radiantBans = this.getBanRecommendations(radiantPicks, direPicks, availableHeroes);
    recommendations.direBans = this.getBanRecommendations(direPicks, radiantPicks, availableHeroes);

    return recommendations;
  }

  getPickRecommendations(teamPicks, enemyPicks, availableHeroes, team) {
    const recommendations = [];

    availableHeroes.forEach(heroId => {
      let score = 0;

      // Base score from tier
      const tier = this.metaData.tierList.get(heroId) || 'C';
      score += { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 }[tier];

      // Counter score against enemies
      enemyPicks.forEach(enemyHero => {
        const counterData = this.heroCounters.get(heroId);
        if (counterData?.counters?.includes(enemyHero)) {
          score += 2;
        }
        if (counterData?.counteredBy?.includes(enemyHero)) {
          score -= 1;
        }
      });

      // Synergy score with team
      teamPicks.forEach(teamHero => {
        const synergyData = this.heroSynergies.get(heroId);
        if (synergyData?.strongWith?.includes(teamHero)) {
          score += 1;
        }
        if (synergyData?.weakWith?.includes(teamHero)) {
          score -= 0.5;
        }
      });

      // Role diversity bonus
      const teamRoles = this.getTeamRoles(teamPicks);
      const heroRoles = this.getHeroRoles(heroId);
      const missingRoles = this.getMissingRoles(teamRoles);
      
      heroRoles.forEach(role => {
        if (missingRoles.includes(role.toLowerCase())) {
          score += 1;
        }
      });

      if (score > 0) {
        recommendations.push({
          heroId,
          score,
          reasons: this.getPickReasons(heroId, teamPicks, enemyPicks)
        });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(rec => ({
        heroId: rec.heroId,
        score: rec.score,
        reasons: rec.reasons,
        tier: this.metaData.tierList.get(rec.heroId) || 'C'
      }));
  }

  getTeamRoles(picks) {
    const roles = [];
    picks.forEach(heroId => {
      roles.push(...this.getHeroRoles(heroId));
    });
    return roles;
  }

  getMissingRoles(currentRoles) {
    const essentialRoles = ['carry', 'support', 'initiator', 'disabler'];
    const currentLower = currentRoles.map(r => r.toLowerCase());
    return essentialRoles.filter(role => !currentLower.includes(role));
  }

  getPickReasons(heroId, teamPicks, enemyPicks) {
    const reasons = [];
    const tier = this.metaData.tierList.get(heroId) || 'C';
    
    if (['S', 'A'].includes(tier)) {
      reasons.push(`Strong in current meta (Tier ${tier})`);
    }

    // Check counters
    const counterData = this.heroCounters.get(heroId);
    if (counterData?.counters) {
      const countered = enemyPicks.filter(id => counterData.counters.includes(id));
      if (countered.length > 0) {
        reasons.push(`Counters ${countered.length} enemy heroes`);
      }
    }

    // Check synergies
    const synergyData = this.heroSynergies.get(heroId);
    if (synergyData?.strongWith) {
      const synergistic = teamPicks.filter(id => synergyData.strongWith.includes(id));
      if (synergistic.length > 0) {
        reasons.push(`Good synergy with ${synergistic.length} team heroes`);
      }
    }

    return reasons.slice(0, 3); // Limit to 3 reasons
  }

  getBanRecommendations(teamPicks, enemyPicks, availableHeroes) {
    const recommendations = [];

    availableHeroes.forEach(heroId => {
      let score = 0;

      // High tier heroes are worth banning
      const tier = this.metaData.tierList.get(heroId) || 'C';
      if (tier === 'S') score += 3;
      if (tier === 'A') score += 2;

      // Heroes that counter our team
      teamPicks.forEach(teamHero => {
        const counterData = this.heroCounters.get(heroId);
        if (counterData?.counters?.includes(teamHero)) {
          score += 2;
        }
      });

      // Popular picks
      const pickRate = this.metaData.pickRates.get(heroId) || 0;
      if (pickRate > 0.2) {
        score += 1;
      }

      if (score > 0) {
        recommendations.push({
          heroId,
          score,
          reasons: this.getBanReasons(heroId, teamPicks)
        });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(rec => ({
        heroId: rec.heroId,
        score: rec.score,
        reasons: rec.reasons,
        tier: this.metaData.tierList.get(rec.heroId) || 'C'
      }));
  }

  getBanReasons(heroId, teamPicks) {
    const reasons = [];
    const tier = this.metaData.tierList.get(heroId) || 'C';
    
    if (tier === 'S') {
      reasons.push('Meta defining hero');
    }

    const counterData = this.heroCounters.get(heroId);
    if (counterData?.counters) {
      const threatened = teamPicks.filter(id => counterData.counters.includes(id));
      if (threatened.length > 0) {
        reasons.push(`Counters ${threatened.length} of your heroes`);
      }
    }

    const pickRate = this.metaData.pickRates.get(heroId) || 0;
    if (pickRate > 0.25) {
      reasons.push('Popular pick in current meta');
    }

    return reasons.slice(0, 2);
  }

  identifyThreats(radiantPicks, direPicks) {
    const threats = {
      radiant: [],
      dire: []
    };

    // Threats to Radiant from Dire picks
    direPicks.forEach(direHero => {
      radiantPicks.forEach(radiantHero => {
        const counterData = this.heroCounters.get(direHero);
        if (counterData?.counters?.includes(radiantHero)) {
          threats.radiant.push({
            threatHero: direHero,
            threatenedHero: radiantHero,
            severity: 'high'
          });
        }
      });
    });

    // Threats to Dire from Radiant picks
    radiantPicks.forEach(radiantHero => {
      direPicks.forEach(direHero => {
        const counterData = this.heroCounters.get(radiantHero);
        if (counterData?.counters?.includes(direHero)) {
          threats.dire.push({
            threatHero: radiantHero,
            threatenedHero: direHero,
            severity: 'high'
          });
        }
      });
    });

    return threats;
  }

  calculateTeamSynergy(radiantPicks, direPicks) {
    return {
      radiant: {
        score: this.calculateTeamSynergyScore(radiantPicks),
        combinations: this.findSynergyCombinations(radiantPicks)
      },
      dire: {
        score: this.calculateTeamSynergyScore(direPicks),
        combinations: this.findSynergyCombinations(direPicks)
      }
    };
  }

  findSynergyCombinations(picks) {
    const combinations = [];
    
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        const hero1 = picks[i];
        const hero2 = picks[j];
        
        const synergy1 = this.heroSynergies.get(hero1);
        if (synergy1?.strongWith?.includes(hero2)) {
          combinations.push({
            heroes: [hero1, hero2],
            type: 'strong',
            description: this.getSynergyDescription(hero1, hero2)
          });
        }
      }
    }
    
    return combinations;
  }

  getSynergyDescription(hero1, hero2) {
    // Mock synergy descriptions - in real implementation, would have detailed explanations
    const descriptions = {
      [`${hero1}-${hero2}`]: `Strong combination between heroes ${hero1} and ${hero2}`,
      [`${hero2}-${hero1}`]: `Strong combination between heroes ${hero2} and ${hero1}`
    };
    
    return descriptions[`${hero1}-${hero2}`] || descriptions[`${hero2}-${hero1}`] || 'Good synergy';
  }

  // Utility methods
  getHeroTier(heroId) {
    return this.metaData.tierList.get(heroId) || 'C';
  }

  getHeroPickRate(heroId) {
    return this.metaData.pickRates.get(heroId) || 0;
  }

  getHeroWinRate(heroId) {
    return this.metaData.winRates.get(heroId) || 0.5;
  }

  // Real-time draft simulation
  simulateDraftScenarios(currentState, possiblePicks) {
    const scenarios = [];
    
    possiblePicks.slice(0, 5).forEach(heroId => {
      const newRadiantPicks = [...currentState.radiantPicks, heroId];
      const analysis = this.analyzeCurrentDraft(
        newRadiantPicks,
        currentState.direPicks,
        currentState.radiantBans,
        currentState.direBans
      );
      
      scenarios.push({
        heroId,
        analysis,
        impact: this.calculatePickImpact(currentState, analysis)
      });
    });
    
    return scenarios.sort((a, b) => b.impact.overall - a.impact.overall);
  }

  calculatePickImpact(beforeState, afterState) {
    const beforeAnalysis = this.analyzeCurrentDraft(
      beforeState.radiantPicks,
      beforeState.direPicks,
      beforeState.radiantBans,
      beforeState.direBans
    );
    
    return {
      winProbabilityChange: afterState.winProbability.radiant - beforeAnalysis.winProbability.radiant,
      synergyImprovement: afterState.synergies.radiant.score - beforeAnalysis.synergies.radiant.score,
      countersGained: afterState.threats.dire.length - beforeAnalysis.threats.dire.length,
      overall: (afterState.winProbability.radiant - beforeAnalysis.winProbability.radiant) * 100
    };
  }
}

// Create singleton instance
export const draftAnalysis = new DraftAnalysisService();