
import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality } from "@google/genai";
import { Message, QuizQuestion } from "../types";

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
 * Clean JSON string from potential Markdown code blocks
 */
const cleanJson = (text: string): string => {
    return text.replace(/```json|```/g, '').trim();
};

/**
 * Generates a short, smart title for the chat based on the first user message.
 */
export const generateChatTitle = async (userMessage: string, language: string = 'English'): Promise<string> => {
  try {
    const response = await makeRequestWithRetry(async (client) => {
        return await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Summarize this user request into a short, elegant 3-5 word title for a journal entry (no quotes).
          
          CRITICAL INSTRUCTION: You MUST output the title in the "${language}" language, regardless of the language of the user's message.
          
          User Message: "${userMessage}"`,
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
    
    // Default fallback if language is missing
    const userLanguage = language || "English";

    const dynamicInstruction = `${BASE_SYSTEM_INSTRUCTION}
    
    IMPORTANT PREFERENCES:
    1. Unless the user explicitly asks for a different version, YOU MUST QUOTE ALL SCRIPTURE USING THE ${bibleTranslation} TRANSLATION. Label the verses accordingly.
    2. LANGUAGE RULE: The user has set their app language to "${userLanguage}". YOU MUST RESPOND IN ${userLanguage}, even if they type in a different language.
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

/**
 * Generates High Quality AI Speech for text.
 * Returns Base64 encoded audio string.
 */
export const generateSpeech = async (text: string, language: string): Promise<string> => {
    return await makeRequestWithRetry(async (client) => {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // "Fenrir" is a deep, authoritative male voice suitable for Bible reading.
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' },
                    },
                },
            },
        });
        
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) throw new Error("No audio data returned");
        return audioData;
    });
};

/**
 * Translates content to the target language.
 */
export const translateContent = async (text: string, targetLanguage: string): Promise<string> => {
    return await makeRequestWithRetry(async (client) => {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text into ${targetLanguage}. Keep the tone and meaning exactly as is. Only return the translated text, no preamble.\n\nText: "${text}"`
        });
        return response.text || "Translation failed.";
    });
};

/**
 * Generates a Bible Quiz Question.
 */
export const generateQuizQuestion = async (
    difficulty: 'Easy' | 'Medium' | 'Hard', 
    language: string,
    history: string[] // List of previously asked questions to avoid
): Promise<QuizQuestion> => {
    return await makeRequestWithRetry(async (client) => {
        // Construct history string to inform AI what NOT to ask
        const historyContext = history.length > 0 
            ? `PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT TOPICS OR VERSES FROM THESE): ${JSON.stringify(history.slice(-20))}` 
            : "";

        const prompt = `Generate a single multiple-choice Bible trivia question.
        Difficulty: ${difficulty}
        Language: ${language}
        Format: JSON Object { question, options: string[], correctIndex: number, explanation: string, reference: string }
        Ensure the options array has exactly 4 items. The explanation should be encouraging.
        
        CRITICAL: Ensure the question is UNIQUE and DIFFERENT from previous ones.
        ${historyContext}`;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        reference: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text || "{}";
        const json = JSON.parse(cleanJson(text)) as QuizQuestion;
        
        // Strict Validation
        if (!json.question || !Array.isArray(json.options) || json.options.length !== 4) {
            throw new Error("Invalid question format received from AI");
        }
        
        return json;
    });
};

/**
 * Generates the text for a specific Bible chapter using AI.
 * Used as a fallback when standard APIs fail.
 */
export const getBibleChapterFromAI = async (
    bookName: string, 
    chapter: number, 
    translation: string,
    language: string
): Promise<{ verse: number, text: string }[]> => {
    return await makeRequestWithRetry(async (client) => {
        const prompt = `Generate the full text of the Bible chapter: ${bookName} Chapter ${chapter}.
        
        Language: ${language}
        Translation Version: ${translation} (e.g. Cornilescu for Romanian, Luther for German, NIV for English)
        
        Output Format:
        A strictly valid JSON array of objects. Each object must have a 'verse' (number) and 'text' (string).
        Do NOT include any introduction, markdown formatting, or notes. ONLY the JSON array.
        
        Example:
        [
          { "verse": 1, "text": "In the beginning..." },
          { "verse": 2, "text": "And the earth was..." }
        ]`;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash', // Flash is fast and good enough for reciting known text
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            verse: { type: Type.INTEGER },
                            text: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text || "[]";
        try {
            const json = JSON.parse(cleanJson(text));
            if (Array.isArray(json) && json.length > 0) {
                return json;
            }
            throw new Error("Invalid AI Bible response");
        } catch (e) {
            console.error("AI Bible Parsing Error", e);
            // FAILSAFE: If JSON parsing fails but text exists, return raw text as verse 1
            // This ensures the user sees SOMETHING rather than an error.
            if (text && text.length > 50) {
                return [{
                    verse: 1,
                    text: text.replace(/[\{\}\[\]"]/g, '') // Light cleanup
                }];
            }
            return [];
        }
    });
};
