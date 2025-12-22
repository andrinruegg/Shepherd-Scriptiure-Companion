import { BibleBook, BibleChapter } from '../types.ts';
import { getBibleChapterFromAI } from './geminiService.ts';

export const BIBLE_BOOKS: (BibleBook & { names: { en: string, ro: string, de: string } })[] = [
  { id: 'GEN', name: 'Genesis', names: { en: 'Genesis', ro: 'Geneza', de: '1. Mose' }, chapters: 50, testament: 'OT' },
  { id: 'EXO', name: 'Exodus', names: { en: 'Exodus', ro: 'Exodul', de: '2. Mose' }, chapters: 40, testament: 'OT' },
  { id: 'LEV', name: 'Leviticus', names: { en: 'Leviticus', ro: 'Leviticul', de: '3. Mose' }, chapters: 27, testament: 'OT' },
  { id: 'NUM', name: 'Numbers', names: { en: 'Numbers', ro: 'Numeri', de: '4. Mose' }, chapters: 36, testament: 'OT' },
  { id: 'DEU', name: 'Deuteronomy', names: { en: 'Deuteronomy', ro: 'Deuteronomul', de: '5. Mose' }, chapters: 34, testament: 'OT' },
  { id: 'JOS', name: 'Joshua', names: { en: 'Joshua', ro: 'Iosua', de: 'Josua' }, chapters: 24, testament: 'OT' },
  { id: 'JDG', name: 'Judges', names: { en: 'Judges', ro: 'Judecătorii', de: 'Richter' }, chapters: 21, testament: 'OT' },
  { id: 'RUT', name: 'Ruth', names: { en: 'Ruth', ro: 'Rut', de: 'Rut' }, chapters: 4, testament: 'OT' },
  { id: '1SA', name: '1 Samuel', names: { en: '1 Samuel', ro: '1 Samuel', de: '1. Samuel' }, chapters: 31, testament: 'OT' },
  { id: '2SA', name: '2 Samuel', names: { en: '2 Samuel', ro: '2 Samuel', de: '2. Samuel' }, chapters: 24, testament: 'OT' },
  { id: '1KI', name: '1 Kings', names: { en: '1 Kings', ro: '1 Împărați', de: '1. Könige' }, chapters: 22, testament: 'OT' },
  { id: '2KI', name: '2 Kings', names: { en: '2 Kings', ro: '2 Împărați', de: '2. Könige' }, chapters: 25, testament: 'OT' },
  { id: '1CH', name: '1 Chronicles', names: { en: '1 Chronicles', ro: '1 Cronici', de: '1. Chronik' }, chapters: 29, testament: 'OT' },
  { id: '2CH', name: '2 Chronicles', names: { en: '2 Chronicles', ro: '2 Cronici', de: '2. Chronik' }, chapters: 36, testament: 'OT' },
  { id: 'EZR', name: 'Ezra', names: { en: 'Ezra', ro: 'Ezra', de: 'Esra' }, chapters: 10, testament: 'OT' },
  { id: 'NEH', name: 'Nehemiah', names: { en: 'Nehemiah', ro: 'Neemia', de: 'Nehemia' }, chapters: 13, testament: 'OT' },
  { id: 'EST', name: 'Esther', names: { en: 'Esther', ro: 'Estera', de: 'Ester' }, chapters: 10, testament: 'OT' },
  { id: 'JOB', name: 'Job', names: { en: 'Job', ro: 'Iov', de: 'Hiob' }, chapters: 42, testament: 'OT' },
  { id: 'PSA', name: 'Psalms', names: { en: 'Psalms', ro: 'Psalmii', de: 'Psalmen' }, chapters: 150, testament: 'OT' },
  { id: 'PRO', name: 'Proverbs', names: { en: 'Proverbs', ro: 'Proverbele', de: 'Sprüche' }, chapters: 31, testament: 'OT' },
  { id: 'ECC', name: 'Ecclesiastes', names: { en: 'Ecclesiastes', ro: 'Eclesiastul', de: 'Prediger' }, chapters: 12, testament: 'OT' },
  { id: 'SNG', name: 'Song of Solomon', names: { en: 'Song of Songs', ro: 'Cântarea Cântărilor', de: 'Hohelied' }, chapters: 8, testament: 'OT' },
  { id: 'ISA', name: 'Isaiah', names: { en: 'Isaiah', ro: 'Isaia', de: 'Jesaja' }, chapters: 66, testament: 'OT' },
  { id: 'JER', name: 'Jeremiah', names: { en: 'Jeremiah', ro: 'Ieremia', de: 'Jeremia' }, chapters: 52, testament: 'OT' },
  { id: 'LAM', name: 'Lamentations', names: { en: 'Lamentations', ro: 'Plângerile', de: 'Klagelieder' }, chapters: 5, testament: 'OT' },
  { id: 'EZK', name: 'Ezekiel', names: { en: 'Ezekiel', ro: 'Ezechiel', de: 'Hesekiel' }, chapters: 48, testament: 'OT' },
  { id: 'DAN', name: 'Daniel', names: { en: 'Daniel', ro: 'Daniel', de: 'Daniel' }, chapters: 12, testament: 'OT' },
  { id: 'HOS', name: 'Hosea', names: { en: 'Hosea', ro: 'Osea', de: 'Hosea' }, chapters: 14, testament: 'OT' },
  { id: 'JOL', name: 'Joel', names: { en: 'Joel', ro: 'Ioel', de: 'Joel' }, chapters: 3, testament: 'OT' },
  { id: 'AMO', name: 'Amos', names: { en: 'Amos', ro: 'Amos', de: 'Amos' }, chapters: 9, testament: 'OT' },
  { id: 'OBA', name: 'Obadiah', names: { en: 'Obadiah', ro: 'Obadia', de: 'Obadja' }, chapters: 1, testament: 'OT' },
  { id: 'JON', name: 'Jonah', names: { en: 'Jonah', ro: 'Iona', de: 'Jona' }, chapters: 4, testament: 'OT' },
  { id: 'MIC', name: 'Micah', names: { en: 'Micah', ro: 'Mica', de: 'Micha' }, chapters: 7, testament: 'OT' },
  { id: 'NAM', name: 'Nahum', names: { en: 'Nahum', ro: 'Naum', de: 'Nahum' }, chapters: 3, testament: 'OT' },
  { id: 'HAB', name: 'Habakkuk', names: { en: 'Habakkuk', ro: 'Habacuc', de: 'Habakuk' }, chapters: 3, testament: 'OT' },
  { id: 'ZEP', name: 'Zephaniah', names: { en: 'Zephaniah', ro: 'Țefania', de: 'Zefanja' }, chapters: 3, testament: 'OT' },
  { id: 'HAG', name: 'Haggai', names: { en: 'Haggai', ro: 'Hagai', de: 'Haggai' }, chapters: 2, testament: 'OT' },
  { id: 'ZEC', name: 'Zechariah', names: { en: 'Zechariah', ro: 'Zaharia', de: 'Sacharja' }, chapters: 14, testament: 'OT' },
  { id: 'MAL', name: 'Malachi', names: { en: 'Malachi', ro: 'Maleahi', de: 'Maleachi' }, chapters: 4, testament: 'OT' },
  { id: 'MAT', name: 'Matthew', names: { en: 'Matthew', ro: 'Matei', de: 'Matthäus' }, chapters: 28, testament: 'NT' },
  { id: 'MRK', name: 'Mark', names: { en: 'Mark', ro: 'Marcu', de: 'Markus' }, chapters: 16, testament: 'NT' },
  { id: 'LUK', name: 'Luke', names: { en: 'Luke', ro: 'Luca', de: 'Lukas' }, chapters: 24, testament: 'NT' },
  { id: 'JHN', name: 'John', names: { en: 'John', ro: 'Ioan', de: 'Johannes' }, chapters: 21, testament: 'NT' },
  { id: 'ACT', name: 'Acts', names: { en: 'Acts', ro: 'Faptele Apostolilor', de: 'Apostelgeschichte' }, chapters: 28, testament: 'NT' },
  { id: 'ROM', name: 'Romans', names: { en: 'Romans', ro: 'Romani', de: 'Römer' }, chapters: 16, testament: 'NT' },
  { id: '1CO', name: '1 Corinthians', names: { en: '1 Corinthians', ro: '1 Corinteni', de: '1. Korinther' }, chapters: 16, testament: 'NT' },
  { id: '2CO', name: '2 Corinthians', names: { en: '2 Corinthians', ro: '2 Corinteni', de: '2. Korinther' }, chapters: 13, testament: 'NT' },
  { id: 'GAL', name: 'Galatians', names: { en: 'Galatians', ro: 'Galateni', de: 'Galater' }, chapters: 6, testament: 'NT' },
  { id: 'EPH', name: 'Ephesians', names: { en: 'Ephesians', ro: 'Efeseni', de: 'Epheser' }, chapters: 6, testament: 'NT' },
  { id: 'PHP', name: 'Philippians', names: { en: 'Philippians', ro: 'Filipeni', de: 'Philipper' }, chapters: 4, testament: 'NT' },
  { id: 'COL', name: 'Colossians', names: { en: 'Colossians', ro: 'Coloseni', de: 'Kolosser' }, chapters: 4, testament: 'NT' },
  { id: '1TH', name: '1 Thessalonians', names: { en: '1 Thessalonians', ro: '1 Tesaloniceni', de: '1. Thessalonicher' }, chapters: 5, testament: 'NT' },
  { id: '2TH', name: '2 Thessalonians', names: { en: '2 Thessalonians', ro: '2 Tesaloniceni', de: '2. Thessalonicher' }, chapters: 3, testament: 'NT' },
  { id: '1TI', name: '1 Timothy', names: { en: '1 Timothy', ro: '1 Timotei', de: '1. Timotheus' }, chapters: 6, testament: 'NT' },
  { id: '2TI', name: '2 Timothy', names: { en: '2 Timothy', ro: '2 Timotei', de: '2. Timotheus' }, chapters: 4, testament: 'NT' },
  { id: 'TIT', name: 'Titus', names: { en: 'Titus', ro: 'Tit', de: 'Titus' }, chapters: 3, testament: 'NT' },
  { id: 'PHM', name: 'Philemon', names: { en: 'Philemon', ro: 'Filimon', de: 'Philemon' }, chapters: 1, testament: 'NT' },
  { id: 'HEB', name: 'Hebrews', names: { en: 'Hebrews', ro: 'Evrei', de: 'Hebräer' }, chapters: 13, testament: 'NT' },
  { id: 'JAS', name: 'James', names: { en: 'James', ro: 'Iacov', de: 'Jakobus' }, chapters: 5, testament: 'NT' },
  { id: '1PE', name: '1 Peter', names: { en: '1 Peter', ro: '1 Petru', de: '1. Petrus' }, chapters: 5, testament: 'NT' },
  { id: '2PE', name: '2 Peter', names: { en: '2 Peter', ro: '2 Petru', de: '2. Petrus' }, chapters: 3, testament: 'NT' },
  { id: '1JN', name: '1 John', names: { en: '1 John', ro: '1 Ioan', de: '1. Johannes' }, chapters: 5, testament: 'NT' },
  { id: '2JN', name: '2 John', names: { en: '2 John', ro: '2 Ioan', de: '2. Johannes' }, chapters: 1, testament: 'NT' },
  { id: '3JN', name: '3 John', names: { en: '3 John', ro: '3 Ioan', de: '3. Johannes' }, chapters: 1, testament: 'NT' },
  { id: 'JUD', name: 'Jude', names: { en: 'Jude', ro: 'Iuda', de: 'Judas' }, chapters: 1, testament: 'NT' },
  { id: 'REV', name: 'Revelation', names: { en: 'Revelation', ro: 'Apocalipsa', de: 'Offenbarung' }, chapters: 22, testament: 'NT' },
];

let cornilescuCache: any = null;

async function fetchWithMultiProxy(url: string): Promise<Response> {
    try { const r = await fetch(url); if (r.ok) return r; } catch (e) { }
    try { const pr = `https://corsproxy.io/?${encodeURIComponent(url)}`; const r = await fetch(pr); if (r.ok) return r; } catch (e) { }
    throw new Error(`Failed: ${url}`);
}

async function getCornilescuData() {
    if (cornilescuCache) return cornilescuCache;
    const url = "https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/ro_cornilescu.json";
    try { const r = await fetchWithMultiProxy(url); cornilescuCache = await r.json(); return cornilescuCache; }
    catch (e) { const raw = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ro_cornilescu.json"; const r = await fetchWithMultiProxy(raw); cornilescuCache = await r.json(); return cornilescuCache; }
}

export const fetchChapter = async (bookName: string, chapter: number, language: string): Promise<BibleChapter | null> => {
    const bIndex = BIBLE_BOOKS.findIndex(b => b.name === bookName || b.names.en === bookName || b.names.de === bookName || b.names.ro === bookName);
    if (bIndex === -1) return null;
    const bData = BIBLE_BOOKS[bIndex];
    let vList: any[] = [];
    let trans = 'NIV';
    if (language === 'Romanian') {
        trans = 'Cornilescu';
        try {
            const bible = await getCornilescuData();
            if (Array.isArray(bible) && bible.length === 66) {
                const book = bible[bIndex];
                if (book && book.chapters && book.chapters[chapter-1]) vList = book.chapters[chapter-1].map((t: string, i: number) => ({ verse: i+1, text: t }));
            }
        } catch (e) { }
    } else if (language === 'German') {
        trans = 'LUT';
        try { const r = await fetchWithMultiProxy(`https://cdn.jsdelivr.net/gh/seven1m/bible@master/files/de-schlachter/${encodeURIComponent(bData.names.en)}/${chapter}.json`); const d = await r.json(); Object.keys(d).forEach(k => vList.push({ verse: parseInt(k), text: d[k] })); vList.sort((a,b) => a.verse - b.verse); } catch(e) {}
    } else {
        try { const r = await fetchWithMultiProxy(`https://bolls.life/get-chapter/NIV/${bIndex+1}/${chapter}/`); const d = await r.json(); vList = d.map((v: any) => ({ verse: v.verse, text: v.text.replace(/<[^>]*>/g, '').trim() })); } catch (e) {}
    }
    if (vList.length === 0 && language !== 'Romanian') { try { vList = await getBibleChapterFromAI(bData.names.en, chapter, trans, language); } catch (e) {} }
    if (vList.length > 0) return { reference: `${language === 'German' ? bData.names.de : language === 'Romanian' ? bData.names.ro : bData.names.en} ${chapter}`, translation_id: trans, verses: vList.map(v => ({ book_id: bData.id, book_name: bData.name, chapter, verse: v.verse, text: v.text })) };
    return null;
}