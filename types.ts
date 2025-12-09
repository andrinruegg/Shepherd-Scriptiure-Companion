
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | string; // Allow string for JSON parsing
  isError?: boolean;
  hiddenContext?: string; // Used to send unique IDs/instructions to AI without showing user
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  isTemp?: boolean; // New flag: If true, this chat hasn't been saved to DB yet
}

export interface ChatState {
  chats: ChatSession[];
  activeChatId: string | null;
  isLoading: boolean;
}

export interface UserPreferences {
  bibleTranslation: string; // e.g., 'NIV', 'ESV', 'KJV'
  theme: 'light' | 'dark';
  winterTheme?: boolean; // NEW: Winter Mode Toggle
  language: string;
  displayName?: string;
  avatar?: string; // NEW: Base64 string for profile picture
  savedVerses?: SavedItem[];
}

// --- NEW TYPES FOR SOCIAL FEATURES ---

export interface UserProfile {
  id: string;
  share_id: string;
  display_name: string;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  requester: UserProfile;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface AppUpdate {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string; // Text or URL
  message_type: 'text' | 'image' | 'audio';
  created_at: string;
}

// --- NEW TYPES FOR BIBLE READER & SAVED ITEMS ---

export type AppView = 'chat' | 'bible' | 'saved';

export interface BibleBook {
  id: string;   // e.g. 'GEN'
  name: string; // e.g. 'Genesis'
  chapters: number;
  testament: 'OT' | 'NT';
}

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  reference: string;
  verses: BibleVerse[];
  translation_id: string;
  verses_count?: number; 
}

export interface BibleHighlight {
  id: string;
  ref: string; // e.g., "JHN 3:16"
  color: 'yellow' | 'green' | 'blue' | 'pink';
}

export interface SavedItem {
  id: string;
  type: 'verse' | 'chat'; // Is it a Bible Verse or a Chat Message?
  content: string;        // The text content
  reference?: string;     // e.g. "John 3:16" (Only for verses)
  date: number;           // Timestamp
  tags?: string[];
  metadata?: any;         // Extra data (book, chapter, etc)
}