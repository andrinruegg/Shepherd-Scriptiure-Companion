
import { BibleStory } from '../types';

type StoriesData = Record<string, BibleStory[]>;

export const STORIES_DATA: StoriesData = {
  English: [
    {
        id: 'peter',
        name: 'Simon Peter',
        role: 'Fisherman of Galilee',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impetuous', 'Humble', 'Eye-witness', 'Restored'],
        biography: [
            "I remember the smell of salt and the rough texture of the nets. I was a simple man, a fisherman by trade and by heart, until the day the Master walked along the shores of Galilee.",
            "I was a man of action, often speaking before I thought. I was the one who dared to walk upon the crashing waves toward Him.",
            "My darkest hour came in a courtyard. Three times I was asked if I knew Him, and three times I denied my King.",
            "By the same sea where He first called me, the resurrected Lord found me again. Three times He asked if I loved Him, mirroring my three denials, and three times He commanded me to 'Feed My sheep.'"
        ]
    },
    {
        id: 'paul',
        name: 'Paul the Apostle',
        role: 'Apostle to the Gentiles',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Zealous', 'Learned', 'Persistent', 'Redeemed'],
        biography: [
            "I was once Saul of Tarsus, a man filled with zeal for the traditions of my fathers, breathing threats against those who followed 'The Way'.",
            "But on the road to Damascus, a light from heaven, brighter than the midday sun, flashed around me. I heard a voice that changed everything: 'Saul, Saul, why do you persecute me?'",
            "The scales fell from my eyes, and I realized that what I once thought was gain, I now count as loss for the sake of Christ.",
            "From the prisons of Rome to the marketplaces of Athens, I have lived to preach one message: Christ crucified and risen. For to me, to live is Christ and to die is gain."
        ]
    },
    {
        id: 'mary',
        name: 'Mary',
        role: 'Mother of Jesus',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/mary-immaculate-heart-283x400.jpg',
        traits: ['Devout', 'Brave', 'Humble', 'Chosen'],
        biography: [
            "I was but a young woman in Nazareth when the angel Gabriel appeared. 'Do not be afraid,' he said, but my heart was racing. I was chosen to carry the Son of the Most High.",
            "I remember the cold night in Bethlehem, the smell of hay, and the first cry of my child who would change the world forever.",
            "I stood at the foot of the cross, my soul pierced as a sword passed through my heart, watching the world's light seemingly go out.",
            "But my soul magnifies the Lord, for He who is mighty has done great things for me. His mercy is from generation to generation."
        ]
    }
  ],
  German: [
    {
        id: 'peter',
        name: 'Petrus (Simon Petrus)',
        role: 'Fischer aus Galiläa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Ungestüm', 'Demütig', 'Augenzeuge', 'Wiederhergestellt'],
        biography: [
            "Ich erinnere mich an den Geruch von Salz und die raue Textur der Netze. Ich war ein einfacher Mann, ein Fischer von Beruf, bis der Meister am Ufer von Galiläa entlangging.",
            "Ich war ein Mann der Tat, der oft sprach, bevor er dachte. Ich war derjenige, der versuchte, auf dem Wasser zu gehen.",
            "Meine dunkelste Stunde war in einem Hof. Dreimal verleugnete ich meinen König aus einer Feigheit, die ich nicht kannte.",
            "Doch der auferstandene Herr fand mich wieder am Meer und fragte dreimal: 'Liebst du mich?'"
        ]
    },
    {
        id: 'paul',
        name: 'Paulus von Tarsus',
        role: 'Apostel der Heiden',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Eifrig', 'Gelehrt', 'Beharrlich', 'Erlöst'],
        biography: [
            "Ich war einst Saulus von Tarsus, ein Mann voller Eifer für die Überlieferungen meiner Väter, der Drohungen gegen die Jünger des Herrn ausstieß.",
            "Doch auf dem Weg nach Damaskus umstrahlte mich plötzlich ein Licht vom Himmel, heller als die Mittagssonne. Eine Stimme fragte mich: 'Saulus, Saulus, warum verfolgst du mich?'",
            "Die Schuppen fielen mir von den Augen. Was mir einst Gewinn war, das habe ich um Christi willen für Schaden erachtet.",
            "Vom Gefängnis in Rom bis zum Marktplatz in Athen habe ich gelebt, um nur eine Botschaft zu verkünden: Christus, der Gekreuzigte und Auferstandene. Denn Christus ist mein Leben, und Sterben ist mein Gewinn."
        ]
    },
    {
        id: 'mary',
        name: 'Maria',
        role: 'Mutter von Jesus',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/mary-immaculate-heart-283x400.jpg',
        traits: ['Fromm', 'Mutig', 'Demütig', 'Erwählt'],
        biography: [
            "Ich war nur eine junge Frau in Nazareth, als der Engel Gabriel erschien. 'Fürchte dich nicht', sagte er, doch mein Herz klopfte schnell. Ich war erwählt, den Sohn des Höchsten zu tragen.",
            "Ich erinnere mich an die kalte Nacht in Bethlehem, den Geruch von Heu und den ersten Schrei meines Kindes, das die Welt für immer verändern würde.",
            "Ich stand am Fuß des Kreuzes, meine Seele wurde durchbohrt, als ich zusah, wie das Licht der Welt scheinbar erlosch.",
            "Doch meine Seele erhebt den Herrn, denn er, der mächtig ist, hat Großes an mir getan. Seine Barmherzigkeit währt von Geschlecht zu Geschlecht."
        ]
    }
  ],
  Romanian: [
    {
        id: 'peter',
        name: 'Petru (Simon Petru)',
        role: 'Pescar din Galileea',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impulsiv', 'Smerit', 'Martor ocular', 'Restaurat'],
        biography: [
            "Îmi amintesc mirosul sării și textura aspră a mrejelor. Eram un om simplu, pescar de meserie, până în ziua în care Învățătorul a mers pe țărmul Galileii.",
            "Am fost un om al acțiunii, vorbind adesea înainte de a gândi. Eu am fost cel care a îndrăznit să meargă pe ape.",
            "Cea mai neagră oră a fost în curtea arhiereului. De trei ori m-au întrebat dacă Îl cunosc și de trei ori L-am lepădat pe Împăratul meu.",
            "Dar Domnul cel înviat m-a găsit iarăși la malul mării și m-a întrebat de trei ori: 'Mă iubești?'"
        ]
    },
    {
        id: 'paul',
        name: 'Apostolul Pavel',
        role: 'Apostolul Neamurilor',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Râvnitor', 'Învățat', 'Perseverent', 'Răscumpărat'],
        biography: [
            "Eram odinioară Saul din Tars, un om plin de râvnă pentru datinile strămoșești, suflând amenințarea și măcelul împotriva ucenicilor Domnului.",
            "Dar pe drumul Damascului, deodată a strălucit o lumină din cer împrejurul meu. Am auzit un glas care mi-a zis: 'Saule, Saule, pentru ce Mă prigonești?'",
            "Solzii au căzut de pe ochii mei și am înțeles că lucrurile care pentru mine erau câștiguri, le-am socotit ca o pierdere, din pricina lui Hristos.",
            "Din închisorile Romei până în piețele Atenei, am trăit ca să vestesc un singur mesaj: pe Hristos cel răstignit și înviat. Căci pentru mine a trăi este Hristos, și a muri este un câștig."
        ]
    },
    {
        id: 'mary',
        name: 'Maria',
        role: 'Mama lui Isus',
        image: 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/mary-immaculate-heart-283x400.jpg',
        traits: ['Evlavioasă', 'Curajoasă', 'Smerită', 'Aleasă'],
        biography: [
            "Eram doar o tânără în Nazaret când mi s-a arătat îngerul Gavril. „Nu te teme”, mi-a spus el, dar inima îmi bătea cu putere. Am fost aleasă să-L port pe Fiul Celui Preaînalt.",
            "Îmi amintesc noaptea rece din Betleem, mirosul de fân și primul strigăt al copilului meu care avea să schimbe lumea pentru totdeauna.",
            "Am stat la picioarele crucii, sufletul fiindu-mi străpuns de o sabie, privind cum lumina lumii părea să se stingă.",
            "Dar sufletul meu Îl mărește pe Domnul, căci Cel ce este puternic a făcut lucruri mari pentru mine. Mila Lui se întinde din neam în neam."
        ]
    }
  ]
};