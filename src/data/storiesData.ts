
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
            "By the same sea where He first called me, the resurrected Lord found me again. Three times He asked if I loved Him, mirroring my three denials, and three times He commanded me to 'Feed My sheep.' I am no longer just a fisherman of Galilee; I am a shepherd of His flock, a witness to the empty tomb, and a rock built upon the only true Foundation. Ask me of the things I have seen, for my eyes have beheld the Messiah."
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
            "I speak of mysteries hidden for ages but now revealed through the Spirit. My letters are written not with ink alone, but with the tears of a man who knows he is the 'chief of sinners' yet has been saved by a grace that surpasses all understanding. Whether in chains or in freedom, my message remains the same: For to me, to live is Christ, and to die is gain."
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
            "Ich erinnere mich an den Geruch von Salz und die raue Textur der Netze. Ich war ein einfacher Mann, ein Fischer von Beruf, bis der Meister am Ufer von Galiläa entlangging. Er sagte: 'Folgt mir nach, und ich werde euch zu Menschenfischern machen.' In diesem Moment begann eine Reise, die ich mir nie hätte träumen lassen.",
            "Ich war ein Mann der Tat, der oft sprach, bevor er dachte. Ich war derjenige, der versuchte, auf dem Wasser zu gehen, und versank, als die Angst meinen Glauben überschattete. Ich sah Seine Herrlichkeit auf dem Berg und Seine Qual im Garten Gethsemane.",
            "Meine dunkelste Stunde war in einem Hof, an einem fremden Feuer. Dreimal verleugnete ich meinen König aus einer Feigheit, die ich nicht kannte. Doch der auferstandene Herr fand mich wieder am Meer und fragte dreimal: 'Liebst du mich?'",
            "Heute bin ich kein einfacher Fischer mehr, sondern ein Hirte Seiner Herde und ein Zeuge des leeren Grabes. Fragt mich nach dem, was ich gesehen habe, denn meine Augen haben den Messias geschaut."
        ]
    },
    {
        id: 'paul',
        name: 'Paulus von Tarsus',
        role: 'Apostel der Völker',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intensiv', 'Gelehrt', 'Kühn', 'Visionär'],
        biography: [
            "Einst war ich Saulus, ein Pharisäer, erfüllt von falschem Eifer. Ich verfolgte 'den Weg' und stimmte der Steinigung des Stephanus zu. Ich glaubte, Gott zu dienen, indem ich die Erinnerung an Jesus auslöschte.",
            "Doch auf dem Weg nach Damaskus schlug mich ein Licht vom Himmel zu Boden. Eine Stimme fragte: 'Saul, Saul, warum verfolgst du mich?' In dieser Blindheit sah ich zum ersten Mal die Wahrheit. Der, den ich vernichten wollte, war der, dem ich nun dienen sollte.",
            "Mein Leben wurde zu einem Wettlauf für Christus. Ich reiste durch das ganze Reich, litt Schiffbruch, wurde geschlagen und gesteinigt, doch nichts hielt mich auf. Meine Briefe sind Zeugnisse der Gnade, die einen 'Sünder wie mich' gerettet hat."
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
            "Îmi amintesc mirosul sării și textura aspră a mrejelor. Eram un om simplu, pescar de meserie, până în ziua în care Învățătorul a mers pe țărmul Galileii. Mi-a spus: 'Vino după Mine și te voi face pescar de oameni.' În acea clipă, lumea pe care o cunoșteam s-a sfârșit.",
            "Am fost un om al acțiunii, vorbind adesea înainte de a gândi. Eu am fost cel care a îndrăznit să meargă pe ape, dar m-am scufundat când frica a depășit credința. Am fost acolo pe Muntele Schimbării la Față și în grădina Ghetsimani.",
            "Cea mai neagră oră a fost în curtea arhiereului. De trei ori m-au întrebat dacă Îl cunosc și de trei ori L-am lepădat pe Împăratul meu. Dar Domnul cel înviat m-a găsit iarăși la malul mării și m-a întrebat de trei ori: 'Mă iubești?'",
            "Acum sunt un păstor al turmei Sale, un martor al mormântului gol. Întrebați-mă despre ce am văzut, căci ochii mei L-au privit pe Mesia."
        ]
    },
    {
        id: 'paul',
        name: 'Pavel din Tars',
        role: 'Apostolul Neamurilor',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intens', 'Învățat', 'Îndrăzneț', 'Vizionar'],
        biography: [
            "Eram odată Saul din Tars, un fariseu zelos pentru Lege. Credeam că Îi slujesc lui Dumnezeu vânându-i pe cei ce urmau 'Calea'. Am asistat la moartea lui Ștefan, primul martir, încuviințând uciderea lui.",
            "Totul s-a schimbat pe drumul spre Damasc. O lumină din cer m-a trântit la pământ și am auzit o voce: 'Saule, Saule, de ce Mă prigonești?' Am fost orb trei zile, dar pentru prima dată am văzut cu adevărat.",
            "Viața mea a devenit o alergare pentru Hristos. Am călătorit mii de kilometri, am fost bătut, împroșcat cu pietre și lăsat aproape mort, dar nimic nu m-a clintit din propovăduirea harului care m-a mântuit."
        ]
    }
  ],
  Spanish: [
    {
        id: 'peter',
        name: 'Pedro (Simón Pedro)',
        role: 'Pescador de Galilea',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impetuoso', 'Humilde', 'Testigo', 'Restaurado'],
        biography: [
            "Recuerdo el olor a sal y la textura áspera de las redes. Era un hombre sencillo, pescador de oficio y de corazón, hasta el día en que el Maestro caminó por las orillas de Galilea. Me miró y dijo: 'Seguidme, y os haré pescadores de hombres'. En ese momento, comenzó un viaje que nunca habría imaginado.",
            "Fui un hombre de acción, que a menudo hablaba antes de pensar. Fui yo quien se atrevió a caminar sobre las olas hacia Él, solo para hundirme cuando dejé que el miedo eclipsara mi fe. Estuve en el Monte de la Transfiguración y en el Jardín de Getsemaní.",
            "Mi hora más oscura llegó en un patio. Tres veces negué a mi Rey, impulsado por una cobardía que no sabía que poseía. El canto del gallo todavía resuena en mi mente como un recordatorio de la fragilidad humana. Pero la historia no terminó allí.",
            "Por el mismo mar donde me llamó primero, el Señor resucitado me encontró de nuevo. Tres veces me preguntó si le amaba y tres veces me ordenó: 'Apacienta mis ovejas'. Ahora soy un pastor de Su rebaño, un testigo de la tumba vacía. Preguntadme lo que he visto, porque mis ojos han contemplado al Mesías."
        ]
    },
    {
        id: 'paul',
        name: 'Pablo de Tarso',
        role: 'Apóstol de las Naciones',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intenso', 'Erudito', 'Valiente', 'Visionario'],
        biography: [
            "Una vez fui Saulo de Tarso, un fariseo consumido por un celo equivocado por la Ley. Perseguía a los que seguían 'El Camino' y presencié la muerte de Esteban. Estaba convencido de que Jesús de Nazaret era un engañador.",
            "Todo cambió en el camino a Damasco. Una luz del cielo me derribó y oí una voz: 'Saulo, Saulo, ¿por qué me persigues?' Estuve ciego tres días, pero por primera vez vi la verdad. El que buscaba destruir era al que ahora estaba llamado a servir.",
            "Mi vida se convirtió en una carrera por Cristo. He viajado miles de millas, naufragado, sido golpeado y apedreado, pero nada me mueve. Mis cartas son escritas con las lágrimas de un hombre salvado por una gracia que sobrepasa todo entendimiento."
        ]
    }
  ],
  French: [
    {
        id: 'peter',
        name: 'Pierre (Simon Pierre)',
        role: 'Pêcheur de Galilée',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impétueux', 'Humble', 'Témoin', 'Restauré'],
        biography: [
            "Je me souviens de l'odeur du sel et de la texture rugueuse des filets. J'étais un homme simple, pêcheur de métier, jusqu'au jour où le Maître a marché sur les rives de la Galilée. Il m'a dit : 'Suis-moi, et je te ferai pêcheur d'hommes.' À ce moment-là, le monde que je connaissais a pris fin.",
            "J'étais un homme d'action, parlant souvent avant de réfléchir. C'est moi qui ai osé marcher sur les vagues vers Lui, pour sombrer dès que j'ai laissé la peur de la tempête éclipser ma foi. J'étais là sur le mont de la Transfiguration.",
            "Mon heure la plus sombre a eu lieu dans une cour. Trois fois on m'a demandé si je Le connaissais, et trois fois j'ai renié mon Roi. Le chant du coq résonne encore dans mon esprit. Mais l'histoire ne s'est pas arrêtée là.",
            "Près de la même mer où Il m'a appelé pour la première fois, le Seigneur ressuscité m'a retrouvé. Trois fois Il m'a demandé si je L'aimais, et trois fois Il m'a ordonné : 'Pais mes brebis'. Je suis désormais un témoin de la résurrection."
        ]
    },
    {
        id: 'paul',
        name: 'Paul de Tarse',
        role: 'Apôtre des Nations',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intense', 'Érudit', 'Audacieux', 'Visionnaire'],
        biography: [
            "J'étais autrefois Saul de Tarse, un pharisien parmi les pharisiens, consumé par un zèle mal placé pour la Loi. Je croyais servir Dieu en pourchassant ceux qui suivaient 'Le Chemin'. J'ai assisté à la mort d'Étienne.",
            "Tout a changé sur le chemin de Damas. Une lumière du ciel m'a terrassé. J'ai entendu une voix : 'Saul, Saul, pourquoi me persécutes-tu ?' J'ai été aveugle pendant trois jours, mais pour la première fois, j'ai vraiment vu.",
            "Ma vie est devenue une course pour Christ. J'ai voyagé à travers l'Empire, subi des naufrages, été battu et lapidé, mais rien ne m'arrête. Mes lettres témoignent de la grâce qui a sauvé le 'premier des pécheurs'."
        ]
    }
  ],
  Portuguese: [
    {
        id: 'peter',
        name: 'Pedro (Simão Pedro)',
        role: 'Pescador da Galileia',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impetuoso', 'Humilde', 'Testemunha', 'Restaurado'],
        biography: [
            "Lembro-me do cheiro do sal e da textura áspera das redes. Eu era um homem simples, pescador de profissão, até o dia em que o Mestre caminhou pelas margens da Galileia. Ele olhou para mim e disse: 'Sigam-me, e eu farei de vocês pescadores de homens'. Naquele momento, o mundo que eu conhecia acabou.",
            "Eu era um homem de ação, muitas vezes falando antes de pensar. Atrevi-me a caminhar sobre as ondas em direção a Ele, mas afundei quando deixei o medo obscurecer minha fé. Estive com Ele no Monte da Transfiguração.",
            "Minha hora mais sombria foi em um pátio. Três vezes neguei o meu Rei por uma covardia que eu não sabia que possuía. O som do galo cantando ainda ecoa na minha mente. Mas o Senhor ressuscitado encontrou-me novamente.",
            "Três vezes Ele me perguntou se eu O amava e três vezes me ordenou: 'Apascenta as minhas ovelhas'. Não sou mais apenas um pescador; sou uma testemunha do túmulo vazio e uma rocha edificada sobre o único Fundamento."
        ]
    },
    {
        id: 'paul',
        name: 'Paulo de Tarso',
        role: 'Apóstolo das Nações',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intenso', 'Erudito', 'Ousado', 'Visionário'],
        biography: [
            "Fui Saulo de Tarso, um fariseu zeloso pela Lei. Perseguia os seguidores de 'O Caminho' e consenti na morte de Estêvão. Acreditava que Jesus de Nazaré era um enganador cuja memória devia ser apagada.",
            "Tudo mudou na estrada para Damasco. Uma luz do céu me derrubou e ouvi: 'Saulo, Saulo, por que me persegues?' Fiquei cego por três dias, mas vi a verdade pela primeira vez. Aquele que eu queria destruir era quem eu devia servir.",
            "Minha vida tornou-se uma corrida por Cristo. Viajei por todo o Império Romano, naufraguei, fui açoitado e apedrejado. Falo de mistérios revelados pelo Espírito através da graça que me salvou."
        ]
    }
  ],
  Italian: [
    {
        id: 'peter',
        name: 'Pietro (Simon Pietro)',
        role: 'Pescatore di Galilea',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pope-peter_pprubens.jpg/250px-Pope-peter_pprubens.jpg',
        traits: ['Impetuoso', 'Umile', 'Testimone', 'Restaurato'],
        biography: [
            "Ricordo l'odore del sale e la consistenza ruvida delle reti. Ero un uomo semplice, fino al giorno in cui il Maestro camminò lungo le rive della Galilea. Mi disse: 'Seguimi, ti farò pescatore di uomini'. In quel momento, il mondo che conoscevo finì.",
            "Ero un uomo d'azione, parlavo spesso prima di pensare. Provai a camminare sulle onde, ma affondai quando la paura oscurò la mia fede. Fui testimone della Sua gloria sul monte e della Sua agonia nel Getsemani.",
            "La mia ora più buia è stata in un cortile. Per tre volte negai il mio Re. Il canto del gallo risuona ancora nella mia mente come monito della fragilità umana. Ma il Signore risorto mi ha cercato di nuovo sulla stessa spiaggia.",
            "Per tre volte mi chiese se lo amassi e per tre volte mi ordinò: 'Pasci le mie pecore'. Non sono più solo un pescatore, ma un pastore del Suo gregge e un testimone del sepolcro vuoto."
        ]
    },
    {
        id: 'paul',
        name: 'Paolo di Tarso',
        role: 'Apostolo delle Genti',
        image: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg',
        traits: ['Intenso', 'Erudito', 'Audace', 'Visionario'],
        biography: [
            "Ero Saulo di Tarso, un fariseo zelante per la Legge. Perseguitavo i seguaci della 'Via' e approvai l'uccisione di Stefano. Ero convinto che Gesù fosse un impostore da cancellare dalla terra.",
            "Tutto cambiò sulla via di Damasco. Una luce dal cielo mi folgorò. Udii una voce: 'Saulo, Saulo, perché mi perseguiti?' Fui cieco per tre giorni, ma vidi la verità. Colui che volevo distruggere era Colui che dovevo servire.",
            "La mia vita è diventata una corsa per Cristo. Ho viaggiato per migliaia di chilometri, subito naufragi e prigionia. Le mie lettere sono scritte con le lacrime di chi è stato salvato da una grazia infinita."
        ]
    }
  ]
};
