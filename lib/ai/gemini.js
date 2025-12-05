const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function generateSpanishContent(title, description, fullContent) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });
    
    const cleanContent = fullContent
      ? fullContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000)
      : description;
    
    const prompt = `Eres un experto en League of Legends escribiendo para LomiGG, un streamer y creador de contenido.

    Noticia original (inglés):
    Título: ${title}
    Descripción: ${description}
    Contenido completo: ${cleanContent}

    Tu tarea:
    1. Traduce el TÍTULO al español (natural, no literal)
    2. Traduce la DESCRIPCIÓN al español (natural, conservando longitud similar)
    3. Genera un RESUMEN informativo de 200-250 palabras en español que:
    - Incluya TODOS los datos específicos importantes (campeones, fechas, números, etc)
    - Sea preciso con nombres propios (mantén nombres en inglés si es necesario)
    - Explique los puntos clave de forma clara
    - Use un tono profesional pero cercano para gamers
    - NO inventes información que no esté en el contenido
    - Si hay listas (ej: campeones gratis), inclúyelas completas

    Responde SOLO en formato JSON:
    {
    "title_es": "título traducido",
    "description_es": "descripción traducida",
    "summary_es": "resumen completo con todos los detalles"
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return {
      titleEs: parsed.title_es,
      descriptionEs: parsed.description_es,
      summaryEs: parsed.summary_es,
    };
  } catch (error) {
    console.error('Error generando contenido:', error.message);
    return null;
  }
}

module.exports = { generateSpanishContent };