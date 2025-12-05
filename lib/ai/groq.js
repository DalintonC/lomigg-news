const AIProvider = require('./base');
const Groq = require('groq-sdk');

class GroqProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = new Groq({ apiKey });
  }

  async generateSpanishContent(title, description, fullContent) {
    try {
      const cleanContent = this.cleanContent(fullContent, description);
      const prompt = this.createPrompt(title, description, cleanContent);

      const completion = await this.client.chat.completions.create({
          messages: [
          {
            role: "system",
            content: "Eres un asistente que SIEMPRE responde ÚNICAMENTE con JSON válido. Nunca uses markdown, nunca agregues explicaciones fuera del JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const text = completion.choices[0].message.content;
      return this.parseResponse(text);
    } catch (error) {
      throw new Error(`Groq error: ${error.message}`);
    }
  }
}

module.exports = GroqProvider;