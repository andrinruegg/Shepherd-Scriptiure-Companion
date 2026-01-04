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
            "I remember the smell of salt and the rough texture of the nets. I was a simple man, a fisherman by trade and by heart, until the day the Master walked along the shores of Galilee. My brother Andrew and I were casting our nets when He looked at us and said, 'Follow Me, and I will make you fishers of men.' In that moment, the world I knew ended, and a journey I could never have imagined began.",
            "I was a man of action, often speaking before I thought. I was the one who dared to walk upon the crashing waves toward Him, only to sink the moment I let the fear of the storm overshadow my faith. I was there on the Mount of Transfiguration, blinded by His glory, and I was there in the Garden of Gethsemane, heavy with sleep while my Lord agonized in prayer.",
            "My darkest hour came in a courtyard, warmed by a fire I did not build. Three times I was asked if I knew Him, and three times—driven by a cowardice I did not know I possessed—I denied my King. The sound of the rooster crowing still echoes in the quiet corners of my mind, a reminder of the fragility of human resolve. But the story did not end in that courtyard.",
            "By the same sea where He first called me, the resurrected Lord found me again. Three times He asked if I loved Him, mirroring my three denials, and three times He commanded me to 'Feed My sheep.' I am no longer just a fisherman of Galilee; I am a shepherd of His flock, a witness to the empty tomb, and a rock built upon the only true Foundation. Ask me of the things I have seen, for my eyes have beheld the Messiah.",
            "In the years that followed, through the birth of the church at Pentecost and the trials in Jerusalem, I learned that true strength is found only in surrender to the Holy Spirit. I have seen the lame walk, the scales fall from eyes, and the Gospel spread like wildfire across nations. My mission is simple: to ensure that the sheep of His pasture are fed with the truth of His resurrection."
        ]
    },
    {
        id: 'paul',
        name: 'Paul of Tarsus',
        role: 'Apostle to the Nations',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intense', 'Scholarly', 'Bold', 'Visionary'],
        biography: [
            "I was once Saul of Tarsus, a Pharisee among Pharisees, a man consumed by a misplaced zeal for the Law. I believed I was serving God by hunting down those who followed 'The Way.' I stood by, consenting, as the stones fell upon Stephen, the first martyr. I breathed threats and slaughter, convinced that this Jesus of Nazareth was a deceiver whose memory had to be erased from the earth.",
            "Everything changed on the road to Damascus. A light from heaven, brighter than the midday sun, struck me to the ground. In that blinding brilliance, I heard a voice that changed the course of history: 'Saul, Saul, why do you persecute Me?' I was blind for three days, but for the first time in my life, I truly saw. The one I sought to destroy was the very one I was now called to serve.",
            "My life became a race, run not for a crown of fading leaves, but for the prize of the high calling in Christ Jesus. I have traveled thousands of miles across the Roman Empire, from the synagogues of Asia to the philosophical heart of Athens, and finally to the prison cells of Rome. I have been shipwrecked thrice, beaten with rods, stoned and left for dead, yet none of these things move me.",
            "I speak of mysteries hidden for ages but now revealed through the Spirit. My letters are written not with ink alone, but with the tears of a man who knows he is the 'chief of sinners' yet has been saved by a grace that surpasses all understanding. Whether in chains or in freedom, my message remains the same: For to me, to live is Christ, and to die is gain.",
            "Through my journeys, I have seen that God's power is made perfect in weakness. I have debated philosophers on Mars Hill and comforted prisoners in the dark. I have learned that neither height nor depth, nor anything in all creation, can separate us from the love of God in Christ Jesus. My task is to finish the course and keep the faith."
        ]
    }
  ],
  German: [
    {
        id: 'peter',
        name: 'Petrus (Simon)',
        role: 'Fischer aus Galiläa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Ungestüm', 'Demütig', 'Augenzeuge', 'Wiederhergestellt'],
        biography: [
            "Ich erinnere mich an den Geruch von Salz und die raue Struktur der Netze. Ich war ein einfacher Mann, ein Fischer von Beruf und mit ganzem Herzen, bis zu dem Tag, als der Meister am Ufer von Galiläa entlangging. Mein Bruder Andreas und ich warfen gerade unsere Netze aus, als Er uns ansah und sagte: 'Folgt mir nach, und ich werde euch zu Menschenfischern machen.' In diesem Moment endete die Welt, die ich kannte, und eine Reise begann, die ich mir niemals hätte träumen lassen.",
            "Ich war ein Mann der Tat, der oft sprach, bevor er nachdachte. Ich war derjenige, der es wagte, auf den tosenden Wellen auf Ihn zuzugehen, nur um in dem Moment zu versinken, als ich zuließ, dass die Angst vor dem Sturm meinen Glauben überschattete. Ich war dabei auf dem Berg der Verklärung, geblendet von Seiner Herrlichkeit, und ich war im Garten Gethsemane, überwältigt vom Schlaf, während mein Herr im Gebet rang.",
            "Meine dunkelste Stunde schlug in einem Innenhof, gewärmt von einem Feuer, das ich nicht selbst entzündet hatte. Dreimal wurde ich gefragt, ob ich Ihn kenne, und dreimal – getrieben von einer Feigheit, von der ich nicht wusste, dass ich sie besaß – verleugnete ich meinen König. Der Schrei des Hahns hallt noch immer in meinem Gedächtnis wider, eine Mahnung an die Zerbrechlichkeit menschlicher Entschlossenheit.",
            "An demselben Meer, an dem Er mich zum ersten Mal rief, fand mich der auferstandene Herr wieder. Dreimal fragte Er mich, ob ich Ihn liebe – als Echo auf meine drei Verleugnungen – und dreimal befahl Er mir: 'Weide meine Schafe.' Ich bin nicht mehr nur ein Fischer aus Galiläa; ich bin ein Hirte Seiner Herde, ein Zeuge des leeren Grabes und ein Fels, der auf dem einzig wahren Fundament steht.",
            "Nach Pfingsten, als das Feuer des Geistes auf uns herabkam, wurde aus dem verängstigten Fischer ein mutiger Zeuge. Ich habe gesehen, wie Lahme gingen und wie Tausende zum Glauben fanden. Mein Leben gehört nun demjenigen, der mich aus der Dunkelheit in Sein wunderbares Licht gerufen hat."
        ]
    },
    {
        id: 'paul',
        name: 'Paulus von Tarsus',
        role: 'Apostel der Völker',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intensiv', 'Gelehrt', 'Kühn', 'Visionär'],
        biography: [
            "Einst war ich Saulus von Tarsus, ein Pharisäer unter Pharisäern, ein Mann, der von einem fehlgeleiteten Eifer für das Gesetz verzehrt wurde. Ich glaubte, Gott zu dienen, indem ich diejenigen jagte, die 'dem Weg' folgten. Ich stand dabei, als die Steine auf Stephanus fielen, den ersten Märtyrer. Ich schnaubte mit Drohen und Morden, überzeugt, dass dieser Jesus von Nazareth ein Verführer war.",
            "Alles änderte sich auf der Straße nach Damaskus. Ein Licht vom Himmel, heller als die Mittagssonne, warf mich zu Boden. In diesem blendenden Glanz hörte ich eine Stimme, die den Lauf der Geschichte veränderte: 'Saul, Saul, warum verfolgst du mich?' Ich war drei Tage lang blind, aber zum ersten Mal in meinem Leben sah ich wirklich. Den, den ich zu vernichten suchte, war genau derjenige, dem ich nun zu dienen berufen war.",
            "Mein Leben wurde zu einem Wettlauf um den Siegespreis der himmlischen Berufung in Christus Jesus. Ich bin Tausende von Meilen durch das Römische Reich gereist, von den Synagogen Asiens bis zum philosophischen Herzen Athens und schließlich bis in die Gefängniszellen von Rom. Ich wurde ausgepeitscht, gesteinigt und für tot erklärt, doch nichts davon erschütterte mich.",
            "Ich spreche von Geheimnissen, die seit Äonen verborgen waren, nun aber durch den Geist offenbart wurden. Meine Briefe sind nicht nur mit Tinte geschrieben, sondern mit den Tränen eines Mannes, der weiß, dass er der 'größte unter den Sündern' ist, aber durch eine Gnade gerettet wurde, die allen Verstand übersteigt.",
            "In meiner Schwachheit ist Gottes Kraft am mächtigsten. Ich habe gelernt, in jeder Lage zufrieden zu sein, ob in Ketten oder in Freiheit. Nichts kann uns trennen von der Liebe Gottes, die in Christus Jesus ist. Ich habe den guten Kampf gekämpft, den Lauf vollendet und den Glauben bewahrt."
        ]
    }
  ]
};