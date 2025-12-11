
import { QuizQuestion } from '../types';

export const STATIC_QUIZ_DATA: Record<'Easy' | 'Medium' | 'Hard', QuizQuestion[]> = {
  Easy: [
    {
      question: "Who built the Ark?",
      options: ["Moses", "Noah", "David", "Abraham"],
      correctIndex: 1,
      explanation: "God instructed Noah to build an ark to save his family and animals from the great flood.",
      reference: "Genesis 6:14"
    },
    {
      question: "What is the first book of the Bible?",
      options: ["Exodus", "Genesis", "Matthew", "Psalms"],
      correctIndex: 1,
      explanation: "Genesis means 'origin' or 'beginning' and covers the creation of the world.",
      reference: "Genesis 1:1"
    },
    {
      question: "Who defeated the giant Goliath?",
      options: ["Saul", "Jonathan", "David", "Samson"],
      correctIndex: 2,
      explanation: "David, a young shepherd, defeated the Philistine giant Goliath with a sling and a stone.",
      reference: "1 Samuel 17:50"
    },
    {
      question: "Where was Jesus born?",
      options: ["Nazareth", "Jerusalem", "Bethlehem", "Galilee"],
      correctIndex: 2,
      explanation: "Jesus was born in Bethlehem of Judea, fulfilling the prophecy of Micah.",
      reference: "Matthew 2:1"
    },
    {
      question: "How many days did God take to create the world?",
      options: ["3", "6", "7", "40"],
      correctIndex: 1,
      explanation: "God created the world in six days and rested on the seventh.",
      reference: "Genesis 2:2"
    },
    {
      question: "Who was swallowed by a great fish?",
      options: ["Jonah", "Peter", "Paul", "Elijah"],
      correctIndex: 0,
      explanation: "Jonah tried to run from God's command but was swallowed by a great fish for three days.",
      reference: "Jonah 1:17"
    },
    {
      question: "What is the longest book in the Bible?",
      options: ["Isaiah", "Genesis", "Psalms", "Revelation"],
      correctIndex: 2,
      explanation: "Psalms is the longest book, containing 150 chapters (or psalms).",
      reference: "Psalms"
    },
    {
      question: "Who betrayed Jesus?",
      options: ["Peter", "Judas Iscariot", "Thomas", "John"],
      correctIndex: 1,
      explanation: "Judas Iscariot betrayed Jesus to the chief priests for thirty pieces of silver.",
      reference: "Matthew 26:14-16"
    },
    {
      question: "What river was Jesus baptized in?",
      options: ["Nile", "Euphrates", "Jordan", "Tigris"],
      correctIndex: 2,
      explanation: "John the Baptist baptized Jesus in the Jordan River.",
      reference: "Mark 1:9"
    },
    {
      question: "Who received the Ten Commandments?",
      options: ["Noah", "Moses", "Abraham", "Joshua"],
      correctIndex: 1,
      explanation: "Moses received the Ten Commandments from God on Mount Sinai.",
      reference: "Exodus 20"
    },
    {
        question: "Who was the mother of Jesus?",
        options: ["Elizabeth", "Martha", "Mary", "Sarah"],
        correctIndex: 2,
        explanation: "The angel Gabriel announced to Mary that she would give birth to the Son of God.",
        reference: "Luke 1:30-31"
    },
    {
        question: "What animal tempted Eve in the Garden of Eden?",
        options: ["Lion", "Serpent", "Dragon", "Goat"],
        correctIndex: 1,
        explanation: "The serpent deceived Eve into eating the forbidden fruit.",
        reference: "Genesis 3:1"
    },
    {
        question: "How many disciples did Jesus have?",
        options: ["3", "7", "10", "12"],
        correctIndex: 3,
        explanation: "Jesus chose twelve apostles to follow Him and spread his teachings.",
        reference: "Matthew 10:1"
    },
    {
        question: "What part of Adam's body did God use to create Eve?",
        options: ["Heart", "Rib", "Dust", "Finger"],
        correctIndex: 1,
        explanation: "God caused a deep sleep to fall on Adam and took one of his ribs to make Eve.",
        reference: "Genesis 2:21-22"
    },
    {
        question: "Who was thrown into the den of lions?",
        options: ["Daniel", "Joseph", "David", "Shadrach"],
        correctIndex: 0,
        explanation: "Daniel was thrown into the lions' den for praying to God, but God shut the lions' mouths.",
        reference: "Daniel 6:22"
    },
    {
        question: "What city's walls fell down after the Israelites marched around them?",
        options: ["Babylon", "Jericho", "Jerusalem", "Nineveh"],
        correctIndex: 1,
        explanation: "The walls of Jericho collapsed after the Israelites marched around them for seven days.",
        reference: "Joshua 6:20"
    },
    {
        question: "Who was the strongest man in the Bible?",
        options: ["Goliath", "Samson", "David", "Solomon"],
        correctIndex: 1,
        explanation: "Samson was given supernatural strength by God, tied to his Nazarite vow.",
        reference: "Judges 13-16"
    },
    {
        question: "What is the last book of the Bible?",
        options: ["Acts", "Revelation", "Jude", "Malachi"],
        correctIndex: 1,
        explanation: "Revelation, written by John, is the final book dealing with prophecy and the end times.",
        reference: "Revelation 1:1"
    },
    {
        question: "Who led the Israelites out of Egypt?",
        options: ["Aaron", "Moses", "Joseph", "Pharaoh"],
        correctIndex: 1,
        explanation: "God chose Moses to lead the Israelites out of slavery in Egypt.",
        reference: "Exodus 3:10"
    },
    {
        question: "What did Jesus feed to the 5,000?",
        options: ["Steak and Eggs", "Bread and Fish", "Milk and Honey", "Figs and Grapes"],
        correctIndex: 1,
        explanation: "Jesus multiplied five loaves and two fish to feed the multitude.",
        reference: "Matthew 14:17-21"
    }
  ],
  Medium: [
    {
      question: "Who was the oldest man in the Bible?",
      options: ["Noah", "Methuselah", "Adam", "Abraham"],
      correctIndex: 1,
      explanation: "Methuselah lived to be 969 years old.",
      reference: "Genesis 5:27"
    },
    {
      question: "Which disciple walked on water with Jesus?",
      options: ["James", "John", "Peter", "Andrew"],
      correctIndex: 2,
      explanation: "Peter stepped out of the boat to walk on water but began to sink when he doubted.",
      reference: "Matthew 14:29"
    },
    {
      question: "Who was the first King of Israel?",
      options: ["David", "Saul", "Solomon", "Samuel"],
      correctIndex: 1,
      explanation: "Saul was anointed by Samuel as the first king of Israel.",
      reference: "1 Samuel 10:1"
    },
    {
      question: "What language was the New Testament originally written in?",
      options: ["Hebrew", "Latin", "Greek", "Aramaic"],
      correctIndex: 2,
      explanation: "The New Testament was primarily written in Koine Greek.",
      reference: "Historical Context"
    },
    {
      question: "How many plagues did God send on Egypt?",
      options: ["7", "10", "12", "3"],
      correctIndex: 1,
      explanation: "God sent 10 plagues, ending with the death of the firstborn.",
      reference: "Exodus 7-12"
    },
    {
      question: "Who recognized Jesus as the Messiah when he was presented at the Temple as a baby?",
      options: ["Simeon", "Zachariah", "Joseph", "Nicodemus"],
      correctIndex: 0,
      explanation: "Simeon, a righteous man, had been promised he would not die before seeing the Messiah.",
      reference: "Luke 2:25-32"
    },
    {
      question: "Which of the apostles was a tax collector?",
      options: ["Thomas", "Matthew", "Luke", "Simon"],
      correctIndex: 1,
      explanation: "Matthew (Levi) was a tax collector before Jesus called him.",
      reference: "Matthew 9:9"
    },
    {
      question: "Who was the wife of Isaac?",
      options: ["Sarah", "Rachel", "Rebekah", "Leah"],
      correctIndex: 2,
      explanation: "Rebekah was chosen to be Isaac's wife.",
      reference: "Genesis 24:67"
    },
    {
      question: "How many pieces of silver did Joseph's brothers sell him for?",
      options: ["10", "20", "30", "40"],
      correctIndex: 1,
      explanation: "Joseph was sold to Ishmaelite merchants for twenty shekels of silver.",
      reference: "Genesis 37:28"
    },
    {
      question: "Which prophet was taken up to heaven in a whirlwind?",
      options: ["Elisha", "Elijah", "Isaiah", "Jeremiah"],
      correctIndex: 1,
      explanation: "Elijah went up to heaven in a whirlwind with a chariot of fire.",
      reference: "2 Kings 2:11"
    },
    {
        question: "Who wrote the majority of the Epistles (letters) in the New Testament?",
        options: ["Peter", "John", "Paul", "James"],
        correctIndex: 2,
        explanation: "The Apostle Paul wrote at least 13 books of the New Testament.",
        reference: "New Testament Canon"
    },
    {
        question: "Who had a coat of many colors?",
        options: ["Benjamin", "Joseph", "David", "Solomon"],
        correctIndex: 1,
        explanation: "Jacob gave his son Joseph a richly ornamented robe (coat of many colors).",
        reference: "Genesis 37:3"
    },
    {
        question: "What is the shortest verse in the Bible?",
        options: ["Jesus wept.", "God is love.", "Pray always.", "Rejoice evermore."],
        correctIndex: 0,
        explanation: "'Jesus wept' is the shortest verse in English translations.",
        reference: "John 11:35"
    },
    {
        question: "Who was the sister of Moses?",
        options: ["Miriam", "Ruth", "Deborah", "Esther"],
        correctIndex: 0,
        explanation: "Miriam was the sister of Moses and Aaron.",
        reference: "Exodus 15:20"
    },
    {
        question: "Who wiped Jesus' feet with her hair?",
        options: ["Mary Magdalene", "Mary of Bethany", "Martha", "Salome"],
        correctIndex: 1,
        explanation: "Mary of Bethany anointed Jesus' feet with expensive perfume and wiped them with her hair.",
        reference: "John 12:3"
    },
    {
        question: "What instrument did David play?",
        options: ["Flute", "Harp/Lyre", "Trumpet", "Drum"],
        correctIndex: 1,
        explanation: "David was a skilled musician who played the lyre (harp) for King Saul.",
        reference: "1 Samuel 16:23"
    },
    {
        question: "Who was the first Christian martyr?",
        options: ["Peter", "James", "Stephen", "Paul"],
        correctIndex: 2,
        explanation: "Stephen was stoned to death for his faith, becoming the first martyr.",
        reference: "Acts 7:59-60"
    },
    {
        question: "Which King built the first Temple in Jerusalem?",
        options: ["David", "Saul", "Solomon", "Hezekiah"],
        correctIndex: 2,
        explanation: "Solomon built the Temple that his father David had wanted to build.",
        reference: "1 Kings 6"
    },
    {
        question: "Who climbed a sycamore tree to see Jesus?",
        options: ["Bartimaeus", "Zacchaeus", "Lazarus", "Nicodemus"],
        correctIndex: 1,
        explanation: "Zacchaeus was short, so he climbed a tree to see Jesus passing by.",
        reference: "Luke 19:4"
    },
    {
        question: "How many days was Lazarus dead before Jesus raised him?",
        options: ["1", "3", "4", "7"],
        correctIndex: 2,
        explanation: "Lazarus had been in the tomb for four days.",
        reference: "John 11:39"
    }
  ],
  Hard: [
    {
      question: "Who was the left-handed judge who killed Eglon?",
      options: ["Gideon", "Ehud", "Jephthah", "Shamgar"],
      correctIndex: 1,
      explanation: "Ehud made a double-edged sword and killed Eglon, King of Moab.",
      reference: "Judges 3:15"
    },
    {
      question: "What is the name of the wood used to build the Ark?",
      options: ["Cedar", "Gopher", "Acacia", "Oak"],
      correctIndex: 1,
      explanation: "God instructed Noah to make the ark of gopher wood.",
      reference: "Genesis 6:14"
    },
    {
      question: "Who fell asleep during Paul's sermon and fell out of a window?",
      options: ["Tychicus", "Eutychus", "Timothy", "Silas"],
      correctIndex: 1,
      explanation: "Eutychus fell into a deep sleep, fell from the third story, and was picked up dead, but Paul revived him.",
      reference: "Acts 20:9"
    },
    {
      question: "Which book of the Bible does not mention the name of God?",
      options: ["Ruth", "Song of Solomon", "Esther", "Ecclesiastes"],
      correctIndex: 2,
      explanation: "The book of Esther does not explicitly mention God, though His providence is evident.",
      reference: "Esther"
    },
    {
      question: "Who was the high priest when Jesus was crucified?",
      options: ["Annas", "Caiaphas", "Pilate", "Gamaliel"],
      correctIndex: 1,
      explanation: "Caiaphas was the high priest who prophesied that one man should die for the people.",
      reference: "John 11:49"
    },
    {
      question: "What was the name of the demon-possessed man in Gadara?",
      options: ["Legion", "Beelzebub", "Apollyon", "Mammon"],
      correctIndex: 0,
      explanation: "He said, 'My name is Legion, for we are many.'",
      reference: "Mark 5:9"
    },
    {
      question: "Who had a donkey that spoke to him?",
      options: ["Balaam", "Balak", "Samson", "Gideon"],
      correctIndex: 0,
      explanation: "The Lord opened the donkey's mouth to speak to Balaam.",
      reference: "Numbers 22:28"
    },
    {
      question: "How many years did the Israelites wander in the wilderness?",
      options: ["10", "20", "40", "50"],
      correctIndex: 2,
      explanation: "They wandered for 40 years as a consequence of their unbelief.",
      reference: "Numbers 14:33"
    },
    {
      question: "Which tribe of Israel served as priests?",
      options: ["Judah", "Levi", "Benjamin", "Dan"],
      correctIndex: 1,
      explanation: "The tribe of Levi was set apart for priestly service.",
      reference: "Numbers 3:6"
    },
    {
      question: "What was the name of David's best friend?",
      options: ["Abner", "Jonathan", "Joab", "Absalom"],
      correctIndex: 1,
      explanation: "The soul of Jonathan was knit to the soul of David, and he loved him as himself.",
      reference: "1 Samuel 18:1"
    },
    {
        question: "Who was the only female judge of Israel?",
        options: ["Jael", "Deborah", "Ruth", "Naomi"],
        correctIndex: 1,
        explanation: "Deborah was a prophetess and the fourth judge of pre-monarchic Israel.",
        reference: "Judges 4:4"
    },
    {
        question: "What island was John exiled to when he wrote Revelation?",
        options: ["Cyprus", "Crete", "Patmos", "Malta"],
        correctIndex: 2,
        explanation: "John was on the island of Patmos for the word of God and the testimony of Jesus.",
        reference: "Revelation 1:9"
    },
    {
        question: "How many minor prophets are there in the Old Testament?",
        options: ["4", "10", "12", "7"],
        correctIndex: 2,
        explanation: "There are 12 Minor Prophets (Hosea through Malachi).",
        reference: "Old Testament Canon"
    },
    {
        question: "Who was the first martyr among the Apostles?",
        options: ["Peter", "Stephen", "James the Great", "Andrew"],
        correctIndex: 2,
        explanation: "James, the brother of John, was killed with the sword by King Herod Agrippa.",
        reference: "Acts 12:2"
    },
    {
        question: "What does the name 'Isaac' mean?",
        options: ["He laughs", "God hears", "Beloved", "Strong"],
        correctIndex: 0,
        explanation: "Sarah laughed when told she would have a son. Isaac means 'he laughs'.",
        reference: "Genesis 21:6"
    },
    {
        question: "Who found the book of the Law during Temple renovations?",
        options: ["Josiah", "Hilkiah", "Ezra", "Nehemiah"],
        correctIndex: 1,
        explanation: "Hilkiah the high priest found the Book of the Law.",
        reference: "2 Kings 22:8"
    },
    {
        question: "How many chapters are in the book of Isaiah?",
        options: ["50", "66", "150", "40"],
        correctIndex: 1,
        explanation: "Isaiah has 66 chapters, often mirroring the structure of the Bible itself.",
        reference: "Book of Isaiah"
    },
    {
        question: "Who killed Sisera with a tent peg?",
        options: ["Deborah", "Jael", "Rahab", "Delilah"],
        correctIndex: 1,
        explanation: "Jael drove a tent peg through Sisera's temple while he slept.",
        reference: "Judges 4:21"
    },
    {
        question: "What was the name of the copper snake Moses made?",
        options: ["Nehushtan", "Leviathan", "Behemoth", "Azazel"],
        correctIndex: 0,
        explanation: "It was called Nehushtan, and later destroyed by Hezekiah because people worshiped it.",
        reference: "2 Kings 18:4"
    },
    {
        question: "Who succeeded Elijah as prophet?",
        options: ["Isaiah", "Elisha", "Jeremiah", "Amos"],
        correctIndex: 1,
        explanation: "Elisha requested a double portion of Elijah's spirit and succeeded him.",
        reference: "2 Kings 2:9-15"
    }
  ]
};
