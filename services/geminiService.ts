
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Message } from "../types";

// --- KEY MANAGEMENT SYSTEM ---

// 1. Get System Keys (Split by comma if multiple are provided for rotation)
// @ts-ignore - process.env.API_KEY is replaced by Vite at build time
const RAW_ENV_KEY = process.env.API_KEY || "";
const SYSTEM_KEYS = RAW_ENV_KEY.split(',').map(k => k.trim()).filter(k => k.length > 0);

/**
 * Retrieves the best available API Key.
 * Priority: 
 * 1. User's Custom Key (LocalStorage)
 * 2. Random System Key (Rotation)
 */
const getActiveApiKey = (): string | null => {
    // Check for custom key first
    if (typeof window !== 'undefined') {
        const customKey = localStorage.getItem('custom_api_key');
        if (customKey && customKey.trim().length > 0) return customKey;
    }

    // Fallback to system keys (Rotate randomly to distribute load)
    if (SYSTEM_KEYS.length > 0) {
        const randomIndex = Math.floor(Math.random() * SYSTEM_KEYS.length);
        return SYSTEM_KEYS[randomIndex];
    }

    return null;
};

/**
 * Creates a fresh AI client instance using the current best key.
 * We must recreate this for every request to support key rotation/switching.
 */
const getClient = (): GoogleGenAI => {
    const key = getActiveApiKey();
    if (!key) throw new Error("NO_API_KEY");
    return new GoogleGenAI({ apiKey: key });
};

// --- SYSTEM INSTRUCTIONS ---

const BASE_SYSTEM_INSTRUCTION = `
You are "Shepherd", a warm, friendly, and encouraging Scripture Companion.
Your visual identity is a Shepherd's Staff and a Book.

Core Purpose:
To guide users—especially younger believers or those new to faith—to the peace and wisdom found in the Bible.

Tone & Style:
1. **Simple & Clear:** Use easy-to-understand words. Avoid overly complex theological jargon unless you explain it simply.
2. **Warm & Relatable:** Talk like a kind older brother or a wise youth leader. Be encouraging, not judgmental.
3. **Engaging:** Use emojis occasionally (like 🌿, ✨, 📖) to keep the text visually friendly, but don't overdo it.

Standard Rules:
1. **Prioritize Scripture**: Always include at least one relevant Bible verse.
2. **Format**: 
   - Use Markdown.
   - Use blockquotes (>) for verses.
   - Bold references (**John 3:16**).
3. **Variety**: Don't always use the same verses. If asked about "Love", look beyond 1 Corinthians 13.
`;

/**
 * Maps the internal Message format to the Gemini SDK Content format for history.
 */
const mapHistoryToContent = (messages: Message[]): Content[] => {
  // Filter out error messages and map to Content format
  return messages
    .filter((m) => !m.isError)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text }], 
    }));
};

/**
 * Helper to wait for a specified duration
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper to handle 429 Rate Limits with automatic retries AND key rotation.
 */
const makeRequestWithRetry = async <T>(
    operation: (client: GoogleGenAI) => Promise<T>, 
    retries = 3, 
    initialDelay = 1500
): Promise<T> => {
    try {
        const client = getClient();
        return await operation(client);
    } catch (error: any) {
        const errorMessage = error?.message || "";
        const status = error?.status;
        const code = error?.code;

        // Check for 403 Leaked / Permission Denied
        if (status === 403 || code === 403 || errorMessage.includes('leaked') || errorMessage.includes('PERMISSION_DENIED')) {
            throw new Error("API_KEY_LEAKED");
        }

        // Check for 429 (Resource Exhausted / Rate Limit)
        const isRateLimit = status === 429 || code === 429 || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED');
        
        if (isRateLimit && retries > 0) {
            console.warn(`Rate limit hit. Rotating key/retrying in ${initialDelay}ms... (${retries} retries left)`);
            await delay(initialDelay);
            // Recursive call will automatically pick a new random key from getClient() (if using system keys)
            return makeRequestWithRetry(operation, retries - 1, initialDelay * 2);
        }
        
        throw error;
    }
};

/**
 * Generates a short, smart title for the chat based on the first user message.
 */
export const generateChatTitle = async (userMessage: string): Promise<string> => {
  try {
    const response = await makeRequestWithRetry(async (client) => {
        return await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Summarize this user request into a short, elegant 3-5 word title for a journal entry (no quotes): "${userMessage}"`,
        });
    });
    return response.text ? response.text.trim() : 'New Entry';
  } catch (error) {
    console.warn("Failed to generate title", error);
    return userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
  }
};

/**
 * Sends a message to the Gemini chat session and streams the response.
 */
export const sendMessageStream = async (
  history: Message[],
  newMessage: string,
  hiddenContext: string | undefined,
  bibleTranslation: string,
  language: string,
  displayName: string | undefined,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
) => {
  try {
    const recentHistory = history.length > 10 ? history.slice(history.length - 10) : history;
    const formattedHistory = mapHistoryToContent(recentHistory);
    
    const dynamicInstruction = `${BASE_SYSTEM_INSTRUCTION}
    
    IMPORTANT PREFERENCES:
    1. Unless the user explicitly asks for a different version, YOU MUST QUOTE ALL SCRIPTURE USING THE ${bibleTranslation} TRANSLATION. Label the verses accordingly.
    2. LANGUAGE RULE: Detect the language of the user's message and respond in that same language. (e.g., if user says "Salut", respond in Romanian; if "Hola", respond in Spanish).
    ${displayName ? `3. USER IDENTITY: The user's name is "${displayName}". Address them by name occasionally to build a connection.` : ''}
    `;

    // Prompt construction
    const promptToSend = hiddenContext 
        ? `${newMessage}\n\n[System Note: ${hiddenContext}]` 
        : newMessage;

    // Use retry wrapper for the INITIAL stream connection
    await makeRequestWithRetry(async (client) => {
        const chat = client.chats.create({
            model: 'gemini-2.5-flash',
            history: formattedHistory,
            config: {
                systemInstruction: dynamicInstruction,
                temperature: 1.0, 
            },
        });
        
        const result = await chat.sendMessageStream({ message: promptToSend });
        
        for await (const chunk of result) {
            const responseChunk = chunk as GenerateContentResponse;
            if (responseChunk.text) {
                onChunk(responseChunk.text);
            }
        }
        return result;
    });
    
    onComplete();
  } catch (error) {
    console.error("Gemini API Error:", error);
    onError(error);
  }
};
