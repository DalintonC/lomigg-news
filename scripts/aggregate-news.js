require('dotenv').config({ path: '.env.local' });

const Parser = require('rss-parser');
const crypto = require('crypto');

const RSS_SOURCES = [
  // {
  //   id: 'rito-news-lol',
  //   name: 'Riot Games - LoL News',
  //   url: 'https://rito.news/feeds/lol/en-us.rss',
  //   category: 'official',
  //   priority: 1,
  //   enabled: true,
  // },
  {
    id: 'surrender-at-20',
    name: 'Surrender at 20',
    url: 'http://feeds.feedburner.com/Surrenderat20',
    category: 'pbe',
    priority: 1,
    enabled: true,
  },
  {
    id: 'dot-esports',
    name: 'Dot Esports - LoL',
    url: 'https://dotesports.com/league-of-legends/feed',
    category: 'esports',
    priority: 1,
    enabled: true,
  },
  {
    id: 'dexerto-lol',
    name: 'Dexerto - League of Legends',
    url: 'https://www.dexerto.com/league-of-legends/feed/',
    category: 'news',
    priority: 1,
    enabled: true,
  },
  {
    id: 'leaguefeed',
    name: 'LeagueFeed',
    url: 'https://leaguefeed.net/feed',
    category: 'news',
    priority: 2,
    enabled: true,
  },
  {
    id: 'estnn-lol',
    name: 'ESTNN - LoL',
    url: 'https://estnn.com/tag/league-of-legends/feed/',
    category: 'esports',
    priority: 2,
    enabled: true,
  },
];

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

function generateNewsId(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

function extractImage(item) {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  if (item.media && item.media.$) {
    return item.media.$.url;
  }
  
  if (item.contentEncoded) {
    const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  return null;
}

function cleanDescription(html) {
  if (!html) return '';
  
  let text = html.replace(/<[^>]*>/g, ' ');
  
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length > 300) {
    text = text.substring(0, 297) + '...';
  }
  
  return text;
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function aggregateNews() {
  console.log('🚀 Iniciando agregación de noticias...\n');
  
  const allNews = [];
  const activeSources = RSS_SOURCES.filter(s => s.enabled);
  
  for (const source of activeSources) {
    try {
      console.log(`📰 Obteniendo noticias de: ${source.name}`);
      
      const feed = await parser.parseURL(source.url);
      
      console.log(`   ✅ Encontradas ${feed.items.length} noticias\n`);
      
      feed.items.forEach(item => {
        const newsId = generateNewsId(item.link);
        const image = extractImage(item);
        const description = cleanDescription(item.contentSnippet || item.description);
        
        const newsItem = {
          id: newsId,
          title: item.title,
          slug: createSlug(item.title),
          description: description,
          content: item.contentEncoded || item.content || item.description,
          link: item.link,
          image: image,
          pub_date: item.pubDate || item.isoDate,
          source: source.name,
          source_id: source.id,
          category: source.category,
          priority: source.priority,
          created_at: new Date().toISOString(),
        };
        
        allNews.push(newsItem);
      });
      
    } catch (error) {
      console.error(`   ❌ Error obteniendo ${source.name}:`, error.message);
    }
  }
  
  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  const uniqueNews = deduplicateNews(allNews);
  
  console.log('\n📊 RESUMEN:');
  console.log(`   Total de noticias procesadas: ${allNews.length}`);
  console.log(`   Noticias únicas: ${uniqueNews.length}`);
  console.log(`   Duplicados removidos: ${allNews.length - uniqueNews.length}\n`);
  
  return uniqueNews;
}

function deduplicateNews(newsArray) {
  const seen = new Set();
  return newsArray.filter(news => {
    if (seen.has(news.id)) {
      return false;
    }
    seen.add(news.id);
    return true;
  });
}

function displayStats(news) {
  const categoryCounts = {};
  
  news.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
  
  console.log('📈 Noticias por categoría:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
  console.log('');
}

async function saveToSupabase(news) {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase no configurado, saltando guardado...');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('💾 Guardando noticias en Supabase...');
  
  const { data, error } = await supabase
    .from('news')
    .upsert(news, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ Error guardando:', error.message);
  } else {
    console.log(`✅ ${news.length} noticias guardadas en Supabase\n`);
  }
}

if (require.main === module) {
  aggregateNews()
    .then(async (news) => {
      displayStats(news);

      await saveToSupabase(news);
      
      const fs = require('fs');
      fs.writeFileSync(
        'news-output.json',
        JSON.stringify(news.slice(0, 10), null, 2)
      );
      console.log('✅ Primeras 10 noticias guardadas en news-output.json');
      console.log('\n🎉 Agregación completada exitosamente!\n');
    })
    .catch(error => {
      console.error('❌ Error en la agregación:', error);
      process.exit(1);
    });
}

module.exports = { aggregateNews, extractImage, cleanDescription, createSlug };
