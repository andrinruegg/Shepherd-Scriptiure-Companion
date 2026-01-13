
import { QuizQuestion } from '../types';

type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';
type QuizData = Record<string, Record<QuizDifficulty, QuizQuestion[]>>;

export const STATIC_QUIZ_DATA: QuizData = {
  English: {
    Easy: [
      { question: "Who built the Ark?", options: ["Moses", "Noah", "David", "Abraham"], correctIndex: 1, explanation: "God instructed Noah to build an ark to save his family and animals from the great flood.", reference: "Genesis 6:14" },
      { question: "Where was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Galilee"], correctIndex: 2, explanation: "Jesus was born in Bethlehem of Judea, fulfilling the prophecy of Micah.", reference: "Matthew 2:1" }
    ],
    Medium: [
      { question: "Who was the oldest man in the Bible?", options: ["Noah", "Methuselah", "Adam", "Abraham"], correctIndex: 1, explanation: "Methuselah lived to be 969 years old.", reference: "Genesis 5:27" }
    ],
    Hard: [
      { question: "Who was the left-handed judge who killed Eglon?", options: ["Gideon", "Ehud", "Jephthah", "Shamgar"], correctIndex: 1, explanation: "Ehud made a double-edged sword and killed Eglon, King of Moab.", reference: "Judges 3:15" }
    ]
  },
  German: {
    Easy: [
      { question: "Wer baute die Arche?", options: ["Mose", "Noah", "David", "Abraham"], correctIndex: 1, explanation: "Gott befahl Noah, eine Arche zu bauen, um seine Familie und die Tiere zu retten.", reference: "1. Mose 6,14" },
      { question: "Wo wurde Jesus geboren?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Galiläa"], correctIndex: 2, explanation: "Jesus wurde in Bethlehem in Judäa geboren.", reference: "Matthäus 2,1" }
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
  }
};
