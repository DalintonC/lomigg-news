const AIProvider = require('./base');
const Anthropic = require('@anthropic-ai/sdk');

class ClaudeProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
  }

  async generateSpanishContent(title, description, fullContent) {
    try {
      const cleanContent = this.cleanContent(fullContent, description);
      const prompt = this.createPrompt(title, description, cleanContent);

      const message = await this.client.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text = message.content[0].text;
      return this.parseResponse(text);
    } catch (error) {
      throw new Error(`Claude error: ${error.message}`);
    }
  }
}

module.exports = ClaudeProvider;