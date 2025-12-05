// const OpenAIProvider = require('./openai');
const GroqProvider = require('./groq');
const ClaudeProvider = require('./claude');

// Enum de providers
const AIModels = {
  // OPENAI: 'openai',
  GROQ: 'groq',
  // CLAUDE: 'claude',
  GEMINI: 'gemini',
};

// Factory
class AIFactory {
  static create(model) {
    const apiKeys = {
    //   [AIModels.OPENAI]: process.env.OPENAI_API_KEY,
      [AIModels.GROQ]: process.env.GROQ_API_KEY,
    //   [AIModels.CLAUDE]: process.env.ANTHROPIC_API_KEY,
      [AIModels.GEMINI]: process.env.GOOGLE_GEMINI_API_KEY,
    };

    const providers = {
    //   [AIModels.OPENAI]: OpenAIProvider,
      [AIModels.GROQ]: GroqProvider,
    //   [AIModels.CLAUDE]: ClaudeProvider,
      [AIModels.GEMINI]: ClaudeProvider,
    };

    const apiKey = apiKeys[model];
    const Provider = providers[model];

    if (!apiKey) {
      throw new Error(`API key not found for model: ${model}`);
    }

    if (!Provider) {
      throw new Error(`Unknown AI model: ${model}`);
    }

    return new Provider(apiKey);
  }
}

module.exports = { AIFactory, AIModels };