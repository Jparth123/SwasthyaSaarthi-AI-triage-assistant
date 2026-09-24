/**
 * Pluggable LLM Client Connector
 * Supports optional external API keys (Gemini / OpenAI compatible),
 * enforces structured output, and provides seamless deterministic fallback.
 */

import { parseNaturalLanguage } from './semanticParser.js';

export async function interpretWithLLM(prompt, currentState, settings = {}) {
  const { llmProvider, apiKey, model } = settings;

  // If no external key or explicitly set to local, use built-in deterministic hybrid parser
  if (!apiKey || llmProvider === 'local') {
    return parseNaturalLanguage(prompt, currentState);
  }

  // If Gemini API is configured:
  if (llmProvider === 'gemini' && apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      
      const systemPrompt = `You are a travel planning AI. Return ONLY a valid JSON object matching this schema:
      {
        "action": "PLAN_TRIP" | "ADD_ACTIVITY" | "REMOVE_ACTIVITY" | "OPTIMIZE_ROUTE" | "CALCULATE_BUDGET" | "SEARCH_LODGING" | "SEARCH_TRANSIT" | "UNDO" | "RESET",
        "confidence": 0.95,
        "rawPrompt": "${prompt}",
        "entities": {
          "destination": "city or country string",
          "durationDays": number,
          "targetDay": number,
          "title": "item title",
          "type": "activity" | "meal" | "transport" | "lodging",
          "budget": { "amount": number, "currency": "JPY", "tier": "budget" | "moderate" | "luxury" },
          "interests": ["list of strings"]
        }
      }`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser input: "${prompt}"` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed && parsed.action) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('External LLM call failed or timed out, falling back to built-in semantic parser:', err);
    }
  }

  // Fallback to local parser
  return parseNaturalLanguage(prompt, currentState);
}
