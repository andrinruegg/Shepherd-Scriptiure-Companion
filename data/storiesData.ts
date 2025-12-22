
import { BibleStory } from '../types';

type StoriesData = Record<string, BibleStory[]>;

export const STORIES_DATA: StoriesData = {
  English: [
    {
        id: 'peter',
        name: 'Petrus (Simon Peter)',
        role: 'Fisherman of Galilee',
        image: 'https://ucatholic.com/wp-content/uploads/2017/06/SaintPeter.png',
        traits: ['Impetuous', 'Humble', 'Eye-witness', 'Passionate'],
        biography: [
            "I remember the smell of salt and the rough texture of the nets. I was a simple man until the Master looked at me and said, 'Follow Me.'",
            "I walked on water for a moment, and I sank into the depths for a moment. I have known the highest joy and the bitterest cold of the night I failed Him.",
            "Ask me not of verses in a book yet to be written, but of the things I heard Him say as we walked the dusty roads of Judea."
        ]
    }
  ],
  Romanian: [
    {
        id: 'peter',
        name: 'Petru (Simon)',
        role: 'Pescar din Galileea',
        image: 'https://ucatholic.com/wp-content/uploads/2017/06/SaintPeter.png',
        traits: ['Impulsiv', 'Smerit', 'Martor ocular', 'Pasionat'],
        biography: [
            "Îmi amintesc mirosul de sare și textura aspră a mrejilor. Eram un om simplu până când Învățătorul m-a privit și a spus: 'Vino după Mine.'",
            "Am mers pe apă pentru o clipă și m-am scufundat în adâncuri pentru o clipă. Am cunoscut cea mai mare bucurie și cel mai amar frig al nopții în care L-am dezamăgit.",
            "Nu mă întreba de versete dintr-o carte care urmează să fie scrisă, ci de lucrurile pe care L-am auzit spunându-le în timp ce mergeam pe drumurile prăfuite ale Iudeii."
        ]
    }
  ],
  German: [
    {
        id: 'peter',
        name: 'Petrus (Simon)',
        role: 'Fischer aus Galiläa',
        image: 'https://ucatholic.com/wp-content/uploads/2017/06/SaintPeter.png',
        traits: ['Ungestüm', 'Demütig', 'Augenzeuge', 'Leidenschaftlich'],
        biography: [
            "Ich erinnere mich an den Geruch von Salz und die raue Struktur der Netze. Ich war ein einfacher Mann, bis der Meister mich ansah und sagte: 'Folge mir nach.'",
            "Ich ging für einen Moment auf dem Wasser und versank für einen Moment in der Tiefe. Ich habe die höchste Freude und die bitterste Kälte der Nacht gekannt, in der ich Ihn verleugnete.",
            "Frage mich nicht nach Versen in einem Buch, das erst noch geschrieben werden muss, sondern nach den Dingen, die ich Ihn sagen hörte, als wir über die staubigen Straßen Judäas wanderten."
        ]
    }
  ]
};
