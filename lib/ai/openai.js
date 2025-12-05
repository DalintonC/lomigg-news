const AIProvider = require('./base');
const { OpenAI } = require('openai');

class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
  }

  async generateSpanishContent(title, description, fullContent) {
    try {
      const cleanContent = this.cleanContent(fullContent, description);
      const prompt = this.createPrompt(title, description, cleanContent);

      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const text = response.choices[0].message.content;
      return this.parseResponse(text);
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      return null;
    }
  }
}

module.exports = OpenAIProvider;