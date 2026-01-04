
import { v4 as uuidv4 } from 'uuid';

interface Verse {
  text: {
      en: string;
      ro: string;
      de: string;
      [key: string]: string; 
  };
  reference: {
      en: string;
      ro: string;
      de: string;
      [key: string]: string;
  };
}

const VERSES: Verse[] = [
  { 
    text: { 
      en: "“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”", 
      ro: "„Căci Eu ştiu gândurile pe care le am cu privire la voi”, zice Domnul, „gânduri de pace şi nu de nenorocire, ca să vă dau un viitor şi o nădejde.”", 
      de: "„Denn ich weiß wohl, was ich für Gedanken über euch habe“, spricht der HERR: „Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.“" 
    }, 
    reference: { en: "Jeremiah 29:11", ro: "Ieremia 29:11", de: "Jeremia 29,11" } 
  },
  { 
    text: { 
      en: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.", 
      ro: "Domnul este Păstorul meu: nu voi duce lipsă de nimic. El mă paşte în păşuni verzi şi mă duce la ape de odihnă.", 
      de: "Der HERR ist mein Hirte, mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser." 
    }, 
    reference: { en: "Psalm 23:1-2", ro: "Psalmul 23:1-2", de: "Psalm 23,1-2" } 
  },
  { 
    text: { 
      en: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", 
      ro: "Încrede-te în Domnul din toată inima ta şi nu te bizui pe înţelepciunea ta! Recunoaşte-L în toate căile tale, şi El îţi va netezi cărările.", 
      de: "Verlass dich auf den HERRN von ganzem Herzen, und verlass dich nicht auf deinen Verstand, sondern gedenke an ihn in allen deinen Wegen, so wird er dich recht führen." 
    }, 
    reference: { en: "Proverbs 3:5-6", ro: "Proverbe 3:5-6", de: "Sprüche 3,5-6" } 
  },
  { 
    text: { 
      en: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", 
      ro: "Dar cei ce se încred în Domnul îşi înnoiesc puterea, ei zboară ca vulturii; aleargă, şi nu obosesc, umblă, şi nu ostenesc.", 
      de: "Aber die auf den HERRN harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler, dass sie laufen und nicht matt werden, dass sie wandeln und nicht müde werden." 
    }, 
    reference: { en: "Isaiah 40:31", ro: "Isaia 40:31", de: "Jesaja 40,31" } 
  }
];

export const getDailyVerse = (language: string): { text: string; reference: string } => {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % VERSES.length;
  const rawVerse = VERSES[index];

  let langKey = 'en';
  if (language === 'Romanian' || language === 'ro') langKey = 'ro';
  if (language === 'German' || language === 'de') langKey = 'de';

  return {
      text: rawVerse.text[langKey] || rawVerse.text['en'],
      reference: rawVerse.reference[langKey] || rawVerse.reference['en']
  };
};

export const updateStreak = (): number => {
    if (typeof window === 'undefined') return 0;
    const STORAGE_KEY_DATE = 'last_streak_date';
    const STORAGE_KEY_COUNT = 'current_streak_count';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDateStr = localStorage.getItem(STORAGE_KEY_DATE);
    const currentStreak = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);

    if (!lastDateStr) {
        localStorage.setItem(STORAGE_KEY_DATE, today.toISOString());
        localStorage.setItem(STORAGE_KEY_COUNT, '1');
        return 1;
    }

    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return currentStreak; // Same day, no change
    } else if (diffDays === 1) {
        const newStreak = currentStreak + 1;
        localStorage.setItem(STORAGE_KEY_DATE, today.toISOString());
        localStorage.setItem(STORAGE_KEY_COUNT, newStreak.toString());
        return newStreak; // Consecutive day
    } else {
        localStorage.setItem(STORAGE_KEY_DATE, today.toISOString());
        localStorage.setItem(STORAGE_KEY_COUNT, '1');
        return 1; // Missed a day or more, reset to 1
    }
};

export const getStreak = (): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('current_streak_count') || '0', 10);
};
