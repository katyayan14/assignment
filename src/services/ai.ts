interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Helper function to wait for a specified number of milliseconds
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration for exponential backoff
const MAX_RETRIES = 5;
const INITIAL_DELAY = 1000;

/**
 * Communicates with the Gemini API to get a response based on persona and history.
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: Array<{ sender: string; text: string }> = [],
  options: { personaPrompt: string; apiKey: string; }
): Promise<string> {
  const { personaPrompt, apiKey } = options;

  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  // System instruction for the model
  const fullPrompt = `${personaPrompt}

YOUR RESPONSE MUST FOLLOW THESE RULES STRICTLY:
1. ABSOLUTELY NO MARKDOWN STYLING: Your entire response must be plain text. Do NOT use markdown for any styling (no asterisks, underscores, or hashes).
2. USE EMOJIS: Use relevant emojis to make the conversation friendly and interactive.
3. BE HELPFUL BUT CONCISE: Keep answers to about a short paragraph unless asked for detail (e.g., "explain" or "in detail").
4. USE PARAGRAPHS AND LISTS: Use double newlines for paragraphs and simple hyphens '-' for lists.
5. STAY IN CHARACTER: Always answer from the perspective of your assigned persona.`;

  const systemInstruction = {
    parts: [{ text: fullPrompt }]
  };
  
  const contents: Message[] = conversationHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  // API Endpoint for the specific supported model
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: systemInstruction,
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
      }

      // Handle Rate Limiting (429) or Server Errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        if (attempt < MAX_RETRIES - 1) {
          const waitTime = INITIAL_DELAY * Math.pow(2, attempt);
          await delay(waitTime);
          continue;
        }
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);

    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        const waitTime = INITIAL_DELAY * Math.pow(2, attempt);
        await delay(waitTime);
      } else {
        // Final failure message
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to connect to the AI service after ${MAX_RETRIES} attempts. ${message}`);
      }
    }
  }

  throw new Error('Maximum retry attempts reached.');
}