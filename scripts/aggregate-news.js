require('dotenv').config({ path: '.env.local' });

const { validateEnv } = require('../lib/env');
const { logger } = require('../lib/logger');
const { captureError, flush } = require('../lib/sentry');
const { withRetry } = require('../lib/retry');
const { AIFactory, AIModels } = require('../lib/ai');
const { supabaseAdmin } = require('../lib/supabase');
const Parser = require('rss-parser');
const crypto = require('crypto');
const { extractMultipleImages } = require('../lib/image-extractor');

try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

const AI_MODEL = process.env.AI_MODEL || AIModels.GROQ;
let aiProvider;

try {
  aiProvider = AIFactory.create(AI_MODEL);
  logger.info(`🤖 Using IA model: ${AI_MODEL.toUpperCase()}\n`);
} catch (error) {
  logger.warn('⚠️  Error setting IA:', error.message);
  aiProvider = null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const RSS_SOURCES = [
  {
    id: 'surrender-at-20',
    name: 'Surrender at 20',
    url: 'http://feeds.feedburner.com/Surrenderat20',
    category: 'pbe',
    priority: 1,
    enabled: true,
  },
  // ... resto de fuentes comentadas
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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function aggregateNews() {
  const startTime = Date.now();
  
  const metrics = {
    total: 0,
    new: 0,
    existing: 0,
    translated: 0,
    errors: 0,
    sources: {
      success: 0,
      failed: 0,
    }
  };

  logger.info('🚀 Iniciando agregación de noticias...\n');
  
  const allNews = [];
  const activeSources = RSS_SOURCES.filter(s => s.enabled);
  
  let existingNewsIds = new Set();
  let existingNewsData = new Map();
  
  if (supabaseAdmin) {
    try {
      const existingNews = await withRetry(async () => {
        const { data, error } = await supabaseAdmin
          .from('news')
          .select('id, title, description, summary_es');
        
        if (error) throw error;
        return data;
      });
      
      if (existingNews) {
        existingNewsIds = new Set(existingNews.map(n => n.id));
        existingNews.forEach(n => existingNewsData.set(n.id, n));
        logger.info('Noticias existentes cargadas', { count: existingNewsIds.size });
      }
    } catch (error) {
      logger.warn('No se pudieron cargar noticias existentes', { error: error.message });
    }
  }
  
  let newNewsCount = 0;
  let skippedCount = 0;
  
  for (const source of activeSources) {
    try {
      logger.info(`📰 Obteniendo noticias de: ${source.name}`);
      
      const feed = await parser.parseURL(source.url);
      logger.info(`   ✅ Encontradas ${feed.items.length} noticias\n`);

      const itemsToProcess = feed.items.slice(0, 5);
      
      for (const item of itemsToProcess) {
        const newsId = generateNewsId(item.link);
        const image = extractImage(item);
        const imagesGallery = extractMultipleImages(
          item.contentEncoded || item.content || item.description
        );
        const description = cleanDescription(item.contentSnippet || item.description);

        let spanishContent = null;
        const isNew = !existingNewsIds.has(newsId);
        
        if (isNew && aiProvider) {
          newNewsCount++;
          logger.info(`   🆕 Noticia nueva detectada (#${newNewsCount})`);
          logger.info(`   🤖 Generando contenido en español...`);
          
          spanishContent = await aiProvider.generateSpanishContent(
            item.title,
            description,
            item.contentEncoded || item.content || item.description
          );

          if (!spanishContent) {
            logger.warn(`   ⚠️  Usando contenido original (sin traducción)`);
          } else {
            logger.info(`   ✅ Traducción completada`);
          }

          await sleep(10000);
          
        } else if (!isNew) {
          skippedCount++;
          logger.info(`   ♻️  Noticia existente, reutilizando traducción (ahorro de tokens)`);
          
          const existing = existingNewsData.get(newsId);
          if (existing) {
            spanishContent = {
              titleEs: existing.title,
              descriptionEs: existing.description,
              summaryEs: existing.summary_es,
            };
          }
          
        } else {
          logger.warn(`   ℹ️  IA deshabilitada, guardando en inglés`);
        }
        
        const newsItem = {
          id: newsId,
          title: spanishContent?.titleEs || item.title,
          title_en: item.title,
          slug: createSlug(item.title),
          description: spanishContent?.descriptionEs || description,
          description_en: description,
          summary_es: spanishContent?.summaryEs || null,
          content: item.contentEncoded || item.content || item.description,
          link: item.link,
          image: image,
          image_gallery: imagesGallery,
          pub_date: item.pubDate || item.isoDate,
          source: source.name,
          source_id: source.id,
          category: source.category,
          priority: source.priority,
          created_at: new Date().toISOString(),
        };
        
        allNews.push(newsItem);
      }
      
    } catch (error) {
      logger.error(`   ❌ Error obteniendo ${source.name}:`, error.message);
      logger.error('Stack trace completo:', error);
    }
  }
  
  allNews.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
  
  const uniqueNews = deduplicateNews(allNews);
  
  logger.info('\n📊 RESUMEN:');
  logger.info(`   Total de noticias procesadas: ${allNews.length}`);
  logger.info(`   Noticias únicas: ${uniqueNews.length}`);
  logger.info(`   Noticias nuevas traducidas: ${newNewsCount}`);
  logger.info(`   Noticias existentes (sin traducir): ${skippedCount}`);
  logger.info(`   Duplicados removidos: ${allNews.length - uniqueNews.length}`);
  logger.info(`   💰 Ahorro estimado: ~${skippedCount} traducciones\n`);

  const duration = Date.now() - startTime;
  
  logger.success('News added successful', {
    duration: `${(duration / 1000).toFixed(2)}s`,
    metrics,
  });
  
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
  
  logger.info('📈 Noticias por categoría:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
  console.log('');
}

async function saveToSupabase(news) {
  if (!supabaseAdmin) {
    logger.warn('⚠️  Supabase no configurado, saltando guardado...');
    return;
  }
  
  logger.info('💾 Saving news on Supabase...');
  
  const { data, error } = await supabaseAdmin
    .from('news')
    .upsert(news, { onConflict: 'id' });
  
  if (error) {
    logger.error('❌ Error saving:', error.message);
  } else {
    logger.info(`✅ ${news.length} news saved on Supabase\n`);
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

      logger.success('✅ First 10 news saved on news-output.json');
      logger.success('\n🎉 News savings succesful!\n');

      await flush();
    })
    .catch(async (error) => {
      logger.error('Critical error on saving', error);
      captureError(error, { 
        component: 'aggregate-news',
        fatal: true 
      });
      
      await flush();
      process.exit(1);
    });
}

module.exports = { aggregateNews, extractImage, cleanDescription, createSlug };