// frontend/src/utils/dotaAssets.js
/**
 * Official Dota 2 Asset Management System
 * Provides optimized access to official Valve/Dota 2 visual assets
 */

// Official CDN URLs for Dota 2 assets
const DOTA_CDN_BASE = 'https://cdn.dota2.com/apps/dota2/images';
const STEAM_CDN_BASE = 'https://cdn.cloudflare.steamstatic.com';
const OPENDOTA_CDN_BASE = 'https://cdn.opendota.com';

// Asset size constants
export const ASSET_SIZES = {
  hero: {
    PORTRAIT_SMALL: 'sb.png',     // 59x33 hero portrait (small)
    PORTRAIT_LARGE: 'lg.png',     // 205x115 hero portrait (large)
    PORTRAIT_FULL: 'full.png',    // 256x144 hero portrait (full)
    PORTRAIT_VERT: 'vert.jpg',    // 234x272 hero portrait (vertical)
    ICON: 'icon.png'              // Small icon format
  },
  attribute: {
    STRENGTH: 'overviewicon_str.png',
    AGILITY: 'overviewicon_agi.png',
    INTELLIGENCE: 'overviewicon_int.png',
    UNIVERSAL: 'overviewicon_all.png'
  },
  item: {
    ICON: 'lg.png'  // Standard item icon
  }
};

// Hero name to internal name mapping (fallback for missing heroes)
const HERO_NAME_MAP = {
  'Anti-Mage': 'antimage',
  'Axe': 'axe',
  'Bane': 'bane',
  'Bloodseeker': 'bloodseeker',
  'Crystal Maiden': 'crystal_maiden',
  'Drow Ranger': 'drow_ranger',
  'Earthshaker': 'earthshaker',
  'Juggernaut': 'juggernaut',
  'Mirana': 'mirana',
  'Morphling': 'morphling',
  'Shadow Fiend': 'nevermore',
  'Phantom Lancer': 'phantom_lancer',
  'Puck': 'puck',
  'Pudge': 'pudge',
  'Razor': 'razor',
  'Sand King': 'sand_king',
  'Storm Spirit': 'storm_spirit',
  'Sven': 'sven',
  'Tiny': 'tiny',
  'Vengeful Spirit': 'vengefulspirit',
  'Windranger': 'windrunner',
  'Zeus': 'zuus',
  'Kunkka': 'kunkka',
  'Lina': 'lina',
  'Lion': 'lion',
  'Shadow Shaman': 'shadow_shaman',
  'Slardar': 'slardar',
  'Tidehunter': 'tidehunter',
  'Witch Doctor': 'witch_doctor',
  'Lich': 'lich',
  'Riki': 'riki',
  'Enigma': 'enigma',
  'Tinker': 'tinker',
  'Sniper': 'sniper',
  'Necrophos': 'necrolyte',
  'Warlock': 'warlock',
  'Beastmaster': 'beastmaster',
  'Queen of Pain': 'queenofpain',
  'Venomancer': 'venomancer',
  'Faceless Void': 'faceless_void',
  'Wraith King': 'skeleton_king',
  'Death Prophet': 'death_prophet',
  'Phantom Assassin': 'phantom_assassin',
  'Pugna': 'pugna',
  'Templar Assassin': 'templar_assassin',
  'Viper': 'viper',
  'Luna': 'luna',
  'Dragon Knight': 'dragon_knight',
  'Dazzle': 'dazzle',
  'Clockwerk': 'rattletrap',
  'Leshrac': 'leshrac',
  'Nature\'s Prophet': 'furion',
  'Lifestealer': 'life_stealer',
  'Dark Seer': 'dark_seer',
  'Clinkz': 'clinkz',
  'Omniknight': 'omniknight',
  'Enchantress': 'enchantress',
  'Huskar': 'huskar',
  'Night Stalker': 'night_stalker',
  'Broodmother': 'broodmother',
  'Bounty Hunter': 'bounty_hunter',
  'Weaver': 'weaver',
  'Jakiro': 'jakiro',
  'Batrider': 'batrider',
  'Chen': 'chen',
  'Spectre': 'spectre',
  'Ancient Apparition': 'ancient_apparition',
  'Doom': 'doom_bringer',
  'Ursa': 'ursa',
  'Spirit Breaker': 'spirit_breaker',
  'Gyrocopter': 'gyrocopter',
  'Alchemist': 'alchemist',
  'Invoker': 'invoker'
};

/**
 * Get hero portrait URL with specified size and fallbacks
 * @param {Object} hero - Hero object with name/id
 * @param {string} size - Size from ASSET_SIZES.hero
 * @param {boolean} useOfficial - Whether to use official Dota 2 CDN (may have missing heroes)
 * @returns {string} - Complete URL to hero image
 */
export const getHeroImage = (hero, size = ASSET_SIZES.hero.PORTRAIT_LARGE, useOfficial = false) => {
  if (!hero) return getPlaceholderImage('hero');

  // Use existing Steam CDN URLs from OpenDota as primary source (more reliable)
  if (hero.img && !useOfficial) {
    return hero.img;
  }
  
  if (hero.icon && !useOfficial) {
    return hero.icon;
  }

  // Generate official Dota 2 CDN URL (may have missing assets)
  const heroName = hero.name?.replace('npc_dota_hero_', '') || 
                   HERO_NAME_MAP[hero.localized_name] || 
                   hero.localized_name?.toLowerCase().replace(/[^a-z]/g, '_');
  
  if (heroName && useOfficial) {
    return `${DOTA_CDN_BASE}/heroes/${heroName}_${size}`;
  }

  // Fallback to placeholder
  return getPlaceholderImage('hero');
};

/**
 * Get multiple hero image URLs for responsive loading
 * @param {Object} hero - Hero object
 * @returns {Object} - Object with different size URLs
 */
export const getHeroImageSet = (hero) => {
  if (!hero) {
    const placeholder = getPlaceholderImage('hero');
    return {
      small: placeholder,
      medium: placeholder,
      large: placeholder,
      full: placeholder,
      vertical: placeholder
    };
  }

  return {
    small: getHeroImage(hero, ASSET_SIZES.hero.PORTRAIT_SMALL, true) || hero.icon,
    medium: hero.icon || getHeroImage(hero, ASSET_SIZES.hero.PORTRAIT_LARGE, true),
    large: getHeroImage(hero, ASSET_SIZES.hero.PORTRAIT_LARGE, true) || hero.img,
    full: getHeroImage(hero, ASSET_SIZES.hero.PORTRAIT_FULL, true) || hero.img,
    vertical: getHeroImage(hero, ASSET_SIZES.hero.PORTRAIT_VERT, true) || hero.img
  };
};

/**
 * Get attribute icon URL
 * @param {string} attribute - 'str', 'agi', 'int', or 'all'
 * @returns {string} - Complete URL to attribute icon
 */
export const getAttributeIcon = (attribute) => {
  const iconMap = {
    'str': ASSET_SIZES.attribute.STRENGTH,
    'agi': ASSET_SIZES.attribute.AGILITY,
    'int': ASSET_SIZES.attribute.INTELLIGENCE,
    'all': ASSET_SIZES.attribute.UNIVERSAL
  };

  const iconFile = iconMap[attribute];
  if (iconFile) {
    return `${DOTA_CDN_BASE}/heropedia/${iconFile}`;
  }
  
  return getPlaceholderImage('attribute');
};

/**
 * Get attribute display properties
 * @param {string} attribute - Attribute type
 * @returns {Object} - Color, icon, and label information
 */
export const getAttributeProperties = (attribute) => {
  const properties = {
    'str': {
      color: '#DC2626', // red-600
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: '#DC2626',
      icon: getAttributeIcon('str'),
      label: 'Strength',
      shortLabel: 'STR',
      gradient: 'linear(to-r, red.500, red.600)'
    },
    'agi': {
      color: '#059669', // green-600
      bgColor: 'rgba(5, 150, 105, 0.1)',
      borderColor: '#059669',
      icon: getAttributeIcon('agi'),
      label: 'Agility',
      shortLabel: 'AGI',
      gradient: 'linear(to-r, green.500, green.600)'
    },
    'int': {
      color: '#2563EB', // blue-600
      bgColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: '#2563EB',
      icon: getAttributeIcon('int'),
      label: 'Intelligence',
      shortLabel: 'INT',
      gradient: 'linear(to-r, blue.500, blue.600)'
    },
    'all': {
      color: '#7C3AED', // purple-600
      bgColor: 'rgba(124, 58, 237, 0.1)',
      borderColor: '#7C3AED',
      icon: getAttributeIcon('all'),
      label: 'Universal',
      shortLabel: 'UNI',
      gradient: 'linear(to-r, purple.500, purple.600)'
    }
  };

  return properties[attribute] || properties['all'];
};

/**
 * Get item icon URL
 * @param {Object} item - Item object
 * @returns {string} - Complete URL to item icon
 */
export const getItemIcon = (item) => {
  if (!item) return getPlaceholderImage('item');

  // Use existing URL if available
  if (item.icon) return item.icon;
  if (item.img) return item.img;

  // Generate from item name
  const itemName = item.name?.replace('item_', '') || 
                   item.dname?.toLowerCase().replace(/[^a-z]/g, '_');
  
  if (itemName) {
    return `${DOTA_CDN_BASE}/items/${itemName}_${ASSET_SIZES.item.ICON}`;
  }

  return getPlaceholderImage('item');
};

/**
 * Get placeholder images for missing assets
 * @param {string} type - Type of placeholder needed
 * @returns {string} - Data URL or fallback image
 */
export const getPlaceholderImage = (type) => {
  const placeholders = {
    hero: '/placeholder-hero.svg',
    item: '/placeholder-item.svg',
    attribute: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMUEyMDJDIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IiM0QTVCNjgiLz4KPC9zdmc+Cg=='
  };

  return placeholders[type] || placeholders.hero;
};

/**
 * Preload critical images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    if (url && typeof url === 'string') {
      const img = new Image();
      img.src = url;
    }
  });
};

/**
 * Create optimized image component props with lazy loading
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {Object} options - Additional options
 * @returns {Object} - Props object for Image component
 */
export const createImageProps = (src, alt, options = {}) => {
  const {
    fallbackSrc,
    loading = 'lazy',
    sizes,
    placeholder = 'blur'
  } = options;

  return {
    src: src || getPlaceholderImage('hero'),
    alt: alt || 'Dota 2 Asset',
    fallbackSrc: fallbackSrc || getPlaceholderImage('hero'),
    loading,
    sizes,
    placeholder,
    onError: (e) => {
      // Fallback chain: original -> fallback -> placeholder
      if (e.target.src !== getPlaceholderImage('hero')) {
        e.target.src = fallbackSrc || getPlaceholderImage('hero');
      }
    }
  };
};

/**
 * Get hero color theme based on attribute
 * @param {Object} hero - Hero object
 * @returns {Object} - Theme colors for the hero
 */
export const getHeroTheme = (hero) => {
  const attribute = hero?.primary_attr || 'all';
  const baseProperties = getAttributeProperties(attribute);
  
  return {
    primary: baseProperties.color,
    secondary: baseProperties.bgColor,
    border: baseProperties.borderColor,
    gradient: baseProperties.gradient,
    glow: `0 0 20px ${baseProperties.bgColor}`,
    heroGlow: `0 0 30px ${baseProperties.color}40`
  };
};

/**
 * Create responsive image srcSet for hero images
 * @param {Object} hero - Hero object
 * @returns {string} - srcSet string for responsive images
 */
export const createHeroSrcSet = (hero) => {
  const imageSet = getHeroImageSet(hero);
  
  return [
    `${imageSet.small} 59w`,
    `${imageSet.medium} 128w`,
    `${imageSet.large} 205w`,
    `${imageSet.full} 256w`
  ].join(', ');
};

/**
 * Cache management for loaded images
 */
class ImageCache {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  async loadImage(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, src);
        this.loadingPromises.delete(src);
        resolve(src);
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  preloadHeroImages(heroes) {
    const urls = heroes.flatMap(hero => {
      const imageSet = getHeroImageSet(hero);
      return Object.values(imageSet);
    });

    return Promise.allSettled(urls.map(url => this.loadImage(url)));
  }

  clear() {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

export const imageCache = new ImageCache();

// Background and texture assets
export const GAME_ASSETS = {
  backgrounds: {
    radiant: `${DOTA_CDN_BASE}/backgrounds/ti11_radiant_bg.jpg`,
    dire: `${DOTA_CDN_BASE}/backgrounds/ti11_dire_bg.jpg`,
    neutral: `${DOTA_CDN_BASE}/backgrounds/ti11_neutral_bg.jpg`
  },
  textures: {
    stone: `${DOTA_CDN_BASE}/textures/stone_texture.jpg`,
    metal: `${DOTA_CDN_BASE}/textures/metal_texture.jpg`,
    magic: `${DOTA_CDN_BASE}/textures/magic_texture.jpg`
  },
  runes: {
    arcane: `${DOTA_CDN_BASE}/runes/rune_arcane.png`,
    bounty: `${DOTA_CDN_BASE}/runes/rune_bounty.png`,
    double_damage: `${DOTA_CDN_BASE}/runes/rune_doubledamage.png`,
    haste: `${DOTA_CDN_BASE}/runes/rune_haste.png`,
    illusion: `${DOTA_CDN_BASE}/runes/rune_illusion.png`,
    invisibility: `${DOTA_CDN_BASE}/runes/rune_invis.png`,
    regeneration: `${DOTA_CDN_BASE}/runes/rune_regen.png`
  }
};

export default {
  getHeroImage,
  getHeroImageSet,
  getAttributeIcon,
  getAttributeProperties,
  getItemIcon,
  getPlaceholderImage,
  preloadImages,
  createImageProps,
  getHeroTheme,
  createHeroSrcSet,
  imageCache,
  ASSET_SIZES,
  GAME_ASSETS
};