function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  const optional = [
    'GROQ_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'AI_MODEL',
    'SENTRY_DSN',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  const hasAIKey = optional
    .filter(key => key.includes('API_KEY'))
    .some(key => process.env[key]);
  
  if (!hasAIKey) {
    console.warn('⚠️  No AI API keys found. Translation will be disabled.');
  }
  
  return true;
}

module.exports = { validateEnv };