

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
  winterTheme?: boolean; // Master Toggle
  winterSnow?: boolean;    // Sub Toggle: Falling Snow
  winterLights?: boolean;  // Sub Toggle: Christmas Lights
  winterIcicles?: boolean; // Sub Toggle: Corner Icicles
  language: string;
  displayName?: string;
  avatar?: string; // NEW: Base64 string for profile picture
  bio?: string; // NEW: User description
  savedVerses?: SavedItem[];
}

// --- NEW TYPES FOR SOCIAL FEATURES ---

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  date_earned: number;
  difficulty_level?: 'Easy' | 'Medium' | 'Hard';
}

export interface UserProfile {
  id: string;
  share_id: string;
  display_name: string;
  avatar?: string;
  bio?: string; // NEW: User description
  last_seen?: string; // ISO Date string for online status
  unread_count?: number; // Number of unread messages from this user
  last_message_at?: string; // Timestamp of last message for sorting
  
  // NEW STATS
  streak?: number;
  achievements?: Achievement[];
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
  read_at?: string | null; // Null if unread
}

// --- NEW TYPES FOR BIBLE READER & SAVED ITEMS ---

export type AppView = 'chat' | 'bible' | 'saved' | 'prayer' | 'quiz';

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

export type PrayerVisibility = 'private' | 'friends' | 'specific' | 'public';

export interface PrayerInteraction {
    type: 'amen';
    count: number;
    user_ids: string[]; // IDs of users who clicked Amen
}

export interface SavedItem {
  id: string;
  user_id?: string; // Added to track ownership
  type: 'verse' | 'chat' | 'prayer'; 
  content: string;        // The text content
  reference?: string;     // e.g. "John 3:16" (Only for verses)
  date: number;           // Timestamp
  tags?: string[];
  metadata?: {
      answered?: boolean;
      visibility?: PrayerVisibility;
      allowed_users?: string[]; // IDs for specific sharing
      is_anonymous?: boolean;   // NEW: Anonymous toggle
      author_name?: string;     // Snapshot of name
      author_avatar?: string;   // Snapshot of avatar
      interactions?: PrayerInteraction;
      [key: string]: any;
  };         
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}