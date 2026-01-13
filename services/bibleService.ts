
import { BibleBook, BibleChapter } from '../types';
import { getBibleChapterFromAI } from './geminiService';

export const BIBLE_BOOKS: (BibleBook & { names: { en: string, ro: string, de: string } })[] = [
  { id: 'GEN', name: 'Genesis', names: { en: 'Genesis', ro: 'Geneza', de: '1. Mose' }, chapters: 50, testament: 'OT' },
  { id: 'EXO', name: 'Exodus', names: { en: 'Exodus', ro: 'Exodul', de: '2. Mose' }, chapters: 40, testament: 'OT' },
  { id: 'LEV', name: 'Leviticus', names: { en: 'Leviticus', ro: 'Leviticul', de: '3. Mose' }, chapters: 27, testament: 'OT' },
  { id: 'NUM', name: 'Numbers', names: { en: 'Numbers', ro: 'Numeri', de: '4. Mose' }, chapters: 36, testament: 'OT' },
  { id: 'DEU', name: 'Deuteronomy', names: { en: 'Deuteronomy', ro: 'Deuteronomul', de: '5. Mose' }, chapters: 34, testament: 'OT' },
  { id: 'PSA', name: 'Psalms', names: { en: 'Psalms', ro: 'Psalmii', de: 'Psalmen' }, chapters: 150, testament: 'OT' },
  { id: 'PRO', name: 'Proverbs', names: { en: 'Proverbs', ro: 'Proverbele', de: 'Sprüche' }, chapters: 31, testament: 'OT' },
  { id: 'MAT', name: 'Matthew', names: { en: 'Matthew', ro: 'Matei', de: 'Matthäus' }, chapters: 28, testament: 'NT' },
  { id: 'MRK', name: 'Mark', names: { en: 'Mark', ro: 'Marcu', de: 'Markus' }, chapters: 16, testament: 'NT' },
  { id: 'LUK', name: 'Luke', names: { en: 'Luke', ro: 'Luca', de: 'Lukas' }, chapters: 24, testament: 'NT' },
  { id: 'JHN', name: 'John', names: { en: 'John', ro: 'Ioan', de: 'Johannes' }, chapters: 21, testament: 'NT' },
  { id: 'ACT', name: 'Acts', names: { en: 'Acts', ro: 'Faptele Apostolilor', de: 'Apostelgeschichte' }, chapters: 28, testament: 'NT' },
  { id: 'ROM', name: 'Romans', names: { en: 'Romans', ro: 'Romani', de: 'Römer' }, chapters: 16, testament: 'NT' },
  { id: 'REV', name: 'Revelation', names: { en: 'Revelation', ro: 'Apocalipsa', de: 'Offenbarung' }, chapters: 22, testament: 'NT' },
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
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === bookName || b.names.en === bookName || b.names.de === bookName || b.names.ro === bookName);
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
