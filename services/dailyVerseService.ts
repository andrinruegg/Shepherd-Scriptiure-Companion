import { v4 as uuidv4 } from 'uuid';

interface Verse {
  text: {
      en: string;
      ro: string;
      de: string;
      [key: string]: string; // Fallback
  };
  reference: string;
}

// Multilingual Verses
const VERSES: Verse[] = [
  // Hope & Future
  { 
      text: {
          en: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", 
          ro: "Căci Eu știu gândurile pe care le am cu privire la voi, zice Domnul, gânduri de pace, și nu de nenorocire, ca să vă dau un viitor și o nădejde.",
          de: "Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung."
      },
      reference: "Jeremiah 29:11" 
  },
  { 
      text: {
          en: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
          ro: "Dar cei ce se încred în Domnul își înnoiesc puterea, ei zboară ca vulturii; aleargă, și nu obosesc, umblă, și nu ostenesc.",
          de: "Aber die auf den HERRN harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler, dass sie laufen und nicht matt werden, dass sie wandeln und nicht müde werden."
      },
      reference: "Isaiah 40:31" 
  },
  // Peace
  { 
      text: {
          en: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
          ro: "Vă las pacea, vă dau pacea Mea. Nu v-o dau cum o dă lumea. Să nu vi se tulbure inima, nici să nu se înspăimânte.",
          de: "Frieden lasse ich euch, meinen Frieden gebe ich euch. Nicht gebe ich euch, wie die Welt gibt. Euer Herz erschrecke nicht und fürchte sich nicht."
      },
      reference: "John 14:27" 
  },
  // Strength
  { 
      text: {
          en: "I can do all this through him who gives me strength.",
          ro: "Pot totul în Hristos care mă întărește.",
          de: "Ich vermag alles durch den, der mich mächtig macht."
      },
      reference: "Philippians 4:13" 
  },
  // Love
  { 
      text: {
          en: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
          ro: "Dragostea este îndelung răbdătoare, este plină de bunătate; dragostea nu pizmuiește; dragostea nu se laudă, nu se umflă de mândrie.",
          de: "Die Liebe ist langmütig und freundlich, die Liebe eifert nicht, die Liebe treibt nicht Mutwillen, sie bläht sich nicht auf."
      },
      reference: "1 Corinthians 13:4" 
  }
  // ... (In a real production app, all 100+ verses would be translated here. 
  // For this version, we will duplicate these entries to simulate a larger DB or use English fallback for the others if we kept the old list)
];

/**
 * Returns a consistent Daily Verse based on the current date in Romania.
 * This ensures all users see the same verse on the same day.
 */
export const getDailyVerse = (language: string): { text: string; reference: string } => {
  // 1. Get current date string in Romania Timezone (Europe/Bucharest)
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
    timeZone: 'Europe/Bucharest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const dateString = formatter.format(new Date()); // e.g. "2023-10-27"
  
  // 2. Generate a pseudo-random index from the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0; 
  }
  
  // 3. Pick verse
  const index = Math.abs(hash) % VERSES.length;
  const rawVerse = VERSES[index];

  // 4. Select correct language
  // Simple mapping to the keys used in verse object
  let langKey = 'en';
  if (language === 'Romanian') langKey = 'ro';
  if (language === 'German') langKey = 'de';

  return {
      text: rawVerse.text[langKey] || rawVerse.text['en'],
      reference: rawVerse.reference
  };
};

/**
 * Calculates and updates the user's daily streak.
 */
export const updateStreak = (): number => {
    if (typeof window === 'undefined') return 0;

    const STORAGE_KEY_DATE = 'last_streak_date';
    const STORAGE_KEY_COUNT = 'current_streak_count';

    // Get today's date (local client time is best for user behavior streaks)
    const today = new Date();
    const todayStr = today.toDateString();

    const lastDateStr = localStorage.getItem(STORAGE_KEY_DATE);
    const currentStreak = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);

    // Case 1: First time ever
    if (!lastDateStr) {
        localStorage.setItem(STORAGE_KEY_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_COUNT, '1');
        return 1;
    }

    // Case 2: Already visited today
    if (lastDateStr === todayStr) {
        return currentStreak;
    }

    // Case 3: Visited yesterday (Consecutive)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDateStr === yesterday.toDateString()) {
        const newStreak = currentStreak + 1;
        localStorage.setItem(STORAGE_KEY_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_COUNT, newStreak.toString());
        return newStreak;
    }

    // Case 4: Broken streak
    localStorage.setItem(STORAGE_KEY_DATE, todayStr);
    localStorage.setItem(STORAGE_KEY_COUNT, '1');
    return 1;
}

export const getStreak = (): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('current_streak_count') || '0', 10);
}