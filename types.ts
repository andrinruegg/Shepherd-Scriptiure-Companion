
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | string; 
  isError?: boolean;
  hiddenContext?: string; 
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  isTemp?: boolean; 
}

export interface ChatState {
  chats: ChatSession[];
  activeChatId: string | null;
  isLoading: boolean;
}

export interface UserPreferences {
  bibleTranslation: string; 
  theme: 'light' | 'dark';
  
  winterTheme?: boolean; 
  winterSnow?: boolean;    
  winterLights?: boolean;  
  winterIcicles?: boolean; 

  princessTheme?: boolean;
  princessHearts?: boolean;   
  princessSparkles?: boolean; 

  language: string;
  displayName?: string;
  avatar?: string; 
  bio?: string; 
  savedVerses?: SavedItem[];
}

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
  bio?: string; 
  last_seen?: string; 
  unread_count?: number; 
  last_message_at?: string; 
  
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
  content: string; 
  message_type: 'text' | 'image' | 'audio';
  created_at: string;
  read_at?: string | null; 
}

export type SocialTab = 'inbox' | 'friends' | 'add' | 'profile';

export type AppView = 'home' | 'chat' | 'bible' | 'saved' | 'prayer' | 'quiz' | 'stories' | 'explorer';

export interface BibleBook {
  id: string;   
  name: string; 
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
  ref: string; 
  color: 'yellow' | 'green' | 'blue' | 'pink';
}

export type PrayerVisibility = 'private' | 'friends' | 'specific' | 'public';

export interface PrayerInteraction {
    type: 'amen';
    count: number;
    user_ids: string[]; 
}

export interface SavedItem {
  id: string;
  user_id?: string; 
  type: 'verse' | 'chat' | 'prayer'; 
  content: string;        
  reference?: string;     
  date: number;           
  tags?: string[];
  metadata?: {
      answered?: boolean;
      visibility?: PrayerVisibility;
      allowed_users?: string[]; 
      is_anonymous?: boolean;   
      author_name?: string;     
      author_avatar?: string;   
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

export interface BibleStory {
  id: string;
  name: string;
  role: string;
  image: string;
  meaningOfName?: string;
  timeline?: string;
  traits: string[];
  family?: {
      parents?: string;
      siblings?: string;
  };
  keyVerses?: { ref: string; text: string }[];
  biography: string[];
}

declare global {
  // Define AIStudio interface to prevent type clash with pre-defined environment types
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: All declarations of 'aistudio' must have identical modifiers. 
    // Match the host environment's declaration to avoid TypeScript conflicts by making it optional.
    aistudio?: AIStudio;
  }
}