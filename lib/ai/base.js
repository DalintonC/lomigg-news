class AIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateSpanishContent(title, description, fullContent) {
    throw new Error('generateSpanishContent must be implemented');
  }

  cleanContent(fullContent, description) {
    return fullContent
      ? fullContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000)
      : description;
  }

  createPrompt(title, description, cleanContent) {
    return `Eres un experto en League of Legends escribiendo para LomiGG.

    Titulo: ${title}
    Descripción: ${description}
    Contenido completo: ${cleanContent}

    INSTRUCCIONES:
    - Si hay listas de campeones/skins/precios, inclúyelas TODAS
    - Usa \\n\\n para separar párrafos
    - Usa \\n• para viñetas
    - Mantén fechas y números exactos
    - 300-400 palabras en español

    CRÍTICO: Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones adicionales.

    Genera resumen de 300-400 palabras en español con:
    1. Introducción (qué es)
    2. Lista detallada de contenido (campeones, skins, precios)
    3. Fechas importantes
    4. Contexto adicional
    5. Si esto aplica

    JSON:
    {
      "title_es": "...",
      "description_es": "...",
      "summary_es": "resumen con formato, usa \\n para saltos de línea"
    }`;
  }

  parseResponse(text) {
    let cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\*\*.*\*\*/gm, '')
      .trim();

    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    
    try {
      const parsed = JSON.parse(cleanText);
      
      return {
        titleEs: parsed.title_es,
        descriptionEs: parsed.description_es,
        summaryEs: parsed.summary_es,
      };
    } catch (error) {
      console.error('❌ JSON Parse Error:', error.message);
      console.error('Raw text:', cleanText.substring(0, 200));
      return null;
    }
  }
}

module.exports = AIProvider;