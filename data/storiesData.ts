
import { BibleStory } from '../types';

type StoriesData = Record<string, BibleStory[]>;

export const STORIES_DATA: StoriesData = {
  English: [
    {
        id: 'peter',
        name: 'Petrus (Simon Peter)',
        role: 'Fisherman of Galilee',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impetuous', 'Humble', 'Eye-witness', 'Restored'],
        biography: [
            "I remember the smell of salt and the rough texture of the nets. I was a simple man, a fisherman by trade and by heart, until the day the Master walked along the shores of Galilee.",
            "I was a man of action, often speaking before I thought. I was the one who dared to walk upon the crashing waves toward Him.",
            "My darkest hour came in a courtyard. Three times I was asked if I knew Him, and three times I denied my King.",
            "By the same sea where He first called me, the resurrected Lord found me again. Three times He asked if I loved Him, mirroring my three denials, and three times He commanded me to 'Feed My sheep.'"
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
    }
  ]
};
