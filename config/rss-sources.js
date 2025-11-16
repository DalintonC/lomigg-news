// config/rss-sources.js
// ACTUALIZADO - URLs verificadas que funcionan en 2025

export const RSS_SOURCES = [
  // ========================================
  // FUENTES OFICIALES Y AGREGADORES
  // ========================================
  // {
  //   id: 'rito-news-lol',
  //   name: 'Riot Games - LoL News (Agregador)',
  //   url: 'https://rito.news/feeds/lol/en-us.rss',
  //   category: 'official',
  //   priority: 1,
  //   language: 'en',
  //   icon: '/icons/riot-games.png',
  //   description: 'Agregador de noticias oficiales de Riot Games',
  //   enabled: true,
  // },
  
  // ========================================
  // FUENTES ESPECIALIZADAS (Alta Prioridad)
  // ========================================
  {
    id: 'surrender-at-20',
    name: 'Surrender at 20',
    url: 'http://feeds.feedburner.com/Surrenderat20',
    category: 'pbe',
    priority: 1,
    language: 'en',
    icon: '/icons/surrender-at-20.png',
    description: 'PBE Updates, Datamining, Red Posts',
    enabled: true,
  },
  {
    id: 'dot-esports',
    name: 'Dot Esports - LoL',
    url: 'https://dotesports.com/league-of-legends/feed',
    category: 'esports',
    priority: 1,
    language: 'en',
    icon: '/icons/dot-esports.png',
    description: 'Esports News & Analysis',
    enabled: true,
  },
  {
    id: 'dexerto-lol',
    name: 'Dexerto - League of Legends',
    url: 'https://www.dexerto.com/league-of-legends/feed/',
    category: 'news',
    priority: 1,
    language: 'en',
    icon: '/icons/dexerto.png',
    description: 'Breaking News & Updates',
    enabled: true,
  },
  {
    id: 'leaguefeed',
    name: 'LeagueFeed',
    url: 'https://leaguefeed.net/feed',
    category: 'news',
    priority: 2,
    language: 'en',
    icon: '/icons/leaguefeed.png',
    description: 'General LoL News',
    enabled: true,
  },
  {
    id: 'estnn-lol',
    name: 'ESTNN - League of Legends',
    url: 'https://estnn.com/tag/league-of-legends/feed/',
    category: 'esports',
    priority: 2,
    language: 'en',
    icon: '/icons/estnn.png',
    description: 'Esports News & Coverage',
    enabled: true,
  },
  
  // ========================================
  // FUENTES ADICIONALES (Opcional)
  // ========================================
  {
    id: 'snowball-esports',
    name: 'Snowball Esports - LoL',
    url: 'https://snowballesports.com/games/league-of-legends/feed/',
    category: 'esports',
    priority: 3,
    language: 'en',
    icon: '/icons/snowball.png',
    description: 'Oceania Esports',
    enabled: false,
  },
  {
    id: 'nerfplz',
    name: 'NerfPlz',
    url: 'https://www.nerfplz.com/feeds/posts/default',
    category: 'news',
    priority: 3,
    language: 'en',
    icon: '/icons/nerfplz.png',
    description: 'LoL News & Strategy',
    enabled: false,
  },
];

// Categorías disponibles
export const CATEGORIES = {
  official: {
    name: 'Official',
    slug: 'official',
    color: '#C89B3C', // Dorado de LoL
    description: 'Official announcements from Riot Games',
  },
  esports: {
    name: 'Esports',
    slug: 'esports',
    color: '#0AC8B9', // Cyan de esports
    description: 'Competitive League of Legends news',
  },
  pbe: {
    name: 'PBE & Updates',
    slug: 'pbe',
    color: '#0397AB',
    description: 'Public Beta Environment and game updates',
  },
  news: {
    name: 'General News',
    slug: 'news',
    color: '#005A82',
    description: 'Latest League of Legends news',
  },
  patches: {
    name: 'Patch Notes',
    slug: 'patches',
    color: '#0A1428',
    description: 'Game balance and patch updates',
  },
};

// Función helper para obtener fuentes activas
export function getActiveSources() {
  return RSS_SOURCES.filter(source => source.enabled);
}

// Función helper para obtener fuentes por categoría
export function getSourcesByCategory(category) {
  return RSS_SOURCES.filter(
    source => source.enabled && source.category === category
  );
}

// Función helper para obtener fuentes por prioridad
export function getSourcesByPriority(priority) {
  return RSS_SOURCES.filter(
    source => source.enabled && source.priority === priority
  );
}

export default RSS_SOURCES;
