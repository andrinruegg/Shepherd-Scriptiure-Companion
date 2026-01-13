
import { QuizQuestion } from '../types';

type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';
type QuizData = Record<string, Record<QuizDifficulty, QuizQuestion[]>>;

export const STATIC_QUIZ_DATA: QuizData = {
  English: {
    Easy: [
      { question: "Who built the Ark?", options: ["Moses", "Noah", "David", "Abraham"], correctIndex: 1, explanation: "God instructed Noah to build an ark to save his family and animals from the great flood.", reference: "Genesis 6:14" },
      { question: "Where was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Galilee"], correctIndex: 2, explanation: "Jesus was born in Bethlehem of Judea, fulfilling the prophecy of Micah.", reference: "Matthew 2:1" },
      { question: "What river was Jesus baptized in?", options: ["Nile", "Euphrates", "Jordan", "Tigris"], correctIndex: 2, explanation: "John the Baptist baptized Jesus in the Jordan River.", reference: "Mark 1:9" },
      { question: "Who was the first man created?", options: ["Eve", "Abel", "Cain", "Adam"], correctIndex: 3, explanation: "Adam was the first man created by God in the Garden of Eden.", reference: "Genesis 2:7" },
      { question: "How many disciples did Jesus choose?", options: ["7", "10", "12", "40"], correctIndex: 2, explanation: "Jesus chose twelve apostles to follow Him and spread His message.", reference: "Matthew 10:1" }
    ],
    Medium: [
      { question: "Who was the oldest man in the Bible?", options: ["Noah", "Methuselah", "Adam", "Abraham"], correctIndex: 1, explanation: "Methuselah lived to be 969 years old.", reference: "Genesis 5:27" },
      { question: "Who succeeded Elijah as prophet?", options: ["Elisha", "Isaiah", "Jeremiah", "Ezekiel"], correctIndex: 0, explanation: "Elisha followed Elijah and received a double portion of his spirit.", reference: "2 Kings 2:9" }
    ],
    Hard: [
      { question: "Who was the left-handed judge who killed Eglon?", options: ["Gideon", "Ehud", "Jephthah", "Shamgar"], correctIndex: 1, explanation: "Ehud made a double-edged sword and killed Eglon, King of Moab.", reference: "Judges 3:15" }
    ]
  },
  German: {
    Easy: [
      { question: "Wer baute die Arche?", options: ["Mose", "Noah", "David", "Abraham"], correctIndex: 1, explanation: "Gott befahl Noah, eine Arche zu bauen, um seine Familie und die Tiere zu retten.", reference: "1. Mose 6,14" },
      { question: "Wo wurde Jesus geboren?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Galiläa"], correctIndex: 2, explanation: "Jesus wurde in Bethlehem in Judäa geboren.", reference: "Matthäus 2,1" },
      { question: "In welchem Fluss wurde Jesus getauft?", options: ["Nil", "Euphrat", "Jordan", "Tigris"], correctIndex: 2, explanation: "Johannes der Täufer taufte Jesus im Jordan.", reference: "Markus 1,9" }
    ],
    Medium: [
        { question: "Wer war der älteste Mann der Bibel?", options: ["Noah", "Methusalem", "Adam", "Abraham"], correctIndex: 1, explanation: "Methusalem wurde 969 Jahre alt.", reference: "1. Mose 5,27" }
    ],
    Hard: [
        { question: "Wer war der linkshändige Richter, der Eglon tötete?", options: ["Gideon", "Ehud", "Jephta", "Schamgar"], correctIndex: 1, explanation: "Ehud tötete den König von Moab mit einem zweischneidigen Schwert.", reference: "Richter 3,15" }
    ]
  },
  Romanian: {
    Easy: [
      { question: "Cine a construit Arca?", options: ["Moise", "Noe", "David", "Avraam"], correctIndex: 1, explanation: "Dumnezeu i-a poruncit lui Noe să construiască o arcă.", reference: "Geneza 6:14" },
      { question: "Unde s-a născut Isus?", options: ["Nazaret", "Ierusalim", "Betleem", "Galilee"], correctIndex: 2, explanation: "Isus s-a născut în Betleemul din Iudeea.", reference: "Matei 2:1" }
    ],
    Medium: [
        { question: "Cine a fost cel mai bătrân om?", options: ["Noe", "Metusala", "Adam", "Avraam"], correctIndex: 1, explanation: "Metusala a trăit 969 de ani.", reference: "Geneza 5:27" }
    ],
    Hard: [
        { question: "Cine a fost judecătorul stângaci?", options: ["Ghedeon", "Ehud", "Iefta", "Șamgar"], correctIndex: 1, explanation: "Ehud l-a ucis pe împăratul Moabului.", reference: "Judecătorii 3:15" }
    ]
  },
  Spanish: {
    Easy: [
      { question: "¿Quién construyó el Arca?", options: ["Moisés", "Noé", "David", "Abraham"], correctIndex: 1, explanation: "Dios le mandó a Noé construir un arca para salvar a su familia y a los animales.", reference: "Génesis 6:14" },
      { question: "¿Dónde nació Jesús?", options: ["Nazaret", "Jerusalén", "Belén", "Galilea"], correctIndex: 2, explanation: "Jesús nació en Belén de Judea, cumpliendo la profecía de Miqueas.", reference: "Mateo 2:1" },
      { question: "¿En qué río fue bautizado Jesús?", options: ["Nilo", "Éufrates", "Jordán", "Tigris"], correctIndex: 2, explanation: "Juan el Bautista bautizó a Jesús en el río Jordán.", reference: "Marcos 1:9" },
      { question: "¿Quién fue el primer hombre creado?", options: ["Eva", "Abel", "Caín", "Adán"], correctIndex: 3, explanation: "Adán fue el primer hombre creado por Dios en el Jardín del Edén.", reference: "Génesis 2:7" },
      { question: "¿Cuántos discípulos eligió Jesús?", options: ["7", "10", "12", "40"], correctIndex: 2, explanation: "Jesús eligió a doce apóstoles para seguirle y difundir su mensaje.", reference: "Mateo 10:1" }
    ],
    Medium: [
      { question: "¿Quién fue el hombre más viejo en la Biblia?", options: ["Noé", "Matusalén", "Adán", "Abraham"], correctIndex: 1, explanation: "Matusalén vivió 969 años.", reference: "Génesis 5:27" },
      { question: "¿Quién sucedió a Elías como profeta?", options: ["Eliseo", "Isaías", "Jeremías", "Ezequiel"], correctIndex: 0, explanation: "Eliseo siguió a Elías y recibió una doble porción de su espíritu.", reference: "2 Reyes 2:9" }
    ],
    Hard: [
      { question: "¿Quién fue el juez zurdo que mató a Eglón?", options: ["Gedeón", "Aod", "Jefté", "Samgar"], correctIndex: 1, explanation: "Aod fabricó un puñal de dos filos y mató a Eglón, rey de Moab.", reference: "Jueces 3:15" }
    ]
  },
  French: {
    Easy: [
      { question: "Qui a construit l'Arche ?", options: ["Moïse", "Noé", "David", "Abraham"], correctIndex: 1, explanation: "Dieu a ordonné à Noé de construire une arche pour sauver sa famille et les animaux.", reference: "Genèse 6:14" },
      { question: "Où est né Jésus ?", options: ["Nazareth", "Jérusalem", "Bethléem", "Galilée"], correctIndex: 2, explanation: "Jésus est né à Bethléem en Judée, accomplissant la prophétie de Michée.", reference: "Matthieu 2:1" },
      { question: "Dans quel fleuve Jésus a-t-il été baptisé ?", options: ["Nil", "Euphrate", "Jourdain", "Tigre"], correctIndex: 2, explanation: "Jean-Baptiste a baptisé Jésus dans le Jourdain.", reference: "Marc 1:9" },
      { question: "Qui a été le premier homme créé ?", options: ["Ève", "Abel", "Caïn", "Adam"], correctIndex: 3, explanation: "Adam a été le premier homme créé par Dieu dans le jardin d'Éden.", reference: "Genèse 2:7" },
      { question: "Combien de disciples Jésus a-t-il choisis ?", options: ["7", "10", "12", "40"], correctIndex: 2, explanation: "Jésus a choisi douze apôtoles pour le suivre.", reference: "Matthieu 10:1" }
    ],
    Medium: [
      { question: "Qui est l'homme le plus vieux de la Bible ?", options: ["Noé", "Mathusalem", "Adam", "Abraham"], correctIndex: 1, explanation: "Mathusalem a vécu 969 ans.", reference: "Genèse 5:27" },
      { question: "Qui a succédé à Élie comme prophète ?", options: ["Élisée", "Isaïe", "Jérémie", "Ézéchiel"], correctIndex: 0, explanation: "Élisée a suivi Élie et a reçu une double portion de son esprit.", reference: "2 Rois 2:9" }
    ],
    Hard: [
      { question: "Qui était le juge gaucher qui a tué Églon ?", options: ["Gédéon", "Éhud", "Jephthé", "Shamgar"], correctIndex: 1, explanation: "Éhud a fabriqué une épée à deux tranchants et a tué Églon, roi de Moab.", reference: "Juges 3:15" }
    ]
  },
  Portuguese: {
    Easy: [
      { question: "Quem construiu a Arca?", options: ["Moisés", "Noé", "Davi", "Abraão"], correctIndex: 1, explanation: "Deus instruiu Noé a construir uma arca para salvar sua família e os animais.", reference: "Gênesis 6:14" },
      { question: "Onde Jesus nasceu?", options: ["Nazaré", "Jerusalém", "Belém", "Galileia"], correctIndex: 2, explanation: "Jesus nasceu em Belém da Judeia.", reference: "Mateus 2:1" },
      { question: "Em qual rio Jesus foi batizado?", options: ["Nilo", "Eufrates", "Jordão", "Tigre"], correctIndex: 2, explanation: "João Batista batizou Jesus no rio Jordão.", reference: "Marcos 1:9" },
      { question: "Quem foi o primeiro homem criado?", options: ["Eva", "Abel", "Caim", "Adão"], correctIndex: 3, explanation: "Adão foi o primeiro homem criado por Deus.", reference: "Gênesis 2:7" },
      { question: "Quantos discípulos Jesus escolheu?", options: ["7", "10", "12", "40"], correctIndex: 2, explanation: "Jesus escolheu doze apóstolos.", reference: "Mateus 10:1" }
    ],
    Medium: [
      { question: "Quem foi o homem mais velho da Bíblia?", options: ["Noé", "Matusalém", "Adão", "Abraão"], correctIndex: 1, explanation: "Matusalém viveu 969 anos.", reference: "Gênesis 5:27" },
      { question: "Quem sucedeu Elias como profeta?", options: ["Eliseu", "Isaías", "Jeremias", "Ezequiel"], correctIndex: 0, explanation: "Eliseu seguiu Elias e recebeu uma porção dobrada do seu espírito.", reference: "2 Reis 2:9" }
    ],
    Hard: [
      { question: "Quem foi o juiz canhoto que matou Eglom?", options: ["Gideão", "Eúde", "Jefté", "Sangar"], correctIndex: 1, explanation: "Eúde fez uma espada de dois gumes e matou Eglom, rei de Moabe.", reference: "Juízes 3:15" }
    ]
  },
  Italian: {
    Easy: [
      { question: "Chi costruì l'Arca?", options: ["Mosè", "Noè", "Davide", "Abramo"], correctIndex: 1, explanation: "Dio ordinò a Noè di costruire un'arca per salvare la sua famiglia e gli animali.", reference: "Genesi 6:14" },
      { question: "Dove nacque Gesù?", options: ["Nazareth", "Gerusalemme", "Betlemme", "Galilea"], correctIndex: 2, explanation: "Gesù nacque a Betlemme di Giudea.", reference: "Matteo 2:1" },
      { question: "In quale fiume fu battezzato Gesù?", options: ["Nilo", "Eufrate", "Giordano", "Tigri"], correctIndex: 2, explanation: "Giovanni Battista battezzò Gesù nel fiume Giordano.", reference: "Marco 1:9" },
      { question: "Chi fu il primo uomo creato?", options: ["Eva", "Abele", "Caino", "Adamo"], correctIndex: 3, explanation: "Adamo fu il primo uomo creato da Dio nel giardino dell'Eden.", reference: "Genesi 2:7" },
      { question: "Quanti discepoli scelse Gesù?", options: ["7", "10", "12", "40"], correctIndex: 2, explanation: "Gesù scelse dodici apostoli.", reference: "Matteo 10:1" }
    ],
    Medium: [
      { question: "Chi fu l'uomo più vecchio della Bibbia?", options: ["Noè", "Matusalemme", "Adamo", "Abramo"], correctIndex: 1, explanation: "Matusalemme visse 969 anni.", reference: "Genesi 5:27" },
      { question: "Chi succedette a Elia come profeta?", options: ["Eliseo", "Isaia", "Geremia", "Ezechiele"], correctIndex: 0, explanation: "Eliseo seguì Elia e ricevette una doppia porzione del suo spirito.", reference: "2 Re 2:9" }
    ],
    Hard: [
      { question: "Chi fu il giudice mancino che uccise Eglon?", options: ["Gedeone", "Eud", "Iefte", "Samgar"], correctIndex: 1, explanation: "Eud fabbricò un pugnale a due tagli e uccise Eglon, re di Moab.", reference: "Giudici 3:15" }
    ]
  }
};
