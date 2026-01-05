import { BibleBook, BibleChapter } from '../types';
import { getBibleChapterFromAI } from './geminiService';

export const BIBLE_BOOKS: (BibleBook & { names: { en: string, ro: string, de: string, es: string, fr: string } })[] = [
  { id: 'GEN', name: 'Genesis', names: { en: 'Genesis', ro: 'Geneza', de: '1. Mose', es: 'Génesis', fr: 'Genèse' }, chapters: 50, testament: 'OT' },
  { id: 'EXO', name: 'Exodus', names: { en: 'Exodus', ro: 'Exodul', de: '2. Mose', es: 'Éxodo', fr: 'Exode' }, chapters: 40, testament: 'OT' },
  { id: 'LEV', name: 'Leviticus', names: { en: 'Leviticus', ro: 'Leviticul', de: '3. Mose', es: 'Levítico', fr: 'Lévitique' }, chapters: 27, testament: 'OT' },
  { id: 'NUM', name: 'Numbers', names: { en: 'Numbers', ro: 'Numeri', de: '4. Mose', es: 'Números', fr: 'Nombres' }, chapters: 36, testament: 'OT' },
  { id: 'DEU', name: 'Deuteronomy', names: { en: 'Deuteronomy', ro: 'Deuteronomul', de: '5. Mose', es: 'Deuteronomio', fr: 'Deutéronome' }, chapters: 34, testament: 'OT' },
  { id: 'JOS', name: 'Joshua', names: { en: 'Joshua', ro: 'Iosua', de: 'Josua', es: 'Josué', fr: 'Josué' }, chapters: 24, testament: 'OT' },
  { id: 'JDG', name: 'Judges', names: { en: 'Judges', ro: 'Judecătorii', de: 'Richter', es: 'Jueces', fr: 'Juges' }, chapters: 21, testament: 'OT' },
  { id: 'RUT', name: 'Ruth', names: { en: 'Ruth', ro: 'Rut', de: 'Rut', es: 'Rut', fr: 'Ruth' }, chapters: 4, testament: 'OT' },
  { id: '1SA', name: '1 Samuel', names: { en: '1 Samuel', ro: '1 Samuel', de: '1. Samuel', es: '1 Samuel', fr: '1 Samuel' }, chapters: 31, testament: 'OT' },
  { id: '2SA', name: '2 Samuel', names: { en: '2 Samuel', ro: '2 Samuel', de: '2. Samuel', es: '2 Samuel', fr: '2 Samuel' }, chapters: 24, testament: 'OT' },
  { id: '1KI', name: '1 Kings', names: { en: '1 Kings', ro: '1 Împărați', de: '1. Könige', es: '1 Reyes', fr: '1 Rois' }, chapters: 22, testament: 'OT' },
  { id: '2KI', name: '2 Kings', names: { en: '2 Kings', ro: '2 Împărați', de: '2. Könige', es: '2 Reyes', fr: '2 Rois' }, chapters: 25, testament: 'OT' },
  { id: '1CH', name: '1 Chronicles', names: { en: '1 Chronicles', ro: '1 Cronici', de: '1. Chronik', es: '1 Crónicas', fr: '1 Chroniques' }, chapters: 29, testament: 'OT' },
  { id: '2CH', name: '2 Chronicles', names: { en: '2 Chronicles', ro: '2 Cronici', de: '2. Chronik', es: '2 Crónicas', fr: '2 Chroniques' }, chapters: 36, testament: 'OT' },
  { id: 'EZR', name: 'Ezra', names: { en: 'Ezra', ro: 'Ezra', de: 'Esra', es: 'Esdras', fr: 'Esdras' }, chapters: 10, testament: 'OT' },
  { id: 'NEH', name: 'Nehemiah', names: { en: 'Nehemiah', ro: 'Neemia', de: 'Nehemia', es: 'Nehemías', fr: 'Néhémie' }, chapters: 13, testament: 'OT' },
  { id: 'EST', name: 'Esther', names: { en: 'Esther', ro: 'Estera', de: 'Ester', es: 'Ester', fr: 'Esther' }, chapters: 10, testament: 'OT' },
  { id: 'JOB', name: 'Job', names: { en: 'Job', ro: 'Iov', de: 'Hiob', es: 'Job', fr: 'Job' }, chapters: 42, testament: 'OT' },
  { id: 'PSA', name: 'Psalms', names: { en: 'Psalms', ro: 'Psalmii', de: 'Psalmen', es: 'Salmos', fr: 'Psaumes' }, chapters: 150, testament: 'OT' },
  { id: 'PRO', name: 'Proverbs', names: { en: 'Proverbs', ro: 'Proverbele', de: 'Sprüche', es: 'Proverbios', fr: 'Proverbes' }, chapters: 31, testament: 'OT' },
  { id: 'ECC', name: 'Ecclesiastes', names: { en: 'Ecclesiastes', ro: 'Eclesiastul', de: 'Prediger', es: 'Eclesiastés', fr: 'Ecclésiaste' }, chapters: 12, testament: 'OT' },
  { id: 'SNG', name: 'Song of Solomon', names: { en: 'Song of Songs', ro: 'Cântarea Cântărilor', de: 'Hohelied', es: 'Cantares', fr: 'Cantique des Cantiques' }, chapters: 8, testament: 'OT' },
  { id: 'ISA', name: 'Isaiah', names: { en: 'Isaiah', ro: 'Isaia', de: 'Jesaja', es: 'Isaías', fr: 'Ésaïe' }, chapters: 66, testament: 'OT' },
  { id: 'JER', name: 'Jeremiah', names: { en: 'Jeremiah', ro: 'Ieremia', de: 'Jeremia', es: 'Jeremías', fr: 'Jérémie' }, chapters: 52, testament: 'OT' },
  { id: 'LAM', name: 'Lamentations', names: { en: 'Lamentations', ro: 'Plângerile', de: 'Klagelieder', es: 'Lamentaciones', fr: 'Lamentations' }, chapters: 5, testament: 'OT' },
  { id: 'EZK', name: 'Ezekiel', names: { en: 'Ezekiel', ro: 'Ezechiel', de: 'Hesekiel', es: 'Ezequiel', fr: 'Ézéchiel' }, chapters: 48, testament: 'OT' },
  { id: 'DAN', name: 'Daniel', names: { en: 'Daniel', ro: 'Daniel', de: 'Daniel', es: 'Daniel', fr: 'Daniel' }, chapters: 12, testament: 'OT' },
  { id: 'HOS', name: 'Hosea', names: { en: 'Hosea', ro: 'Osea', de: 'Hosea', es: 'Oseas', fr: 'Osée' }, chapters: 14, testament: 'OT' },
  { id: 'JOL', name: 'Joel', names: { en: 'Joel', ro: 'Ioel', de: 'Joel', es: 'Joel', fr: 'Joël' }, chapters: 3, testament: 'OT' },
  { id: 'AMO', name: 'Amos', names: { en: 'Amos', ro: 'Amos', de: 'Amos', es: 'Amós', fr: 'Amos' }, chapters: 9, testament: 'OT' },
  { id: 'OBA', name: 'Obadiah', names: { en: 'Obadiah', ro: 'Obadia', de: 'Obadja', es: 'Abdías', fr: 'Abdias' }, chapters: 1, testament: 'OT' },
  { id: 'JON', name: 'Jonah', names: { en: 'Jonah', ro: 'Iona', de: 'Jona', es: 'Jonás', fr: 'Jonas' }, chapters: 4, testament: 'OT' },
  { id: 'MIC', name: 'Micah', names: { en: 'Micah', ro: 'Mica', de: 'Micha', es: 'Miqueas', fr: 'Michée' }, chapters: 7, testament: 'OT' },
  { id: 'NAM', name: 'Nahum', names: { en: 'Nahum', ro: 'Naum', de: 'Nahum', es: 'Nahúm', fr: 'Nahum' }, chapters: 3, testament: 'OT' },
  { id: 'HAB', name: 'Habakkuk', names: { en: 'Habakkuk', ro: 'Habacuc', de: 'Habakuk', es: 'Habacuc', fr: 'Habacuc' }, chapters: 3, testament: 'OT' },
  { id: 'ZEP', name: 'Zephaniah', names: { en: 'Zephaniah', ro: 'Țefania', de: 'Zefanja', es: 'Sofonías', fr: 'Sophonie' }, chapters: 3, testament: 'OT' },
  { id: 'HAG', name: 'Haggai', names: { en: 'Haggai', ro: 'Hagai', de: 'Haggai', es: 'Hageo', fr: 'Aggée' }, chapters: 2, testament: 'OT' },
  { id: 'ZEC', name: 'Zechariah', names: { en: 'Zechariah', ro: 'Zaharia', de: 'Sacharja', es: 'Zacarías', fr: 'Zacharie' }, chapters: 14, testament: 'OT' },
  { id: 'MAL', name: 'Malachi', names: { en: 'Malachi', ro: 'Maleahi', de: 'Maleachi', es: 'Malaquías', fr: 'Malachie' }, chapters: 4, testament: 'OT' },
  { id: 'MAT', name: 'Matthew', names: { en: 'Matthew', ro: 'Matei', de: 'Matthäus', es: 'Mateo', fr: 'Matthieu' }, chapters: 28, testament: 'NT' },
  { id: 'MRK', name: 'Mark', names: { en: 'Mark', ro: 'Marcu', de: 'Markus', es: 'Marcos', fr: 'Marc' }, chapters: 16, testament: 'NT' },
  { id: 'LUK', name: 'Luke', names: { en: 'Luke', ro: 'Luca', de: 'Lukas', es: 'Lucas', fr: 'Luc' }, chapters: 24, testament: 'NT' },
  { id: 'JHN', name: 'John', names: { en: 'John', ro: 'Ioan', de: 'Johannes', es: 'Juan', fr: 'Jean' }, chapters: 21, testament: 'NT' },
  { id: 'ACT', name: 'Acts', names: { en: 'Acts', ro: 'Faptele Apostolilor', de: 'Apostelgeschichte', es: 'Hechos', fr: 'Actes' }, chapters: 28, testament: 'NT' },
  { id: 'ROM', name: 'Romans', names: { en: 'Romans', ro: 'Romani', de: 'Römer', es: 'Romanos', fr: 'Romains' }, chapters: 16, testament: 'NT' },
  { id: '1CO', name: '1 Corinthians', names: { en: '1 Corinthians', ro: '1 Corinteni', de: '1. Korinther', es: '1 Corintios', fr: '1 Corinthiens' }, chapters: 16, testament: 'NT' },
  { id: '2CO', name: '2 Corinthians', names: { en: '2 Corinthians', ro: '2 Corinteni', de: '2. Korinther', es: '2 Corintios', fr: '2 Corinthiens' }, chapters: 13, testament: 'NT' },
  { id: 'GAL', name: 'Galatians', names: { en: 'Galatians', ro: 'Galateni', de: 'Galater', es: 'Gálatas', fr: 'Galates' }, chapters: 6, testament: 'NT' },
  { id: 'EPH', name: 'Ephesians', names: { en: 'Ephesians', ro: 'Efeseni', de: 'Epheser', es: 'Efesios', fr: 'Éphésiens' }, chapters: 6, testament: 'NT' },
  { id: 'PHP', name: 'Philippians', names: { en: 'Philippians', ro: 'Filipeni', de: 'Philipper', es: 'Filipenses', fr: 'Philippiens' }, chapters: 4, testament: 'NT' },
  { id: 'COL', name: 'Colossians', names: { en: 'Colossians', ro: 'Coloseni', de: 'Kolosser', es: 'Colosenses', fr: 'Colossiens' }, chapters: 4, testament: 'NT' },
  { id: '1TH', name: '1 Thessalonians', names: { en: '1 Thessalonians', ro: '1 Tesaloniceni', de: '1. Thessalonicher', es: '1 Tesalonicenses', fr: '1 Thessaloniciens' }, chapters: 5, testament: 'NT' },
  { id: '2TH', name: '2 Thessalonians', names: { en: '2 Thessalonians', ro: '2 Tesaloniceni', de: '2. Thessalonicher', es: '2 Tesalonicenses', fr: '2 Thessaloniciens' }, chapters: 3, testament: 'NT' },
  { id: '1TI', name: '1 Timothy', names: { en: '1 Timothy', ro: '1 Timotei', de: '1. Timotheus', es: '1 Timoteo', fr: '1 Timothée' }, chapters: 6, testament: 'NT' },
  { id: '2TI', name: '2 Timothy', names: { en: '2 Timothy', ro: '2 Timotei', de: '2. Timotheus', es: '2 Timoteo', fr: '2 Timothée' }, chapters: 4, testament: 'NT' },
  { id: 'TIT', name: 'Titus', names: { en: 'Titus', ro: 'Tit', de: 'Titus', es: 'Tito', fr: 'Tite' }, chapters: 3, testament: 'NT' },
  { id: 'PHM', name: 'Philemon', names: { en: 'Philemon', ro: 'Filimon', de: 'Philemon', es: 'Filemón', fr: 'Philémon' }, chapters: 1, testament: 'NT' },
  { id: 'HEB', name: 'Hebrews', names: { en: 'Hebrews', ro: 'Evrei', de: 'Hebräer', es: 'Hebreos', fr: 'Hébreux' }, chapters: 13, testament: 'NT' },
  { id: 'JAS', name: 'James', names: { en: 'James', ro: 'Iacov', de: 'Jakobus', es: 'Santiago', fr: 'Jacques' }, chapters: 5, testament: 'NT' },
  { id: '1PE', name: '1 Peter', names: { en: '1 Peter', ro: '1 Petru', de: '1. Petrus', es: '1 Pedro', fr: '1 Pierre' }, chapters: 5, testament: 'NT' },
  { id: '2PE', name: '2 Peter', names: { en: '2 Peter', ro: '2 Petru', de: '2. Petrus', es: '2 Pedro', fr: '2 Pierre' }, chapters: 3, testament: 'NT' },
  { id: '1JN', name: '1 John', names: { en: '1 John', ro: '1 Ioan', de: '1. Johannes', es: '1 Juan', fr: '1 Jean' }, chapters: 5, testament: 'NT' },
  { id: '2JN', name: '2 John', names: { en: '2 John', ro: '2 Ioan', de: '2. Johannes', es: '2 Juan', fr: '2 Jean' }, chapters: 1, testament: 'NT' },
  { id: '3JN', name: '3 John', names: { en: '3 John', ro: '3 Ioan', de: '3. Johannes', es: '3 Juan', fr: '3 Jean' }, chapters: 1, testament: 'NT' },
  { id: 'JUD', name: 'Jude', names: { en: 'Jude', ro: 'Iuda', de: 'Judas', es: 'Judas', fr: 'Jude' }, chapters: 1, testament: 'NT' },
  { id: 'REV', name: 'Revelation', names: { en: 'Revelation', ro: 'Apocalipsa', de: 'Offenbarung', es: 'Apocalipsis', fr: 'Apocalypse' }, chapters: 22, testament: 'NT' },
];

let cornilescuCache: any = null;

async function fetchWithMultiProxy(url: string): Promise<Response> {
    try {
        const response = await fetch(url);
        if (response.ok) return response;
    } catch (e) { }

    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) return response;
    } catch (e) { }

    throw new Error(`Failed to fetch ${url}`);
}

async function getCornilescuData() {
    if (cornilescuCache) return cornilescuCache;
    const url = "https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ro_cornilescu.json";
    try {
        const response = await fetchWithMultiProxy(url);
        const data = await response.json();
        cornilescuCache = data;
        return data;
    } catch (e) {
        return null;
    }
}

const superNormalize = (str: string) => {
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]/g, ''); 
};

export const fetchChapter = async (
    bookName: string, 
    chapter: number, 
    language: string
): Promise<BibleChapter | null> => {
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === bookName || b.names.en === bookName || b.names.de === bookName || b.names.ro === bookName || b.names.es === bookName || b.names.fr === bookName);
    if (bookIndex === -1) return null;
    
    const bookData = BIBLE_BOOKS[bookIndex];
    let mappedVerses: { verse: number, text: string }[] = [];
    let translationId = 'NIV';

    try {
        const norm = language.toLowerCase();
        if (norm.includes('roman') || norm === 'ro') {
            translationId = 'Cornilescu'; 
            const fullBible = await getCornilescuData();
            if (fullBible && Array.isArray(fullBible)) {
                let bookObj = fullBible.length === 66 ? fullBible[bookIndex] : null;
                if (!bookObj) {
                    const targets = [superNormalize(bookData.names.ro), superNormalize(bookData.names.en), superNormalize(bookData.name)];
                    bookObj = fullBible.find((b: any) => targets.includes(superNormalize(b.name)));
                }
                if (bookObj && bookObj.chapters) {
                    const chapterData = bookObj.chapters[chapter - 1];
                    if (Array.isArray(chapterData)) {
                        mappedVerses = chapterData.map((text: string, idx: number) => ({ verse: idx + 1, text }));
                    }
                }
            }
        } else if (norm.includes('german') || norm === 'de') {
            translationId = 'LUT';
            mappedVerses = await fetchFromBolls('LUT', bookIndex + 1, chapter);
        } else if (norm.includes('span') || norm === 'es') {
            translationId = 'RVR09';
            mappedVerses = await fetchFromBolls('RVR09', bookIndex + 1, chapter);
        } else if (norm.includes('fren') || norm === 'fr') {
            translationId = 'LSG';
            mappedVerses = await fetchFromBolls('LSG', bookIndex + 1, chapter);
        } else {
            translationId = 'NIV';
            mappedVerses = await fetchFromBolls('NIV', bookIndex + 1, chapter);
        }
    } catch (e) {
        console.warn("External Bible fetch failed, falling back to AI.");
    }

    if (mappedVerses.length === 0) { 
        try {
            mappedVerses = await getBibleChapterFromAI(bookData.names.en, chapter, translationId, language);
        } catch (aiError) { console.error("AI Bible fetch failed", aiError); }
    }

    if (mappedVerses.length > 0) {
        let displayBookName = bookData.names.en;
        const norm = language.toLowerCase();
        if (norm.includes('german') || norm === 'de') displayBookName = bookData.names.de;
        else if (norm.includes('roman') || norm === 'ro') displayBookName = bookData.names.ro;
        else if (norm.includes('span') || norm === 'es') displayBookName = bookData.names.es;
        else if (norm.includes('fren') || norm === 'fr') displayBookName = bookData.names.fr;

        return {
            reference: `${displayBookName} ${chapter}`,
            translation_id: translationId,
            verses: mappedVerses.map((v) => ({
                book_id: bookData.id,
                book_name: displayBookName,
                chapter: chapter,
                verse: v.verse,
                text: v.text
            }))
        };
    }
    return null;
}

async function fetchFromBolls(translationId: string, bookId: number, chapter: number): Promise<any[]> {
    try {
        const url = `https://bolls.life/get-chapter/${translationId}/${bookId}/${chapter}/`;
        const response = await fetchWithMultiProxy(url);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return data.map((v: any) => ({
                verse: v.verse,
                text: v.text.replace(/<[^>]*>/g, '').replace(/^\d+\s*/, '').trim()
            }));
        }
    } catch (e) { }
    return [];
}