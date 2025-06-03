// Advanced hero guide service for Dota 2
export class HeroGuidesService {
  constructor() {
    this.heroes = new Map();
    this.abilities = new Map();
    this.skillBuilds = new Map();
    this.positioningGuides = new Map();
    this.powerSpikes = new Map();
    this.combos = new Map();
    this.initializeData();
  }

  initializeData() {
    this.setupHeroData();
    this.setupAbilities();
    this.setupSkillBuilds();
    this.setupPositioningGuides();
    this.setupPowerSpikes();
    this.setupCombos();
  }

  setupHeroData() {
    const heroes = {
      1: { // Anti-Mage
        id: 1,
        name: 'Anti-Mage',
        localized_name: 'Anti-Mage',
        primary_attr: 'agility',
        attack_type: 'Melee',
        roles: ['Carry', 'Escape'],
        complexity: 1,
        legs: 2
      },
      8: { // Juggernaut
        id: 8,
        name: 'Juggernaut',
        localized_name: 'Juggernaut',
        primary_attr: 'agility',
        attack_type: 'Melee',
        roles: ['Carry', 'Pusher'],
        complexity: 1,
        legs: 2
      },
      11: { // Shadow Fiend
        id: 11,
        name: 'Shadow Fiend',
        localized_name: 'Shadow Fiend',
        primary_attr: 'agility',
        attack_type: 'Ranged',
        roles: ['Carry', 'Nuker'],
        complexity: 2,
        legs: 0
      },
      5: { // Crystal Maiden
        id: 5,
        name: 'Crystal Maiden',
        localized_name: 'Crystal Maiden',
        primary_attr: 'intelligence',
        attack_type: 'Ranged',
        roles: ['Support', 'Disabler', 'Nuker'],
        complexity: 1,
        legs: 2
      },
      14: { // Pudge
        id: 14,
        name: 'Pudge',
        localized_name: 'Pudge',
        primary_attr: 'strength',
        attack_type: 'Melee',
        roles: ['Disabler', 'Initiator', 'Durable'],
        complexity: 2,
        legs: 2
      }
    };

    for (const [id, hero] of Object.entries(heroes)) {
      this.heroes.set(parseInt(id), hero);
    }
  }

  setupAbilities() {
    const abilities = {
      // Anti-Mage
      1: {
        1: { name: 'Mana Break', type: 'passive', description: 'Burns mana and deals damage', maxLevel: 4, manaCost: 0, cooldown: 0 },
        2: { name: 'Blink', type: 'active', description: 'Short range teleportation', maxLevel: 4, manaCost: 60, cooldown: [12, 10, 8, 6] },
        3: { name: 'Counterspell', type: 'active', description: 'Magic resistance and reflection', maxLevel: 4, manaCost: 45, cooldown: 15 },
        4: { name: 'Mana Void', type: 'ultimate', description: 'Deals damage based on missing mana', maxLevel: 3, manaCost: [125, 200, 275], cooldown: [70, 60, 50] }
      },
      // Juggernaut
      8: {
        1: { name: 'Blade Fury', type: 'active', description: 'Spin with magic immunity', maxLevel: 4, manaCost: 110, cooldown: [23, 21, 19, 17] },
        2: { name: 'Healing Ward', type: 'active', description: 'Deployable healing ward', maxLevel: 4, manaCost: 80, cooldown: 60 },
        3: { name: 'Blade Dance', type: 'passive', description: 'Critical strike chance', maxLevel: 4, manaCost: 0, cooldown: 0 },
        4: { name: 'Omnislash', type: 'ultimate', description: 'Jump between enemies', maxLevel: 3, manaCost: [200, 275, 350], cooldown: [130, 120, 110] }
      },
      // Shadow Fiend
      11: {
        1: { name: 'Shadowraze (Near)', type: 'active', description: 'Damage in front (200 range)', maxLevel: 4, manaCost: 90, cooldown: 10 },
        2: { name: 'Shadowraze (Medium)', type: 'active', description: 'Damage in front (450 range)', maxLevel: 4, manaCost: 90, cooldown: 10 },
        3: { name: 'Shadowraze (Far)', type: 'active', description: 'Damage in front (700 range)', maxLevel: 4, manaCost: 90, cooldown: 10 },
        5: { name: 'Necromastery', type: 'passive', description: 'Gains damage from kills', maxLevel: 4, manaCost: 0, cooldown: 0 },
        4: { name: 'Requiem of Souls', type: 'ultimate', description: 'Area damage and debuff', maxLevel: 3, manaCost: [150, 175, 200], cooldown: [120, 110, 100] }
      },
      // Crystal Maiden
      5: {
        1: { name: 'Crystal Nova', type: 'active', description: 'Area damage and slow', maxLevel: 4, manaCost: [100, 120, 140, 160], cooldown: 15 },
        2: { name: 'Frostbite', type: 'active', description: 'Root and damage over time', maxLevel: 4, manaCost: [115, 125, 135, 145], cooldown: [10, 9, 8, 7] },
        3: { name: 'Arcane Aura', type: 'passive', description: 'Mana regeneration aura', maxLevel: 4, manaCost: 0, cooldown: 0 },
        4: { name: 'Freezing Field', type: 'ultimate', description: 'Channeled area damage', maxLevel: 3, manaCost: [200, 400, 600], cooldown: [90, 80, 70] }
      },
      // Pudge
      14: {
        1: { name: 'Meat Hook', type: 'active', description: 'Pull target towards you', maxLevel: 4, manaCost: 110, cooldown: [27, 22, 17, 12] },
        2: { name: 'Rot', type: 'toggle', description: 'Damage aura that affects self', maxLevel: 4, manaCost: 0, cooldown: 0 },
        3: { name: 'Flesh Heap', type: 'passive', description: 'Gains strength and magic resistance', maxLevel: 4, manaCost: 0, cooldown: 0 },
        4: { name: 'Dismember', type: 'ultimate', description: 'Channel to disable and damage', maxLevel: 3, manaCost: [100, 130, 170], cooldown: [30, 25, 20] }
      }
    };

    this.abilities = abilities;
  }

  setupSkillBuilds() {
    const skillBuilds = {
      // Anti-Mage builds
      'anti-mage-farming': {
        heroId: 1,
        name: 'Farming Build',
        description: 'Focus on farming efficiency and escape',
        skillOrder: [2, 1, 2, 1, 2, 4, 2, 1, 1, 3, 4, 3, 3, 3, 4],
        priority: ['Blink max first', 'Mana Break for farming', 'Counterspell for survivability'],
        situational: 'Skip Counterspell if no magic damage threats'
      },
      'anti-mage-fighting': {
        heroId: 1,
        name: 'Fighting Build',
        description: 'Early fighting with more Counterspell',
        skillOrder: [1, 2, 3, 1, 2, 4, 2, 3, 2, 3, 4, 3, 1, 1, 4],
        priority: ['Blink for mobility', 'Counterspell against casters', 'Mana Break for DPS'],
        situational: 'Prioritize Counterspell against heavy magic damage'
      },
      // Juggernaut builds
      'juggernaut-standard': {
        heroId: 8,
        name: 'Standard Build',
        description: 'Balanced approach for laning and fighting',
        skillOrder: [1, 3, 1, 3, 1, 4, 1, 3, 3, 2, 4, 2, 2, 2, 4],
        priority: ['Blade Fury max first', 'Blade Dance for DPS', 'Healing Ward last'],
        situational: 'Max Healing Ward earlier if team needs sustain'
      },
      // Shadow Fiend builds
      'shadow-fiend-standard': {
        heroId: 11,
        name: 'Triple Raze Build',
        description: 'Max all razes for farming and fighting',
        skillOrder: [1, 5, 2, 1, 1, 4, 1, 2, 2, 2, 4, 3, 3, 3, 4],
        priority: ['Near Raze first', 'Medium Raze second', 'Far Raze third', 'Necromastery for damage'],
        situational: 'Level Necromastery earlier if ahead'
      },
      // Crystal Maiden builds
      'crystal-maiden-support': {
        heroId: 5,
        name: 'Support Build',
        description: 'Focus on disables and team utility',
        skillOrder: [2, 1, 2, 3, 2, 4, 2, 1, 1, 1, 4, 3, 3, 3, 4],
        priority: ['Frostbite max first', 'Crystal Nova for damage', 'Arcane Aura for team'],
        situational: 'Max Crystal Nova first if need wave clear'
      },
      // Pudge builds
      'pudge-roaming': {
        heroId: 14,
        name: 'Roaming Build',
        description: 'Focus on hook accuracy and tankiness',
        skillOrder: [1, 3, 1, 2, 1, 4, 1, 3, 3, 3, 4, 2, 2, 2, 4],
        priority: ['Meat Hook max first', 'Flesh Heap for tankiness', 'Rot for damage'],
        situational: 'Level Rot earlier if laning'
      }
    };

    for (const [id, build] of Object.entries(skillBuilds)) {
      this.skillBuilds.set(id, build);
    }
  }

  setupPositioningGuides() {
    const positioning = {
      1: { // Anti-Mage
        laning: {
          early: 'Farm safely behind creeps, use Blink to escape ganks',
          mid: 'Split push side lanes, avoid team fights until items',
          late: 'Position to clean up fights, avoid initiating'
        },
        teamfight: {
          positioning: 'Stay on edges, wait for spells to be used',
          priority: 'Target supports and casters first',
          escape: 'Always have Blink ready for escape route'
        },
        warding: 'Place wards to see ganks coming while farming'
      },
      8: { // Juggernaut
        laning: {
          early: 'Aggressive trading with Blade Fury, secure last hits',
          mid: 'Look for kill opportunities with Omnislash',
          late: 'Front line fighter with magic immunity'
        },
        teamfight: {
          positioning: 'Front to back, use Blade Fury to engage',
          priority: 'Use Omnislash on isolated targets',
          escape: 'Blade Fury for magic immunity and escape'
        },
        warding: 'Ward enemy jungle for pick-offs'
      },
      11: { // Shadow Fiend
        laning: {
          early: 'Use Razes to secure last hits and harass',
          mid: 'Control runes, stack camps for yourself',
          late: 'High ground position for Requiem initiation'
        },
        teamfight: {
          positioning: 'Stay at max range, use Requiem to initiate',
          priority: 'Focus fire on one target at a time',
          escape: 'No escape mechanism, positioning crucial'
        },
        warding: 'Ward both runes, deep wards in enemy jungle'
      },
      5: { // Crystal Maiden
        laning: {
          early: 'Stay far back, use spells to harass and zone',
          mid: 'Smoke gank other lanes, stack camps',
          late: 'Stay hidden until teamfight starts'
        },
        teamfight: {
          positioning: 'Far back, use trees for cover',
          priority: 'Disable key targets, channel ultimate safely',
          escape: 'Always have Force Staff or Glimmer Cape'
        },
        warding: 'Deep wards for team vision, defensive wards for carries'
      },
      14: { // Pudge
        laning: {
          early: 'Roam between lanes, look for hook opportunities',
          mid: 'Smoke gank, control runes',
          late: 'Initiate fights with hook on key targets'
        },
        teamfight: {
          positioning: 'Front line, tank damage for team',
          priority: 'Hook priority targets out of position',
          escape: 'Tankiness allows staying in fight longer'
        },
        warding: 'Ward for hook angles, offensive wards'
      }
    };

    for (const [id, guide] of Object.entries(positioning)) {
      this.positioningGuides.set(parseInt(id), guide);
    }
  }

  setupPowerSpikes() {
    const powerSpikes = {
      1: { // Anti-Mage
        levels: [
          { level: 6, description: 'Mana Void available, can kill low mana targets' },
          { level: 11, description: 'Blink maxed, maximum mobility' },
          { level: 15, description: 'Talent spike, choose based on game' },
          { level: 20, description: 'Second ultimate level, major damage increase' },
          { level: 25, description: 'Final talents, late game peak' }
        ],
        items: [
          { item: 'Battle Fury', timing: '12-15 min', description: 'Farming accelerates dramatically' },
          { item: 'Manta Style', timing: '20-25 min', description: 'Fighting capability, dispel utility' },
          { item: 'Basher/Abyssal', timing: '30-35 min', description: 'Lock down potential' }
        ],
        timing: 'Weak early, strong after 2-3 items'
      },
      8: { // Juggernaut
        levels: [
          { level: 6, description: 'Omnislash available, high kill potential' },
          { level: 7, description: 'Blade Fury maxed, magic immunity peak' },
          { level: 12, description: 'Omnislash level 2, can kill most heroes' },
          { level: 18, description: 'Omnislash level 3, team fight domination' }
        ],
        items: [
          { item: 'Phase Boots', timing: '5-7 min', description: 'Enhanced chasing ability' },
          { item: 'Drum/Yasha', timing: '12-15 min', description: 'Mid game fighting peak' },
          { item: 'Aghanims/BKB', timing: '20-25 min', description: 'Team fight contribution' }
        ],
        timing: 'Strong throughout all phases'
      },
      11: { // Shadow Fiend
        levels: [
          { level: 6, description: 'Requiem available, team fight presence' },
          { level: 7, description: 'Two Razes maxed, farming efficiency' },
          { level: 11, description: 'All Razes maxed, peak farming speed' },
          { level: 12, description: 'Requiem level 2, major damage spike' }
        ],
        items: [
          { item: 'Bottle + Boots', timing: '4-6 min', description: 'Sustain and mobility for mid' },
          { item: 'Shadow Blade/BKB', timing: '15-18 min', description: 'Fighting ability unlocked' },
          { item: 'Daedalus/Satanic', timing: '25-30 min', description: 'Late game carry potential' }
        ],
        timing: 'Weak early, peaks mid-game'
      },
      5: { // Crystal Maiden
        levels: [
          { level: 6, description: 'Freezing Field available, team fight ultimate' },
          { level: 7, description: 'Frostbite maxed, long disable duration' },
          { level: 11, description: 'Crystal Nova maxed, area damage peak' }
        ],
        items: [
          { item: 'Tranquil + Magic Wand', timing: '5-8 min', description: 'Basic survivability' },
          { item: 'Glimmer Cape/Force Staff', timing: '15-20 min', description: 'Positioning tools' },
          { item: 'Aghanims/BKB', timing: '25-30 min', description: 'Late game impact' }
        ],
        timing: 'Strong early, falls off without items'
      },
      14: { // Pudge
        levels: [
          { level: 6, description: 'Dismember available, kill potential' },
          { level: 7, description: 'Hook maxed, minimum cooldown' },
          { level: 11, description: 'Flesh Heap maxed, very tanky' }
        ],
        items: [
          { item: 'Boots + Magic Wand', timing: '5-8 min', description: 'Basic roaming capability' },
          { item: 'Blink Dagger', timing: '15-20 min', description: 'Initiation potential unlocked' },
          { item: 'Aghanims/Refresher', timing: '30-35 min', description: 'Team fight domination' }
        ],
        timing: 'Strong mid-game, scales with items'
      }
    };

    for (const [id, spikes] of Object.entries(powerSpikes)) {
      this.powerSpikes.set(parseInt(id), spikes);
    }
  }

  setupCombos() {
    const combos = {
      1: { // Anti-Mage
        basic: [
          {
            name: 'Blink Strike',
            sequence: ['Blink', 'Attack', 'Mana Void'],
            description: 'Basic gap close and burst',
            difficulty: 'Easy'
          },
          {
            name: 'Manta Dodge',
            sequence: ['Manta Style (during incoming spell)', 'Select real hero', 'Continue fight'],
            description: 'Use Manta to dodge spells',
            difficulty: 'Medium'
          }
        ],
        advanced: [
          {
            name: 'Counterspell Reflect',
            sequence: ['Counterspell (during enemy cast)', 'Blink forward', 'Mana Void'],
            description: 'Reflect spell then engage',
            difficulty: 'Hard'
          }
        ]
      },
      8: { // Juggernaut
        basic: [
          {
            name: 'Spin to Win',
            sequence: ['Blade Fury', 'Move to enemy', 'Attack after spin'],
            description: 'Basic magic immunity engage',
            difficulty: 'Easy'
          },
          {
            name: 'Omnislash Setup',
            sequence: ['Wait for enemy isolation', 'Omnislash', 'Attack between jumps'],
            description: 'Maximize Omnislash damage',
            difficulty: 'Medium'
          }
        ],
        advanced: [
          {
            name: 'Ward Omnislash',
            sequence: ['Place Healing Ward', 'Omnislash enemy', 'Land near ward', 'Heal while attacking'],
            description: 'Use ward for sustain during ultimate',
            difficulty: 'Hard'
          }
        ]
      },
      11: { // Shadow Fiend
        basic: [
          {
            name: 'Triple Raze',
            sequence: ['Near Raze', 'Medium Raze', 'Far Raze'],
            description: 'Basic farming combo',
            difficulty: 'Easy'
          },
          {
            name: 'Raze Last Hit',
            sequence: ['Position for creep', 'Time raze with creep health', 'Secure last hit'],
            description: 'Use razes for last hitting',
            difficulty: 'Medium'
          }
        ],
        advanced: [
          {
            name: 'Requiem Blink',
            sequence: ['Blink into enemy team', 'Requiem immediately', 'Focus fire targets'],
            description: 'Initiation combo with Blink Dagger',
            difficulty: 'Hard'
          },
          {
            name: 'Euls Requiem',
            sequence: ['Euls enemy', 'Position for Requiem', 'Cast as they land', 'Follow up'],
            description: 'Guaranteed Requiem with Euls setup',
            difficulty: 'Hard'
          }
        ]
      },
      5: { // Crystal Maiden
        basic: [
          {
            name: 'Disable Combo',
            sequence: ['Frostbite', 'Crystal Nova', 'Attack'],
            description: 'Basic disable and damage',
            difficulty: 'Easy'
          },
          {
            name: 'Ultimate Channel',
            sequence: ['Frostbite key target', 'Freezing Field', 'Stay hidden'],
            description: 'Safe ultimate channeling',
            difficulty: 'Medium'
          }
        ],
        advanced: [
          {
            name: 'Blink Ultimate',
            sequence: ['Smoke/Invisibility', 'Blink into trees', 'Freezing Field', 'BKB if needed'],
            description: 'Surprise ultimate from fog',
            difficulty: 'Hard'
          }
        ]
      },
      14: { // Pudge
        basic: [
          {
            name: 'Hook Combo',
            sequence: ['Meat Hook', 'Rot toggle on', 'Dismember', 'Attack'],
            description: 'Basic hook and kill combo',
            difficulty: 'Easy'
          },
          {
            name: 'Rot Walk',
            sequence: ['Rot on', 'Body block enemy', 'Continue Rot damage'],
            description: 'Use Rot to chase and damage',
            difficulty: 'Medium'
          }
        ],
        advanced: [
          {
            name: 'Blink Hook',
            sequence: ['Blink into range', 'Meat Hook', 'Dismember', 'Team follow up'],
            description: 'Initiation combo with Blink',
            difficulty: 'Hard'
          },
          {
            name: 'Force Staff Hook',
            sequence: ['Force Staff enemy into position', 'Meat Hook', 'Dismember'],
            description: 'Set up hook with Force Staff',
            difficulty: 'Hard'
          }
        ]
      }
    };

    for (const [id, comboSet] of Object.entries(combos)) {
      this.combos.set(parseInt(id), comboSet);
    }
  }

  // Main guide methods
  getHeroGuide(heroId) {
    const hero = this.heroes.get(heroId);
    if (!hero) return null;

    const abilities = this.abilities[heroId] || {};
    const skillBuilds = this.getSkillBuilds(heroId);
    const positioning = this.positioningGuides.get(heroId);
    const powerSpikes = this.powerSpikes.get(heroId);
    const combos = this.combos.get(heroId);

    return {
      hero,
      abilities,
      skillBuilds,
      positioning,
      powerSpikes,
      combos,
      tips: this.getHeroTips(heroId),
      counters: this.getHeroCounters(heroId),
      synergies: this.getHeroSynergies(heroId)
    };
  }

  getSkillBuilds(heroId) {
    const builds = [];
    for (const [id, build] of this.skillBuilds) {
      if (build.heroId === heroId) {
        builds.push({ id, ...build });
      }
    }
    return builds;
  }

  getHeroTips(heroId) {
    const tips = {
      1: [ // Anti-Mage
        'Always carry a TP scroll for split pushing',
        'Use Mana Void on enemies with low mana for maximum damage',
        'Blink has a short cast time - pre-cast it when escaping',
        'Farm jungle between waves to maximize GPM',
        'Avoid team fights until you have at least 2 major items'
      ],
      8: [ // Juggernaut
        'Blade Fury makes you magic immune but you can still attack',
        'Use Healing Ward in safe positions during fights',
        'Omnislash can target magic immune enemies',
        'Phase Boots help you chase during Blade Fury',
        'Consider Aghanims for team fight contribution'
      ],
      11: [ // Shadow Fiend
        'Stack camps for yourself to accelerate farming',
        'Position to hit multiple creeps with Razes',
        'Save souls by avoiding deaths - they\'re crucial for damage',
        'Requiem does more damage from the center',
        'Always carry regen items due to no escape mechanism'
      ],
      5: [ // Crystal Maiden
        'Stay far back in team fights to avoid getting focused',
        'Use Frostbite on jungle creeps for easy farm',
        'Position near trees to channel ultimate safely',
        'Always carry detection as a support',
        'Prioritize positioning items like Force Staff and Glimmer Cape'
      ],
      14: [ // Pudge
        'Practice hook timing and prediction',
        'Use Rot to stack camps and farm jungle',
        'Hook through trees and high ground for surprise factor',
        'Build tanky items to survive in team fights',
        'Smoke with your team to set up hook opportunities'
      ]
    };

    return tips[heroId] || [];
  }

  getHeroCounters(heroId) {
    const counters = {
      1: { // Anti-Mage
        hardCounters: ['Bloodseeker', 'Invoker', 'Lion'],
        softCounters: ['Crystal Maiden', 'Zeus', 'Lina'],
        reasoning: 'Heroes with instant disables or mana burn counter Anti-Mage\'s mobility'
      },
      8: { // Juggernaut
        hardCounters: ['Phantom Assassin', 'Faceless Void', 'Invoker'],
        softCounters: ['Axe', 'Legion Commander', 'Winter Wyvern'],
        reasoning: 'Heroes with evasion or strong disables through magic immunity'
      },
      11: { // Shadow Fiend
        hardCounters: ['Storm Spirit', 'Queen of Pain', 'Pudge'],
        softCounters: ['Invoker', 'Tinker', 'Puck'],
        reasoning: 'Mobile heroes that can close distance and burst him down'
      },
      5: { // Crystal Maiden
        hardCounters: ['Pudge', 'Spirit Breaker', 'Clockwerk'],
        softCounters: ['Storm Spirit', 'Queen of Pain', 'Anti-Mage'],
        reasoning: 'High mobility heroes that can close distance and kill her quickly'
      },
      14: { // Pudge
        hardCounters: ['Lifestealer', 'Anti-Mage', 'Queen of Pain'],
        softCounters: ['Invoker', 'Storm Spirit', 'Puck'],
        reasoning: 'Mobile heroes that can avoid hooks and kite effectively'
      }
    };

    return counters[heroId] || { hardCounters: [], softCounters: [], reasoning: '' };
  }

  getHeroSynergies(heroId) {
    const synergies = {
      1: { // Anti-Mage
        strongWith: ['Magnus', 'Invoker', 'Crystal Maiden'],
        reasoning: 'Heroes that can create space and provide utility while AM farms'
      },
      8: { // Juggernaut
        strongWith: ['Crystal Maiden', 'Witch Doctor', 'Shadow Shaman'],
        reasoning: 'Supports with disables that set up Omnislash opportunities'
      },
      11: { // Shadow Fiend
        strongWith: ['Magnus', 'Enigma', 'Tidehunter'],
        reasoning: 'Initiators that group enemies for Requiem damage'
      },
      5: { // Crystal Maiden
        strongWith: ['Invoker', 'Zeus', 'Pudge'],
        reasoning: 'Heroes that benefit from mana aura and can protect CM'
      },
      14: { // Pudge
        strongWith: ['Invoker', 'Crystal Maiden', 'Witch Doctor'],
        reasoning: 'Heroes with follow-up damage for hooked targets'
      }
    };

    return synergies[heroId] || { strongWith: [], reasoning: '' };
  }

  // Skill build optimization
  optimizeSkillBuild(heroId, gameContext = {}) {
    const builds = this.getSkillBuilds(heroId);
    if (builds.length === 0) return null;

    // Simple optimization based on context
    const { enemyTeam = [], gamePhase = 'early', playerRole = 'carry' } = gameContext;

    // Default to first build if no context
    if (builds.length === 1) return builds[0];

    // Basic logic for build selection
    if (heroId === 1) { // Anti-Mage
      if (enemyTeam.some(enemy => ['invoker', 'zeus', 'lina'].includes(enemy.toLowerCase()))) {
        return builds.find(b => b.id === 'anti-mage-fighting') || builds[0];
      }
      return builds.find(b => b.id === 'anti-mage-farming') || builds[0];
    }

    return builds[0];
  }

  // Ability combination analyzer
  analyzeAbilityCombinations(heroId) {
    const abilities = this.abilities[heroId];
    if (!abilities) return [];

    const combinations = [];
    const abilityList = Object.values(abilities);

    // Generate basic combinations
    for (let i = 0; i < abilityList.length; i++) {
      for (let j = i + 1; j < abilityList.length; j++) {
        const combo = this.analyzeAbilityCombo(abilityList[i], abilityList[j]);
        if (combo.synergy > 0) {
          combinations.push(combo);
        }
      }
    }

    return combinations.sort((a, b) => b.synergy - a.synergy);
  }

  analyzeAbilityCombo(ability1, ability2) {
    let synergy = 0;
    let description = '';

    // Basic synergy analysis
    if (ability1.type === 'active' && ability2.type === 'active') {
      synergy += 1;
      description = 'Can be used in sequence';
    }

    if (ability1.type === 'passive' && ability2.type === 'active') {
      synergy += 2;
      description = 'Passive enhances active ability';
    }

    // Specific combo detection would go here
    // This is simplified for MVP

    return {
      abilities: [ability1.name, ability2.name],
      synergy,
      description,
      timing: 'Can be used together'
    };
  }

  // Power spike calculator
  calculatePowerSpikes(heroId, itemBuild = [], level = 1) {
    const baseSpikes = this.powerSpikes.get(heroId);
    if (!baseSpikes) return [];

    const spikes = [];

    // Level-based spikes
    baseSpikes.levels.forEach(spike => {
      if (level >= spike.level) {
        spikes.push({
          type: 'level',
          reached: true,
          ...spike
        });
      } else {
        spikes.push({
          type: 'level',
          reached: false,
          ...spike
        });
      }
    });

    // Item-based spikes
    baseSpikes.items.forEach(spike => {
      const hasItem = itemBuild.some(item => 
        item.name && item.name.toLowerCase().includes(spike.item.toLowerCase())
      );
      
      spikes.push({
        type: 'item',
        reached: hasItem,
        ...spike
      });
    });

    return spikes;
  }

  // Get all heroes with guides
  getAvailableHeroes() {
    return Array.from(this.heroes.values());
  }

  // Get hero by ID
  getHero(heroId) {
    return this.heroes.get(heroId);
  }

  // Get ability details
  getAbilityDetails(heroId, abilityIndex) {
    const heroAbilities = this.abilities[heroId];
    return heroAbilities ? heroAbilities[abilityIndex] : null;
  }
}

// Create singleton instance
export const heroGuides = new HeroGuidesService();