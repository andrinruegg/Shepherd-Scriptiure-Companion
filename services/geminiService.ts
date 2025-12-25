
import { GoogleGenAI, GenerateContentResponse, Content, Type, Modality } from "@google/genai";
import { Message, QuizQuestion } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
You are "Shepherd", a dedicated Bible Verse AI Assistant. Your primary goal is to provide relevant scripture, comfort, and spiritual wisdom.

Core Directives:
1. **Scripture First:** Every single response MUST include at least one Bible verse. 
2. **Context:** Briefly explain the meaning or context of the verse provided to help the user understand it.
3. **Thematic Matches:** If a user expresses an emotion (sad, happy, anxious), find a verse that directly speaks to that feeling.
4. **Formatting:** 
   - Always use blockquotes (>) for the Bible verse.
   - Use bold for the reference (e.g., **Psalm 23:1**).
   - Use Markdown for clear, readable structure.
5. **Persona:** Warm, encouraging, and pastoral. Speak like a kind mentor.

Avoid:
- Giving purely secular advice without a biblical foundation.
- Long-winded theological debates unless specifically asked.
- Failing to provide a verse.
`;

const mapHistoryToContent = (messages: Message[]): Content[] => {
  return messages
    .filter((m) => !m.isError)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text }], 
    }));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getActiveApiKey = (): string => {
    const manualKey = localStorage.getItem('shepherd_api_key');
    if (manualKey && manualKey.trim().length > 10) return manualKey.trim();
    return process.env.API_KEY || '';
};

const makeRequestWithRetry = async <T>(
    operation: (ai: GoogleGenAI) => Promise<T>, 
    retries = 3, 
    initialDelay = 1500
): Promise<T> => {
    const apiKey = getActiveApiKey();
    
    if (!apiKey) {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) throw new Error("NO_API_KEY_SELECTED");
        } else {
            throw new Error("NO_API_KEY_PROVIDED");
        }
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        return await operation(ai);
    } catch (error: any) {
        const errorMessage = error?.message || "";
        const status = error?.status;
        const code = error?.code;

        if (errorMessage.includes("Requested entity was not found.") || errorMessage.includes("API key not valid")) {
            throw new Error("API_KEY_INVALID");
        }

        if (status === 403 || code === 403 || errorMessage.includes('PERMISSION_DENIED')) {
            throw new Error("PERMISSION_DENIED");
        }
        const isRateLimit = status === 429 || code === 429 || errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED');
        if (isRateLimit && retries > 0) {
            await delay(initialDelay);
            return makeRequestWithRetry(operation, retries - 1, initialDelay * 2);
        }
        throw error;
    }
};

const cleanJson = (text: string): string => {
    return text.replace(/```json|```/g, '').trim();
};

export const generateChatTitle = async (userMessage: string, language: string = 'English'): Promise<string> => {
  try {
    const response = await makeRequestWithRetry(async (ai) => {
        return await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
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

export const sendMessageStream = async (
  history: Message[],
  newMessage: string,
  hiddenContext: string | undefined,
  bibleTranslation: string,
  language: string,
  displayName: string | undefined,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: any) => void,
  systemOverride?: string 
) => {
  try {
    const recentHistory = history.length > 10 ? history.slice(history.length - 10) : history;
    const formattedHistory = mapHistoryToContent(recentHistory);
    const userLanguage = language || "English";

    const finalSystemInstruction = systemOverride ? systemOverride : `${BASE_SYSTEM_INSTRUCTION}
    
    IMPORTANT PREFERENCES:
    1. QUOTE ALL SCRIPTURE USING THE ${bibleTranslation} TRANSLATION.
    2. RESPONSE LANGUAGE: You must respond in "${userLanguage}".
    ${displayName ? `3. GREETING: Address the user as "${displayName}" naturally.` : ''}
    `;

    const promptToSend = hiddenContext 
        ? `${newMessage}\n\n[System Note: ${hiddenContext}]` 
        : newMessage;

    await makeRequestWithRetry(async (ai) => {
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            history: formattedHistory,
            config: {
                systemInstruction: finalSystemInstruction,
                temperature: systemOverride ? 0.9 : 0.8, 
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

export const generateSpeech = async (text: string, language: string): Promise<string> => {
    return await makeRequestWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
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

export const translateContent = async (text: string, targetLanguage: string): Promise<string> => {
    return await makeRequestWithRetry(async (ai) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following text into ${targetLanguage}. Keep the tone and meaning exactly as is. Only return the translated text, no preamble.\n\nText: "${text}"`
        });
        return response.text || "Translation failed.";
    });
};

export const generateQuizQuestion = async (
    difficulty: 'Easy' | 'Medium' | 'Hard', 
    language: string,
    history: string[] 
): Promise<QuizQuestion> => {
    return await makeRequestWithRetry(async (ai) => {
        const historyContext = history.length > 0 
            ? `PREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT TOPICS OR VERSES FROM THESE): ${JSON.stringify(history.slice(-20))}` 
            : "";
        const prompt = `Generate a single multiple-choice Bible trivia question.
        Difficulty: ${difficulty}
        Language: ${language}
        Format: JSON Object { question, options: string[], correctIndex: number, explanation: string, reference: string }
        Ensure the options array has exactly 4 items.
        ${historyContext}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        reference: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text || "{}";
        const json = JSON.parse(cleanJson(text)) as QuizQuestion;
        if (!json.question || !Array.isArray(json.options) || json.options.length !== 4) {
            throw new Error("Invalid question format received from AI");
        }
        return json;
    });
};

export const getBibleChapterFromAI = async (
    bookName: string, 
    chapter: number, 
    translation: string,
    language: string
): Promise<{ verse: number, text: string }[]> => {
    return await makeRequestWithRetry(async (ai) => {
        const prompt = `Generate the full text of the Bible chapter: ${bookName} Chapter ${chapter}.
        Language: ${language}
        Translation Version: ${translation}
        Output Format:
        A strictly valid JSON array of objects. Each object must have a 'verse' (number) and 'text' (string).`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
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
            if (Array.isArray(json) && json.length > 0) return json;
            throw new Error("Invalid AI Bible response");
        } catch (e) {
            if (text && text.length > 50) {
                return [{ verse: 1, text: text.replace(/[\{\}\[\]"]/g, '') }];
            }
            return [];
        }
    });
};
