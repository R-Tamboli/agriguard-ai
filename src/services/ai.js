
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/chat`;

function aiError(english, hindi, language) {
  const error = new Error(language === 'hi' ? hindi : english);
  error.translations = { en: english, hi: hindi };
  return error;
}

export function getAIErrorMessage(error, language = 'en') {
  return error?.translations?.[language] || (language === 'hi'
    ? 'जवाब नहीं मिल सका। कृपया फिर कोशिश करें।'
    : error?.message || 'Could not get a response. Please try again.');
}

function responseLanguage(language) {
  return language === 'hi'
    ? 'Write all guidance in simple Hindi using Devanagari script, even when the input or chat history is in English. किसान से रोज़ की बोलचाल वाली हिन्दी में बात करें। छोटे वाक्य लिखें।'
    : 'Write all guidance in plain English, even when the input or chat history is in another language.';
}

async function requestService(url, init, language) {
  let response;
  try {
    response = await fetch(url, init);
  } catch {
    throw aiError('Could not reach AgriGuard. Check the connection and try again.',
      'एग्रीगार्ड से संपर्क नहीं हो पाया। कनेक्शन जाँचें और फिर कोशिश करें।', language);
  }
  if (response.ok) return response;

  if (response.status === 429) {
    throw aiError('Too many requests. Wait a minute and try again.',
      'कई अनुरोध एक साथ आए हैं। एक मिनट बाद फिर कोशिश करें।', language);
  }
  if (response.status === 413) {
    throw aiError('The image is too large. Choose a smaller photo.',
      'फ़ोटो का आकार बहुत बड़ा है। छोटी फ़ोटो चुनें।', language);
  }
  let detail = await response.text();
  try {
    const parsed = JSON.parse(detail);
    detail = parsed.error?.message || parsed.error || detail;
  } catch { /* Plain text response */ }
  if (url === API_URL) {
    throw aiError(detail || `AI service error (${response.status}).`,
      'एआई से जवाब नहीं मिला। जाँचें कि Ollama चल रहा है और मॉडल डाउनलोड है, फिर कोशिश करें।', language);
  }
  throw aiError(detail || `Classifier error (${response.status}).`,
    'पत्ते की फ़ोटो की जाँच नहीं हो पाई। साफ़ फ़ोटो चुनकर फिर कोशिश करें। समस्या बनी रहे तो फ़ोटो जाँचने वाले मॉडल की सेटिंग जाँचें।', language);
}

export async function classifyPlantImage(imageBase64, language = 'en') {
  const response = await requestService(`${API_BASE_URL}/api/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  }, language);
  return response.json();
}

async function callLocalAI(messages, options = {}, language = 'en') {
  const response = await requestService(
    API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1800,
        stream: options.stream ?? false,
      }),
    },
    language
  );

  if (options.stream) {
    return response;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw aiError('AI service returned an empty response. Please try again.',
      'एआई से खाली जवाब मिला। कृपया फिर कोशिश करें।', language);
  }

  return content;
}

function parseJSON(result) {
  const cleaned = result
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
}

export async function analyzePlantDisease(
  imageBase64,
  description = '',
  datasetLabels = [],
  classifierPrediction = null,
  language = 'en'
) {
  const datasetHint = datasetLabels.length
    ? `\nPlantVillage dataset labels available (use the closest matching label only when supported by visible evidence):\n${datasetLabels.join(', ')}\nIf no label fits, return an uncertain diagnosis.`
    : '';
  const prompt = `
You are AgriGuard AI, an agricultural plant pathologist.

Analyze the uploaded plant image carefully.
Identify visible symptoms and possible diseases.

User description: ${description || 'Not provided'}
${datasetHint}
${classifierPrediction ? `\nTrained PlantVillage classifier prediction: ${classifierPrediction.plant} — ${classifierPrediction.disease} (${Math.round(classifierPrediction.confidence * 100)}% model score). Preserve the identity of this predicted disease when writing its name in the requested language and explain treatment for this class. If the image visibly conflicts with it, clearly note the mismatch and uncertainty. The score is a model score, not a calibrated probability.` : ''}

Do not invent symptoms that are not visible.
If the image is unclear or the diagnosis is uncertain,
clearly mention the uncertainty.
If no image is supplied, base the assessment only
on the description.

Respond ONLY with valid JSON:

{
  "disease_name": "Disease name or uncertain diagnosis",
  "confidence": "High/Medium/Low",
  "severity": "Critical/High/Medium/Low",
  "affected_parts": [],
  "symptoms": [],
  "causes": [],
  "treatment": {
    "immediate": [],
    "organic": [],
    "chemical": []
  },
  "prevention": [],
  "additional_notes": ""
}

Recommend chemical treatments only when appropriate.
Advise following local agricultural guidelines.
`;

  const content = [
    {
      type: 'text',
      text: prompt,
    },
  ];

  if (imageBase64) {
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    content.push({
      type: 'image_url',
      image_url: {
        url: imageUrl,
      },
    });
  }

  const messages = [
    {
      role: 'system',
      content: `You are AgriGuard AI. Provide evidence-based agricultural assessments in valid JSON. ${responseLanguage(language)} Keep JSON keys in English. Keep confidence and severity as single English values from the given choices. Write disease_name, all list entries, and additional_notes in the requested language.`,
    },
    {
      role: 'user',
      content,
    },
  ];

  const result = await callLocalAI(messages, {
    temperature: 0.3,
    max_tokens: language === 'hi' ? 1800 : 1400,
  }, language);

  try {
    return parseJSON(result);
  } catch {
    throw aiError('Could not process the plant analysis. Please try again.',
      'पौधे की जाँच का नतीजा पढ़ा नहीं जा सका। कृपया फिर कोशिश करें।', language);
  }
}

export async function getCropRecommendations({
  region,
  soilType,
  season,
  water,
  budget,
}, language = 'en') {
  const messages = [
    {
      role: 'system',
      content: `You are AgriGuard AI, an agricultural advisor. Respond only with valid JSON. ${responseLanguage(language)} Keep JSON keys in English and scores numeric. Use the English values Low, Medium or High for investment_level, water_needs and climate_resilience. Write all other text, including crop names, yield units, durations, tips and general advice, in the requested language. Keep each entry brief.`,
    },
    {
      role: 'user',
      content: `
Recommend the top 4 suitable crops based on:

Region: ${region}
Soil Type: ${soilType}
Season: ${season}
Water Availability: ${water}
Budget: ${budget}

Treat suitability scores and expected yields as
estimates, not measured results.

Return ONLY valid JSON:

{
  "recommendations": [
    {
      "crop_name": "Name",
      "emoji": "Relevant emoji",
      "suitability_score": 95,
      "expected_yield": "Estimated yield per hectare",
      "investment_level": "Low/Medium/High",
      "profit_potential": "Description",
      "water_needs": "Low/Medium/High",
      "growth_duration": "X months",
      "climate_resilience": "High/Medium/Low",
      "tips": [],
      "risks": []
    }
  ],
  "general_advice": "Overall farming advice"
}
`,
    },
  ];

  const result = await callLocalAI(messages, {
    temperature: 0.5,
    max_tokens: 1800,
  }, language);

  try {
    return parseJSON(result);
  } catch {
    return {
      recommendations: [],
      general_advice: result,
    };
  }
}

export async function* streamChat(messages, language = 'en') {
  const systemMessage = {
    role: 'system',
    content: language === 'hi' ? `
आप एग्रीगार्ड के खेती सहायक हैं। किसान से सरल हिन्दी में बात करें। जवाब देवनागरी में लिखें, चाहे सवाल किसी भी भाषा में हो।
किसान ने जो पूछा है, उसी पर काम की सलाह दें। मिट्टी, पानी, फसल, खाद और कीटों के लिए आम बोलचाल के शब्द इस्तेमाल करें। छोटे वाक्य लिखें।
इलाके के मौसम और किसान के खर्च का ध्यान रखें। अगर जानकारी कम है तो एक छोटा सवाल पूछें। आज के बाज़ार भाव का अनुमान न लगाएँ।
` : `
You are AgriGuard AI, a friendly agricultural assistant.

Help farmers with:
- Crop management
- Plant disease prevention
- Fertilizer recommendations
- Irrigation management
- Sustainable farming
- Pest control
- Soil management

Provide practical, clear and actionable advice.
Consider local conditions and farmer budgets.
Do not invent current market prices.
Explain technical terms in simple language.
${responseLanguage(language)}
Use headings and bullet points when helpful.
`,
  };

  const response = await callLocalAI(
    [systemMessage, ...messages],
    {
      temperature: language === 'hi' ? 0.3 : 0.7,
      max_tokens: 1800,
      stream: true,
    },
    language
  );

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();

        if (data === '[DONE]') return;

        let parsed;

        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }

        if (parsed.error) {
          throw aiError(parsed.error.message || 'The reply was interrupted. Please try again.',
            'जवाब बीच में रुक गया। कृपया फिर कोशिश करें।', language);
        }

        const content =
          parsed.choices?.[0]?.delta?.content;

        if (content) {
          yield content;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
