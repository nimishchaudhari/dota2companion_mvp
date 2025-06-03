// Advanced build calculation service for Dota 2
export class BuildCalculationsService {
  constructor() {
    this.items = new Map();
    this.heroes = new Map();
    this.buildTemplates = new Map();
    this.initializeData();
  }

  initializeData() {
    this.setupItemData();
    this.setupHeroData();
    this.setupBuildTemplates();
  }

  setupItemData() {
    // Core item data (simplified for MVP)
    const items = {
      // Basic Items
      1: {
        id: 1,
        name: 'Blink Dagger',
        cost: 2250,
        stats: {},
        effects: ['Blink: 1200 range teleport'],
        buildsFrom: [],
        buildsInto: [],
        category: 'mobility',
        tier: 'core'
      },
      2: {
        id: 2,
        name: 'Black King Bar',
        cost: 4050,
        stats: { damage: 24, strength: 10 },
        effects: ['Avatar: Magic immunity for 10-5 seconds'],
        buildsFrom: [16, 17], // Ogre Axe + Mithril Hammer
        buildsInto: [],
        category: 'defensive',
        tier: 'core'
      },
      3: {
        id: 3,
        name: 'Daedalus',
        cost: 5150,
        stats: { damage: 88 },
        effects: ['Critical Strike: 30% chance for 2.4x damage'],
        buildsFrom: [18, 19], // Crystalys + Demon Edge
        buildsInto: [],
        category: 'damage',
        tier: 'luxury'
      },
      4: {
        id: 4,
        name: 'Heart of Tarrasque',
        cost: 5000,
        stats: { health: 1060, strength: 45 },
        effects: ['Health Regeneration: 2% of max health per second'],
        buildsFrom: [20, 21], // Vitality Booster + Reaver
        buildsInto: [],
        category: 'health',
        tier: 'luxury'
      },
      5: {
        id: 5,
        name: 'Scythe of Vyse',
        cost: 5675,
        stats: { intelligence: 35, mana: 350, manaRegen: 5 },
        effects: ['Hex: Transform enemy into pig for 3.5 seconds'],
        buildsFrom: [22, 23], // Ultimate Orb + Mystic Staff
        buildsInto: [],
        category: 'utility',
        tier: 'luxury'
      },
      6: {
        id: 6,
        name: 'Power Treads',
        cost: 1400,
        stats: { attackSpeed: 25, moveSpeed: 45, selectedAttribute: 9 },
        effects: ['Switch Attribute: Toggle between +9 Str/Agi/Int'],
        buildsFrom: [24, 25], // Boots + Belt of Strength
        buildsInto: [],
        category: 'boots',
        tier: 'early'
      },
      7: {
        id: 7,
        name: 'Battle Fury',
        cost: 4125,
        stats: { damage: 65, healthRegen: 7, manaRegen: 4.5 },
        effects: ['Cleave: 70% damage in 280 radius'],
        buildsFrom: [26, 27], // Perseverance + Demon Edge
        buildsInto: [],
        category: 'farming',
        tier: 'core'
      },
      8: {
        id: 8,
        name: 'Aghanim\'s Scepter',
        cost: 4200,
        stats: { allAttributes: 10, health: 350, mana: 350 },
        effects: ['Ability Upgrade: Upgrades ultimate ability'],
        buildsFrom: [28, 29], // Ultimate Orb + Point Booster
        buildsInto: [],
        category: 'utility',
        tier: 'situational'
      },
      9: {
        id: 9,
        name: 'Divine Rapier',
        cost: 5600,
        stats: { damage: 350 },
        effects: ['Everlasting: Drops on death', 'True Strike: Cannot miss'],
        buildsFrom: [30, 31], // Sacred Relic + Demon Edge
        buildsInto: [],
        category: 'damage',
        tier: 'luxury'
      },
      10: {
        id: 10,
        name: 'Radiance',
        cost: 5150,
        stats: { damage: 65 },
        effects: ['Burn: 60 DPS in 700 radius', 'Miss Chance: 17%'],
        buildsFrom: [32], // Sacred Relic
        buildsInto: [],
        category: 'farming',
        tier: 'core'
      },
      // Component items
      16: { id: 16, name: 'Ogre Axe', cost: 1000, stats: { strength: 10 } },
      17: { id: 17, name: 'Mithril Hammer', cost: 1600, stats: { damage: 24 } },
      18: { id: 18, name: 'Crystalys', cost: 2120, stats: { damage: 38 } },
      19: { id: 19, name: 'Demon Edge', cost: 2200, stats: { damage: 46 } },
      20: { id: 20, name: 'Vitality Booster', cost: 1100, stats: { health: 275 } },
      21: { id: 21, name: 'Reaver', cost: 3000, stats: { strength: 25 } },
      22: { id: 22, name: 'Ultimate Orb', cost: 2050, stats: { allAttributes: 10 } },
      23: { id: 23, name: 'Mystic Staff', cost: 2700, stats: { intelligence: 25 } },
      24: { id: 24, name: 'Boots of Speed', cost: 500, stats: { moveSpeed: 45 } },
      25: { id: 25, name: 'Belt of Strength', cost: 450, stats: { strength: 6 } },
      26: { id: 26, name: 'Perseverance', cost: 1700, stats: { healthRegen: 5, manaRegen: 4.5 } },
      27: { id: 27, name: 'Demon Edge', cost: 2200, stats: { damage: 46 } },
      28: { id: 28, name: 'Ultimate Orb', cost: 2050, stats: { allAttributes: 10 } },
      29: { id: 29, name: 'Point Booster', cost: 1200, stats: { health: 175, mana: 175 } },
      30: { id: 30, name: 'Sacred Relic', cost: 3800, stats: { damage: 60 } },
      31: { id: 31, name: 'Demon Edge', cost: 2200, stats: { damage: 46 } },
      32: { id: 32, name: 'Sacred Relic', cost: 3800, stats: { damage: 60 } }
    };

    for (const [id, item] of Object.entries(items)) {
      this.items.set(parseInt(id), item);
    }
  }

  setupHeroData() {
    // Simplified hero data for calculations
    const heroes = {
      1: { // Anti-Mage
        id: 1,
        name: 'Anti-Mage',
        baseStats: { strength: 23, agility: 24, intelligence: 12 },
        primaryAttribute: 'agility',
        baseAttackDamage: [29, 33],
        baseArmor: 0,
        baseMoveSpeed: 315,
        attackRange: 150,
        baseAttackTime: 1.4,
        strGain: 1.3,
        agiGain: 2.9,
        intGain: 1.8
      },
      8: { // Juggernaut
        id: 8,
        name: 'Juggernaut',
        baseStats: { strength: 21, agility: 20, intelligence: 14 },
        primaryAttribute: 'agility',
        baseAttackDamage: [33, 37],
        baseArmor: 0,
        baseMoveSpeed: 305,
        attackRange: 150,
        baseAttackTime: 1.4,
        strGain: 2.0,
        agiGain: 2.4,
        intGain: 1.4
      },
      11: { // Shadow Fiend
        id: 11,
        name: 'Shadow Fiend',
        baseStats: { strength: 18, agility: 20, intelligence: 18 },
        primaryAttribute: 'agility',
        baseAttackDamage: [35, 41],
        baseArmor: -1,
        baseMoveSpeed: 305,
        attackRange: 500,
        baseAttackTime: 1.7,
        strGain: 2.4,
        agiGain: 3.2,
        intGain: 2.0
      }
    };

    for (const [id, hero] of Object.entries(heroes)) {
      this.heroes.set(parseInt(id), hero);
    }
  }

  setupBuildTemplates() {
    const templates = {
      'anti-mage-farming': {
        heroId: 1,
        name: 'Anti-Mage Farming Build',
        description: 'Classic farming build focusing on Battle Fury and late-game scaling',
        items: [6, 7, 3, 2, 4], // Treads, BF, Daedalus, BKB, Heart
        timings: [5, 15, 25, 30, 40], // Minutes
        purpose: 'farming'
      },
      'juggernaut-fighting': {
        heroId: 8,
        name: 'Juggernaut Fighting Build',
        description: 'Early fighting build with sustain and damage',
        items: [6, 2, 3, 1, 8], // Treads, BKB, Daedalus, Blink, Aghs
        timings: [5, 20, 28, 35, 40],
        purpose: 'fighting'
      }
    };

    for (const [id, template] of Object.entries(templates)) {
      this.buildTemplates.set(id, template);
    }
  }

  // Build calculation methods
  calculateBuildStats(heroId, itemIds, level = 25) {
    const hero = this.heroes.get(heroId);
    if (!hero) return null;

    // Calculate hero stats at level
    const heroStats = this.calculateHeroStatsAtLevel(hero, level);
    
    // Add item stats
    const itemStats = this.calculateItemStats(itemIds);
    
    // Combine stats
    const totalStats = {
      strength: heroStats.strength + itemStats.strength,
      agility: heroStats.agility + itemStats.agility,
      intelligence: heroStats.intelligence + itemStats.intelligence,
      damage: heroStats.damage + itemStats.damage,
      health: heroStats.health + itemStats.health,
      mana: heroStats.mana + itemStats.mana,
      armor: heroStats.armor + itemStats.armor,
      attackSpeed: heroStats.attackSpeed + itemStats.attackSpeed,
      moveSpeed: heroStats.moveSpeed + itemStats.moveSpeed,
      healthRegen: heroStats.healthRegen + itemStats.healthRegen,
      manaRegen: heroStats.manaRegen + itemStats.manaRegen
    };

    // Calculate derived stats
    const derivedStats = this.calculateDerivedStats(totalStats, hero);
    
    return {
      ...totalStats,
      ...derivedStats,
      cost: this.calculateBuildCost(itemIds),
      effects: this.getItemEffects(itemIds)
    };
  }

  calculateHeroStatsAtLevel(hero, level) {
    const statsGain = level - 1;
    
    const strength = hero.baseStats.strength + (hero.strGain * statsGain);
    const agility = hero.baseStats.agility + (hero.agiGain * statsGain);
    const intelligence = hero.baseStats.intelligence + (hero.intGain * statsGain);
    
    const health = 120 + (strength * 22);
    const mana = 75 + (intelligence * 12);
    const damage = (hero.baseAttackDamage[0] + hero.baseAttackDamage[1]) / 2;
    const armor = hero.baseArmor + (agility * 0.167);
    const attackSpeed = 100 + agility;
    const moveSpeed = hero.baseMoveSpeed;
    const healthRegen = 0.25 + (strength * 0.1);
    const manaRegen = 0.01 + (intelligence * 0.05);

    return {
      strength,
      agility,
      intelligence,
      health,
      mana,
      damage,
      armor,
      attackSpeed,
      moveSpeed,
      healthRegen,
      manaRegen
    };
  }

  calculateItemStats(itemIds) {
    const stats = {
      strength: 0,
      agility: 0,
      intelligence: 0,
      allAttributes: 0,
      damage: 0,
      health: 0,
      mana: 0,
      armor: 0,
      attackSpeed: 0,
      moveSpeed: 0,
      healthRegen: 0,
      manaRegen: 0
    };

    itemIds.forEach(itemId => {
      const item = this.items.get(itemId);
      if (item && item.stats) {
        Object.keys(stats).forEach(stat => {
          if (item.stats[stat]) {
            stats[stat] += item.stats[stat];
          }
        });
      }
    });

    // Convert allAttributes to individual attributes
    if (stats.allAttributes > 0) {
      stats.strength += stats.allAttributes;
      stats.agility += stats.allAttributes;
      stats.intelligence += stats.allAttributes;
    }

    return stats;
  }

  calculateDerivedStats(stats, hero) {
    // Calculate effective health and damage
    const effectiveHealth = stats.health / (1 - (0.06 * stats.armor) / (1 + 0.06 * Math.abs(stats.armor)));
    
    // Primary attribute damage bonus
    let primaryAttributeDamage = 0;
    switch (hero.primaryAttribute) {
      case 'strength':
        primaryAttributeDamage = stats.strength;
        break;
      case 'agility':
        primaryAttributeDamage = stats.agility;
        break;
      case 'intelligence':
        primaryAttributeDamage = stats.intelligence;
        break;
    }

    const totalDamage = stats.damage + primaryAttributeDamage;
    const dps = totalDamage * (stats.attackSpeed / 100) / hero.baseAttackTime;

    return {
      effectiveHealth,
      totalDamage,
      dps,
      physicalReduction: (0.06 * stats.armor) / (1 + 0.06 * Math.abs(stats.armor))
    };
  }

  calculateBuildCost(itemIds) {
    return itemIds.reduce((total, itemId) => {
      const item = this.items.get(itemId);
      return total + (item ? item.cost : 0);
    }, 0);
  }

  getItemEffects(itemIds) {
    const effects = [];
    itemIds.forEach(itemId => {
      const item = this.items.get(itemId);
      if (item && item.effects) {
        effects.push(...item.effects);
      }
    });
    return effects;
  }

  // Damage calculation methods
  calculateDamageOutput(attackerStats, targetStats, attackCount = 1) {
    const damage = attackerStats.totalDamage;
    const armor = targetStats.armor;
    const physicalReduction = (0.06 * armor) / (1 + 0.06 * Math.abs(armor));
    
    const damageAfterReduction = damage * (1 - physicalReduction);
    const totalDamage = damageAfterReduction * attackCount;
    
    return {
      rawDamage: damage * attackCount,
      damageAfterArmor: totalDamage,
      physicalReduction,
      damageReduced: (damage * attackCount) - totalDamage
    };
  }

  calculateDPS(heroStats, targetArmor = 0) {
    const damage = heroStats.totalDamage;
    const attackSpeed = heroStats.attackSpeed / 100;
    const physicalReduction = (0.06 * targetArmor) / (1 + 0.06 * Math.abs(targetArmor));
    
    const effectiveDamage = damage * (1 - physicalReduction);
    const dps = effectiveDamage * attackSpeed;
    
    return {
      dps,
      effectiveDamage,
      attacksPerSecond: attackSpeed,
      physicalReduction
    };
  }

  // Gold efficiency analysis
  calculateGoldEfficiency(itemId) {
    const item = this.items.get(itemId);
    if (!item) return null;

    // Base stat values (gold per point)
    const statValues = {
      strength: 25,
      agility: 25,
      intelligence: 25,
      damage: 53,
      health: 2.75,
      mana: 1.33,
      armor: 175,
      attackSpeed: 16,
      moveSpeed: 13,
      healthRegen: 125,
      manaRegen: 140
    };

    let statValue = 0;
    if (item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (statValues[stat]) {
          statValue += value * statValues[stat];
        }
      });
    }

    const efficiency = (statValue / item.cost) * 100;
    
    return {
      statValue,
      cost: item.cost,
      efficiency,
      effectiveValue: item.effects ? item.effects.length * 500 : 0 // Rough estimate for effects
    };
  }

  // Build timing analysis
  calculateBuildTiming(itemIds, farmRate = 500) { // GPM
    const items = itemIds.map(id => this.items.get(id)).filter(Boolean);
    
    let currentTime = 0;
    let totalCost = 0;
    const timings = [];

    items.forEach(item => {
      totalCost += item.cost;
      currentTime = totalCost / farmRate * 60; // Convert to seconds
      
      timings.push({
        itemId: item.id,
        itemName: item.name,
        cost: item.cost,
        timing: currentTime / 60, // Convert to minutes
        totalCost
      });
    });

    return {
      timings,
      totalCost,
      totalTime: currentTime / 60,
      averageGPM: farmRate
    };
  }

  // Build comparison
  compareBuildVariants(variants) {
    return variants.map(variant => {
      const stats = this.calculateBuildStats(variant.heroId, variant.items, variant.level || 25);
      const timing = this.calculateBuildTiming(variant.items, variant.farmRate || 500);
      const efficiency = variant.items.reduce((total, itemId) => {
        const eff = this.calculateGoldEfficiency(itemId);
        return total + (eff ? eff.efficiency : 0);
      }, 0) / variant.items.length;

      return {
        ...variant,
        stats,
        timing,
        efficiency,
        score: this.calculateBuildScore(stats, timing, efficiency)
      };
    });
  }

  calculateBuildScore(stats, timing, efficiency) {
    // Simple scoring algorithm (can be improved)
    const dpsScore = stats.dps / 100;
    const tankScore = stats.effectiveHealth / 1000;
    const timingScore = Math.max(0, 50 - timing.totalTime);
    const efficiencyScore = efficiency / 10;
    
    return dpsScore + tankScore + timingScore + efficiencyScore;
  }

  // Item recommendation
  recommendItems(heroId, currentItems = [], gamePhase = 'mid', budget = 5000) {
    const hero = this.heroes.get(heroId);
    if (!hero) return [];

    const currentItemIds = currentItems.map(item => item.id || item);
    const availableItems = Array.from(this.items.values()).filter(item => 
      !currentItemIds.includes(item.id) && 
      item.cost <= budget &&
      this.isItemSuitableForHero(item, hero, gamePhase)
    );

    return availableItems
      .map(item => {
        const newBuild = [...currentItemIds, item.id];
        const stats = this.calculateBuildStats(heroId, newBuild);
        const efficiency = this.calculateGoldEfficiency(item.id);
        
        return {
          item,
          stats,
          efficiency,
          impact: this.calculateItemImpact(heroId, currentItemIds, item.id),
          suitability: this.calculateItemSuitability(item, hero, gamePhase)
        };
      })
      .sort((a, b) => (b.impact.overall + b.suitability) - (a.impact.overall + a.suitability))
      .slice(0, 10);
  }

  isItemSuitableForHero(item, hero, gamePhase) {
    // Basic suitability logic
    if (gamePhase === 'early' && item.tier === 'luxury') return false;
    if (gamePhase === 'late' && item.tier === 'early') return false;
    
    // Attribute matching
    if (hero.primaryAttribute === 'agility' && item.category === 'damage') return true;
    if (hero.primaryAttribute === 'intelligence' && item.category === 'utility') return true;
    if (hero.primaryAttribute === 'strength' && item.category === 'health') return true;
    
    return true;
  }

  calculateItemImpact(heroId, currentItems, newItemId) {
    const beforeStats = this.calculateBuildStats(heroId, currentItems);
    const afterStats = this.calculateBuildStats(heroId, [...currentItems, newItemId]);
    
    if (!beforeStats || !afterStats) return { overall: 0 };

    return {
      dpsIncrease: afterStats.dps - beforeStats.dps,
      healthIncrease: afterStats.effectiveHealth - beforeStats.effectiveHealth,
      damageIncrease: afterStats.totalDamage - beforeStats.totalDamage,
      overall: ((afterStats.dps - beforeStats.dps) * 0.4) + 
               ((afterStats.effectiveHealth - beforeStats.effectiveHealth) / 100 * 0.3) +
               ((afterStats.totalDamage - beforeStats.totalDamage) * 0.3)
    };
  }

  calculateItemSuitability(item, hero, gamePhase) {
    let score = 0;
    
    // Phase appropriateness
    if ((gamePhase === 'early' && item.tier === 'early') ||
        (gamePhase === 'mid' && item.tier === 'core') ||
        (gamePhase === 'late' && item.tier === 'luxury')) {
      score += 10;
    }
    
    // Hero attribute synergy
    if ((hero.primaryAttribute === 'agility' && item.stats?.agility) ||
        (hero.primaryAttribute === 'strength' && item.stats?.strength) ||
        (hero.primaryAttribute === 'intelligence' && item.stats?.intelligence)) {
      score += 5;
    }
    
    return score;
  }

  // Get all items by category
  getItemsByCategory(category) {
    return Array.from(this.items.values()).filter(item => item.category === category);
  }

  // Get build templates
  getBuildTemplates(heroId = null) {
    const templates = Array.from(this.buildTemplates.values());
    return heroId ? templates.filter(template => template.heroId === heroId) : templates;
  }

  // Get item by ID
  getItem(itemId) {
    return this.items.get(itemId);
  }

  // Get all items
  getAllItems() {
    return Array.from(this.items.values());
  }
}

// Create singleton instance
export const buildCalculations = new BuildCalculationsService();