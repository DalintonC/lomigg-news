require('dotenv').config({ path: '.env.local' });

const { supabaseAdmin } = require('../lib/supabase');
const { logger } = require('../lib/logger');

async function healthCheck() {
  logger.info('Running health check...');
  
  const checks = {
    environment: checkEnvironment(),
    database: await checkDatabase(),
    ai: checkAI(),
  };

  const allHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  if (allHealthy) {
    logger.success('All systems healthy', { checks });
    process.exit(0);
  } else {
    logger.error('Health check failed', null, { checks });
    process.exit(1);
  }
}

function checkEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: 'error',
      message: `Missing variables: ${missing.join(', ')}`,
    };
  }

  return {
    status: 'ok',
    message: 'All required env variables present',
  };
}

async function checkDatabase() {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }

    const { count, error } = await supabaseAdmin
      .from('news')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return {
      status: 'ok',
      message: `Database connected (${count} news items)`,
      count,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function checkAI() {
  const hasAIKey = 
    process.env.GROQ_API_KEY || 
    process.env.OPENAI_API_KEY || 
    process.env.ANTHROPIC_API_KEY;

  if (!hasAIKey) {
    return {
      status: 'warning',
      message: 'No AI API keys configured',
    };
  }

  return {
    status: 'ok',
    message: `AI configured (${process.env.AI_MODEL || 'groq'})`,
    model: process.env.AI_MODEL || 'groq',
  };
}

if (require.main === module) {
  healthCheck().catch(error => {
    logger.error('Health check crashed', error);
    process.exit(1);
  });
}

module.exports = { healthCheck };