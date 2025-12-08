import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { Message } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We now treat this as a base template, not a const
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
      parts: [{ text: m.text }], // We only put the visible text in history to keep context clean
    }));
};

/**
 * Generates a short, smart title for the chat based on the first user message.
 */
export const generateChatTitle = async (userMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize this user request into a short, elegant 3-5 word title for a journal entry (no quotes): "${userMessage}"`,
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
    const formattedHistory = mapHistoryToContent(history);
    
    // Inject translation preference into system instruction
    const dynamicInstruction = `${BASE_SYSTEM_INSTRUCTION}
    
    IMPORTANT PREFERENCES:
    1. Unless the user explicitly asks for a different version, YOU MUST QUOTE ALL SCRIPTURE USING THE ${bibleTranslation} TRANSLATION. Label the verses accordingly.
    2. LANGUAGE RULE: Detect the language of the user's message and respond in that same language. (e.g., if user says "Salut", respond in Romanian; if "Hola", respond in Spanish).
    ${displayName ? `3. USER IDENTITY: The user's name is "${displayName}". Address them by name occasionally to build a connection.` : ''}
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: dynamicInstruction,
        temperature: 1.0, 
      },
    });
    
    // If hiddenContext exists, we append it to the prompt sent to AI
    // NOTE: We wrap it in a system note so the AI sees it but treats the user text as primary
    const promptToSend = hiddenContext 
        ? `${newMessage}\n\n[System Note: ${hiddenContext}]` 
        : newMessage;
    
    const result = await chat.sendMessageStream({ message: promptToSend });
    
    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      if (responseChunk.text) {
        onChunk(responseChunk.text);
      }
    }
    
    onComplete();
  } catch (error) {
    console.error("Gemini API Error:", error);
    onError(error);
  }
};