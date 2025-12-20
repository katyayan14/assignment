interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Helper function to wait for a specified number of milliseconds
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

export async function getAIResponse(
  userMessage: string,
  conversationHistory: Array<{ sender: string; text: string }> = []
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const messages: Message[] = [];

  // Add conversation history
  conversationHistory.forEach((msg) => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Add current user message
  messages.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
      }

      // Handle specific error cases
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES}):`, errorData);
        
        if (attempt < MAX_RETRIES - 1) {
          // Exponential backoff: wait 1s, 2s, 4s...
          const waitTime = BASE_DELAY * Math.pow(2, attempt);
          console.log(`Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          continue;
        } else {
          throw new Error('RATE_LIMIT_EXCEEDED: Too many requests. Please wait a moment and try again.');
        }
      }

      // Handle other HTTP errors
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      if (response.status === 401) {
        throw new Error('INVALID_API_KEY: Please check your Gemini API key.');
      } else if (response.status === 403) {
        throw new Error('INSUFFICIENT_QUOTA: You have exceeded your Gemini quota. Please check your billing and add credits to your account.');
      } else if (response.status >= 500) {
        // Server errors - retry with backoff
        if (attempt < MAX_RETRIES - 1) {
          const waitTime = BASE_DELAY * Math.pow(2, attempt);
          console.log(`Server error, waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          continue;
        }
      }

      throw new Error(`API_ERROR_${response.status}: ${errorData.error?.message || response.statusText}`);

    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        // Final attempt failed
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('NETWORK_ERROR: Unable to connect to OpenAI API. Please check your internet connection.');
      }
      
      // Network error - retry with backoff
      console.warn(`Network error (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
      const waitTime = BASE_DELAY * Math.pow(2, attempt);
      await delay(waitTime);
    }
  }

  throw new Error('MAX_RETRIES_EXCEEDED: Unable to get response after multiple attempts.');
}
