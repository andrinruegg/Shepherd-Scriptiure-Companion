import { v4 as uuidv4 } from 'uuid';

interface Verse {
  text: {
      en: string;
      ro: string;
      de: string;
      [key: string]: string; 
  };
  reference: {
      en: string; // Style: Book 1:1
      ro: string; // Style: Book 1:1
      de: string; // Style: Buch 1,1
      [key: string]: string;
  };
}

/**
 * DATABASE: Verified Verbatim Scripture
 * EN: NIV (New International Version)
 * RO: Dumitru Cornilescu
 * DE: Lutherbibel 2017
 */
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
  },
  { 
    text: { 
      en: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", 
      ro: "Nu vă îngrijoraţi de nimic; ci, în orice lucru, aduceţi cererile voastre la cunoştinţa lui Dumnezeu, prin rugăciuni şi cereri, cu mulţumiri.", 
      de: "Sorgt euch um nichts, sondern in allen Dingen lasst eure Bitten im Gebet und Flehen mit Danksagung vor Gott kundwerden!" 
    }, 
    reference: { en: "Philippians 4:6", ro: "Filipeni 4:6", de: "Philipper 4,6" } 
  },
  { 
    text: { 
      en: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", 
      ro: "Şi pacea lui Dumnezeu, care întrece orice pricepere, vă va păzi inimile şi gândurile în Hristos Isus.", 
      de: "Und der Friede Gottes, welcher höher ist als alle Vernunft, bewahre eure Herzen und Sinne in Christus Jesus." 
    }, 
    reference: { en: "Philippians 4:7", ro: "Filipeni 4:7", de: "Philipper 4,7" } 
  },
  { 
    text: { 
      en: "I can do all this through him who gives me strength.", 
      ro: "Pot totul în Hristos, care mă întăreşte.", 
      de: "Ich vermag alles durch den, der mich mächtig macht." 
    }, 
    reference: { en: "Philippians 4:13", ro: "Filipeni 4:13", de: "Philipper 4,13" } 
  },
  { 
    text: { 
      en: "“For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.”", 
      ro: "„Fiindcă atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu, pentru ca oricine crede în El să nu piară, ci să aibă viaţa veşnică.”", 
      de: "„Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.“" 
    }, 
    reference: { en: "John 3:16", ro: "Ioan 3:16", de: "Johannes 3,16" } 
  },
  { 
    text: { 
      en: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", 
      ro: "„Întăreşte-te şi îmbărbătează-te! Nu te teme şi nu te înspăimânta, căci Domnul Dumnezeul tău este cu tine în tot ce vei face.”", 
      de: "„Sei getrost und unverzagt, fürchte dich nicht und lass dich nicht erschrecken; denn der HERR, dein Gott, ist mit dir in allem, was du tun wirst.“" 
    }, 
    reference: { en: "Joshua 1:9", ro: "Iosua 1:9", de: "Josua 1,9" } 
  },
  { 
    text: { 
      en: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", 
      ro: "Căutaţi mai întâi Împărăţia lui Dumnezeu şi neprihănirea Lui, şi toate aceste lucruri vi se vor da pe deasupra.", 
      de: "Trachtet zuerst nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch das alles zufallen." 
    }, 
    reference: { en: "Matthew 6:33", ro: "Matei 6:33", de: "Matthäus 6,33" } 
  },
  { 
    text: { 
      en: "Cast all your anxiety on him because he cares for you.", 
      ro: "Şi aruncaţi asupra Lui toate îngrijorările voastre, căci El însuşi îngrijeşte de voi.", 
      de: "Alle eure Sorge werft auf ihn; denn er sorgt für euch." 
    }, 
    reference: { en: "1 Peter 5:7", ro: "1 Petru 5:7", de: "1. Petrus 5,7" } 
  },
  { 
    text: { 
      en: "Wait for the Lord; be strong and take heart and wait for the Lord.", 
      ro: "Nădăjduieşte în Domnul! Fii tare, îmbărbătează-ţi inima şi nădăjduieşte în Domnul!", 
      de: "Harre des HERRN! Sei getrost und unverzagt und harre des HERRN!" 
    }, 
    reference: { en: "Psalm 27:14", ro: "Psalmul 27:14", de: "Psalm 27,14" } 
  },
  { 
    text: { 
      en: "Your word is a lamp for my feet, a light on my path.", 
      ro: "Cuvântul Tău este o candelă pentru picioarele mele şi o lumină pe cărarea mea.", 
      de: "Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege." 
    }, 
    reference: { en: "Psalm 119:105", ro: "Psalm 119:105", de: "Psalm 119,105" } 
  },
  { 
    text: { 
      en: "He heals the brokenhearted and binds up their wounds.", 
      ro: "Tămăduieşte pe cei cu inima zdrobită şi le leagă rănile.", 
      de: "Er heilt, die zerbrochenen Herzens sind, und verbindet ihre Schmerzen." 
    }, 
    reference: { en: "Psalm 147:3", ro: "Psalmul 147:3", de: "Psalm 147,3" } 
  },
  { 
    text: { 
      en: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.", 
      ro: "Roada Duhului, dimpotrivă, este: dragostea, bucuria, pacea, îndelunga răbdare, bunătatea, facerea de bine, credincioşia.", 
      de: "Die Frucht aber des Geistes ist Liebe, Freude, Friede, Geduld, Freundlichkeit, Güte, Treue." 
    }, 
    reference: { en: "Galatians 5:22", ro: "Galateni 5:22", de: "Galater 5,22" } 
  },
  { 
    text: { 
      en: "God is our refuge and strength, an ever-present help in trouble.", 
      ro: "Dumnezeu este adăpostul şi sprijinul nostru, un ajutor care nu lipseşte niciodată în nevoi.", 
      de: "Gott ist unsere Zuversicht und Stärke, eine Hilfe in den großen Nöten, die uns getroffen haben." 
    }, 
    reference: { en: "Psalm 46:1", ro: "Psalmul 46:1", de: "Psalm 46,1" } 
  },
  { 
    text: { 
      en: "“Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.”", 
      ro: "„Vă las pacea, vă dau pacea Mea. Nu v-o dau cum o dă lumea. Să nu vi se tulbure inima, nici să nu se înspăimânte.”", 
      de: "„Frieden lasse ich euch, meinen Frieden gebe ich euch. Nicht gebe ich euch, wie die Welt gibt. Euer Herz erschrecke nicht und fürchte sich nicht.“" 
    }, 
    reference: { en: "John 14:27", ro: "Ioan 14:27", de: "Johannes 14,27" } 
  },
  { 
    text: { 
      en: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", 
      ro: "Nu vă îngrijoraţi dar de ziua de mâine; căci ziua de mâine se va îngrijora de ea însăşi. Ajunge zilei necazul ei.", 
      de: "Darum sorgt nicht für morgen, denn der morgige Tag wird für das Seine sorgen. Es ist genug, dass jeder Tag seine eigene Plage hat." 
    }, 
    reference: { en: "Matthew 6:34", ro: "Matei 6:34", de: "Matthäus 6,34" } 
  },
  { 
    text: { 
      en: "“Come to me, all you who are weary and burdened, and I will give you rest.”", 
      ro: "„Veniţi la Mine, toţi cei trudiţi şi împovăraţi, şi Eu vă voi da odihnă.”", 
      de: "„Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.“" 
    }, 
    reference: { en: "Matthew 11:28", ro: "Matei 11:28", de: "Matthäus 11,28" } 
  },
  { 
    text: { 
      en: "Let everything that has breath praise the Lord. Praise the Lord.", 
      ro: "Tot ce are suflare să laude pe Domnul! Lăudaţi pe Domnul!", 
      de: "Alles, was Odem hat, lobe den HERRN! Halleluja!" 
    }, 
    reference: { en: "Psalm 150:6", ro: "Psalmul 150:6", de: "Psalm 150,6" } 
  },
  { 
    text: { 
      en: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", 
      ro: "Zideşte în mine o inimă curată, Dumnezeule, pune în mine un duh nou şi statornic!", 
      de: "Schaffe in mir, Gott, ein reines Herz und gib mir einen neuen, beständigen Geist." 
    }, 
    reference: { en: "Psalm 51:10", ro: "Psalmul 51:10", de: "Psalm 51,12" } 
  },
  { 
    text: { 
      en: "The Lord is near to all who call on him, to all who call on him in truth.", 
      ro: "Domnul este lângă toţi cei ce-L cheamă, lângă cei ce-L cheamă cu toată inima.", 
      de: "Der HERR ist nahe allen, die ihn anrufen, allen, die ihn ernstlich anrufen." 
    }, 
    reference: { en: "Psalm 145:18", ro: "Psalmul 145:18", de: "Psalm 145,18" } 
  },
  { 
    text: { 
      en: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", 
      ro: "Dragostea este îndelung răbdătoare, este plină de bunătate; dragostea nu pizmuieşte; dragostea nu se laudă, nu se umflă de mândrie.", 
      de: "Die Liebe ist langmütig und freundlich, die Liebe eifert nicht, die Liebe treibt nicht Mutwillen, sie bläht sich nicht auf." 
    }, 
    reference: { en: "1 Corinthians 13:4", ro: "1 Corinteni 13:4", de: "1. Korinther 13,4" } 
  },
  { 
    text: { 
      en: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", 
      ro: "De altă parte, ştim că toate lucrurile lucrează împreună spre binele celor ce iubesc pe Dumnezeu.", 
      de: "Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen." 
    }, 
    reference: { en: "Romans 8:28", ro: "Romani 8:28", de: "Römer 8,28" } 
  },
  { 
    text: { 
      en: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", 
      ro: "Numele Domnului este un turn tare; cel neprihănit fuge în el şi stă la adăpost.", 
      de: "Der Name des HERRN ist ein festes Schloss; der Gerechte läuft dahin und wird beschirmt." 
    }, 
    reference: { en: "Proverbs 18:10", ro: "Proverbe 18:10", de: "Sprüche 18,10" } 
  },
  { 
    text: { 
      en: "For we live by faith, not by sight.", 
      ro: "Căci umblăm prin credinţă, nu prin vedere.", 
      de: "Denn wir wandeln im Glauben und nicht im Schauen." 
    }, 
    reference: { en: "2 Corinthians 5:7", ro: "2 Corinteni 5:7", de: "2. Korinther 5,7" } 
  },
  { 
    text: { 
      en: "Give thanks to the Lord, for he is good; his love endures forever.", 
      ro: "Lăudaţi pe Domnul, căci este bun, căci îndurarea Lui ţine în veac!", 
      de: "Danket dem HERRN; denn er ist freundlich, und seine Güte währet ewiglich." 
    }, 
    reference: { en: "Psalm 107:1", ro: "Psalmul 107:1", de: "Psalm 107,1" } 
  },
  { 
    text: { 
      en: "“I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.”", 
      ro: "„V-am spus aceste lucruri ca să aveţi pace în Mine. În lume veţi avea necazuri; dar îndrăzniţi, Eu am biruit lumea.”", 
      de: "„Solches habe ich mit euch geredet, damit ihr in mir Frieden habt. In der Welt habt ihr Angst; aber seid getrost, ich habe die Welt überwunden.“" 
    }, 
    reference: { en: "John 16:33", ro: "Ioan 16:33", de: "Johannes 16,33" } 
  }
];

export const getDailyVerse = (language: string): { text: string; reference: string } => {
  // Stable 24h cycle: Index based on days since epoch
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % VERSES.length;
  const rawVerse = VERSES[index];

  // Language Key Map
  let langKey = 'en';
  if (language === 'Romanian') langKey = 'ro';
  if (language === 'German') langKey = 'de';

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
    const todayStr = today.toDateString();
    const lastDateStr = localStorage.getItem(STORAGE_KEY_DATE);
    const currentStreak = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);

    if (!lastDateStr) {
        localStorage.setItem(STORAGE_KEY_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_COUNT, '1');
        return 1;
    }
    if (lastDateStr === todayStr) {
        return currentStreak;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDateStr === yesterday.toDateString()) {
        const newStreak = currentStreak + 1;
        localStorage.setItem(STORAGE_KEY_DATE, todayStr);
        localStorage.setItem(STORAGE_KEY_COUNT, newStreak.toString());
        return newStreak;
    }
    localStorage.setItem(STORAGE_KEY_DATE, todayStr);
    localStorage.setItem(STORAGE_KEY_COUNT, '1');
    return 1;
}

export const getStreak = (): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('current_streak_count') || '0', 10);
}