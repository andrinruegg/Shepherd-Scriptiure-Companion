import { BibleStory } from '../types';

type StoriesData = Record<string, BibleStory[]>;

const IMAGES = {
    jesus: 'https://images.pexels.com/photos/53959/summit-cross-peak-happiness-hochlantsch-mountain-53959.jpeg', 
    peter: 'https://ucatholic.com/wp-content/uploads/2017/06/SaintPeter.png',
    mary: 'https://cdn.pixabay.com/photo/2023/01/30/03/35/virgin-mary-7754571_1280.jpg',
    david: 'https://www.myjewishlearning.com/wp-content/uploads/2009/03/2048px-Gerard_van_Honthorst_-_King_David_Playing_the_Harp_-_Google_Art_Project-1595x900.jpg',
    moses: 'https://cdn.prod.website-files.com/5b8fd783bee52c8fb59b1fac/61cdcae233925b85b530449d_Moses%2520A%2520Not%2520Quite%2520Mortal%2520Moses.jpeg',
    paul: 'https://media.swncdn.com/via/13071-probablyvalentindeboulogne-saintpaulwritinghi.jpg'
};

export const STORIES_DATA: StoriesData = {
  English: [
    {
      id: 'jesus',
      name: 'Jesus Christ',
      role: 'The Son of God',
      image: IMAGES.jesus,
      meaningOfName: 'The Lord Saves (Yeshua)',
      timeline: 'c. 4 BC – 30 AD',
      traits: ['Love', 'Humility', 'Sacrifice', 'Authority', 'Compassion'],
      family: {
          parents: 'God the Father / Joseph (Adoptive) & Mary',
          siblings: 'James, Joseph, Judas, Simon (Half-brothers)',
      },
      keyVerses: [
          { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
          { ref: "John 14:6", text: "I am the way and the truth and the life. No one comes to the Father except through me." }
      ],
      biography: [
          "Jesus is the central figure of Christianity, believed to be the Son of God and the Messiah. His life, recorded in the Gospels, serves as the foundation for the New Testament.",
          "Born in Bethlehem to the Virgin Mary, Jesus spent His early years in Nazareth. At thirty, He began His public ministry, preaching about the Kingdom of God, performing miracles, and calling followers to a life of radical love and repentance.",
          "His ultimate mission was sacrificial. He was crucified in Jerusalem, an act Christians believe secured salvation for humanity. On the third day, He rose from the dead, overcoming sin and death forever."
      ]
    },
    {
        id: 'peter',
        name: 'Peter',
        role: 'The Rock',
        image: IMAGES.peter,
        meaningOfName: 'Rock (Petros)',
        timeline: 'died c. 64 AD',
        traits: ['Boldness', 'Passion', 'Leadership', 'Loyalty'],
        family: { parents: 'Jonah', siblings: 'Andrew' },
        keyVerses: [{ ref: "Matthew 16:18", text: "And I tell you that you are Peter, and on this rock I will build my church." }],
        biography: [
            "A humble fisherman from Galilee, Peter was transformed into the leader of the Apostles. He was known for his fiery temperament and deep love for Jesus.",
            "Though he famously denied knowing Jesus three times during the night of His trial, Peter's story is one of ultimate restoration. Jesus reinstated him on the beach, asking him to 'feed my sheep.'",
            "After Pentecost, Peter became the primary voice of the early church in Jerusalem, boldly preaching the Gospel and performing miracles in Jesus' name."
        ]
    },
    {
        id: 'mary',
        name: 'Mary',
        role: 'Mother of Jesus',
        image: IMAGES.mary,
        meaningOfName: 'Beloved or Bitter (Miriam)',
        timeline: '1st Century BC/AD',
        traits: ['Faithfulness', 'Obedience', 'Strength', 'Devotion'],
        biography: [
            "Mary was a young Jewish woman from Nazareth who was chosen by God to bear His Son. Her response to the angel Gabriel, 'Let it be to me according to your word,' remains one of the greatest expressions of faith in history.",
            "She stood by Jesus throughout His life, from the manger in Bethlehem to the cross at Calvary. She was present at His first miracle and among the believers waiting for the Holy Spirit at Pentecost.",
            "Mary is revered for her humility and her willingness to submit to God's difficult and miraculous plan for her life."
        ]
    },
    {
        id: 'david',
        name: 'David',
        role: 'King of Israel',
        image: IMAGES.david,
        meaningOfName: 'Beloved',
        timeline: 'c. 1040 – 970 BC',
        traits: ['Courage', 'Repentance', 'Artistic', 'Leadership'],
        biography: [
            "Starting as a shepherd boy, David was anointed by the prophet Samuel to be the second king of Israel. He is most famous for defeating the giant Goliath with only a sling and a stone.",
            "David was a 'man after God's own heart,' yet his life was marked by both great triumphs and deep failures. He composed many of the Psalms, expressing a range of human emotions in relation to God.",
            "Despite his sins, David's legacy is one of deep repentance and trust in God's mercy. From his lineage, Jesus Christ was born."
        ]
    },
    {
        id: 'moses',
        name: 'Moses',
        role: 'The Lawgiver',
        image: IMAGES.moses,
        meaningOfName: 'Drawn Out',
        timeline: 'c. 14th–13th Century BC',
        traits: ['Humility', 'Perseverance', 'Justice', 'Intercession'],
        biography: [
            "Born a Hebrew but raised in Pharaoh's palace, Moses was chosen by God to lead the Israelites out of slavery in Egypt. Through him, God performed the plagues and parted the Red Sea.",
            "On Mount Sinai, Moses received the Ten Commandments. He guided the people through the wilderness for forty years, acting as a mediator between God and a difficult nation.",
            "Though he did not enter the Promised Land himself, Moses remains the foundational prophet of Israel, known for talking with God 'face to face' as a man speaks with his friend."
        ]
    },
    {
        id: 'paul',
        name: 'Paul',
        role: 'Apostle to the Gentiles',
        image: IMAGES.paul,
        meaningOfName: 'Small (Paulus)',
        timeline: 'c. 5 – 67 AD',
        traits: ['Zeal', 'Intellect', 'Endurance', 'Apostleship'],
        biography: [
            "Once a fierce persecutor of the early church known as Saul, he experienced a radical conversion on the road to Damascus. He became the most prolific missionary and theologian of the New Testament.",
            "Paul traveled extensively throughout the Roman Empire, establishing churches and writing letters that now form a large portion of the Bible. He preached that salvation is available to all through faith in Christ.",
            "Despite being imprisoned, beaten, and eventually martyred, Paul's zeal for the Gospel never wavered. His writings continue to shape Christian thought and doctrine today."
        ]
    }
  ],
  Romanian: [
    {
      id: 'jesus',
      name: 'Isus Hristos',
      role: 'Fiul lui Dumnezeu',
      image: IMAGES.jesus,
      meaningOfName: 'Domnul Mântuiește',
      timeline: 'c. 4 î.Hr. – 30 d.Hr.',
      traits: ['Dragoste', 'Smerenie', 'Jertfă', 'Autoritate'],
      biography: [
          "Isus este figura centrală a creștinismului, Fiul lui Dumnezeu și Mesia. Viața Sa, consemnată în Evanghelii, stă la baza Noului Testament.",
          "Născut în Betleem din Fecioara Maria, Isus și-a petrecut primii ani în Nazaret. La treizeci de ani, a început lucrarea publică, vestind Împărăția lui Dumnezeu.",
          "Misiunea Sa supremă a fost jertfa de Sine. A fost răstignit la Ierusalim, act prin care creștinii cred că a asigurat mântuirea umanității. A treia zi a înviat."
      ]
    },
    {
        id: 'peter',
        name: 'Petru',
        role: 'Stânca',
        image: IMAGES.peter,
        meaningOfName: 'Piatră (Petros)',
        timeline: 'decedat c. 64 d.Hr.',
        traits: ['Îndrăzneală', 'Pasiune', 'Conducere', 'Loialitate'],
        biography: [
            "Un pescar umil din Galileea, Petru a fost transformat în liderul apostolilor. Era cunoscut pentru temperamentul său înflăcărat.",
            "Deși s-a lepădat de Isus de trei ori, povestea lui Petru este una a restaurării. Isus l-a repus în slujbă pe țărmul mării.",
            "După Cincizecime, Petru a devenit vocea principală a bisericii primare din Ierusalim."
        ]
    },
    {
        id: 'mary',
        name: 'Maria',
        role: 'Mama lui Isus',
        image: IMAGES.mary,
        meaningOfName: 'Cea Iubită',
        timeline: 'Secolul I î.Hr./d.Hr.',
        traits: ['Credincioșie', 'Ascultare', 'Putere', 'Devotament'],
        biography: [
            "Maria a fost o tânără evreică din Nazaret, aleasă de Dumnezeu pentru a-L naște pe Fiul Său. Răspunsul ei către îngerul Gavriil rămâne o expresie supremă a credinței.",
            "A fost alături de Isus pe tot parcursul vieții Sale, de la ieslea din Betleem până la crucea de pe Golgota.",
            "Maria este venerată pentru smerenia ei și disponibilitatea de a se supune planului miraculos al lui Dumnezeu."
        ]
    },
    {
        id: 'david',
        name: 'David',
        role: 'Regele Israelului',
        image: IMAGES.david,
        meaningOfName: 'Cel Iubit',
        timeline: 'c. 1040 – 970 î.Hr.',
        traits: ['Curaj', 'Pocăință', 'Talent', 'Conducere'],
        biography: [
            "Începând ca păstor, David a fost uns de proorocul Samuel pentru a fi al doilea rege al Israelului. Este celebru pentru înfrângerea gigantului Goliat.",
            "David a fost un om 'după inima lui Dumnezeu', deși viața lui a fost marcată de mari succese dar și de eșecuri profunde. El a compus mulți dintre Psalmi.",
            "În ciuda păcatelor sale, moștenirea lui David este una de pocăință profundă. Din neamul său S-a născut Isus Hristos."
        ]
    },
    {
        id: 'moses',
        name: 'Moise',
        role: 'Dătătorul Legii',
        image: IMAGES.moses,
        meaningOfName: 'Scoas din Apă',
        timeline: 'Secolul XIV-XIII î.Hr.',
        traits: ['Smerenie', 'Perseverență', 'Dreptate', 'Mijlocire'],
        biography: [
            "Născut evreu dar crescut în palatul lui Faraon, Moise a fost ales de Dumnezeu pentru a-i scoate pe israeliți din robia Egiptului.",
            "Pe muntele Sinai, Moise a primit Cele Zece Porunci. El a călăuzit poporul prin pustie timp de patruzeci de ani.",
            "Deși nu a intrat personal în Țara Făgăduinței, Moise rămâne profetul fundamental al lui Israel, cunoscut pentru faptul că vorbea cu Dumnezeu 'față în față'."
        ]
    },
    {
        id: 'paul',
        name: 'Pavel',
        role: 'Apostolul Neamurilor',
        image: IMAGES.paul,
        meaningOfName: 'Cel Mic',
        timeline: 'c. 5 – 67 d.Hr.',
        traits: ['Râvnă', 'Intelect', 'Anduranță', 'Apostolat'],
        biography: [
            "Fost persecutor al bisericii sub numele de Saul, el a experimentat o convertire radicală pe drumul Damascului. A devenit cel mai prolific misionar al Noului Testament.",
            "Pavel a călătorit prin Imperiul Roman, înființând biserici și scriind scrisori care acum formează o mare parte din Biblie.",
            "În ciuda faptului că a fost întemnițat și martirizat, râvna sa pentru Evanghelie nu a scăzut niciodată."
        ]
    }
  ],
  German: [
    {
      id: 'jesus',
      name: 'Jesus Christus',
      role: 'Sohn Gottes',
      image: IMAGES.jesus,
      meaningOfName: 'Der Herr rettet',
      timeline: 'ca. 4 v. Chr. – 30 n. Chr.',
      traits: ['Liebe', 'Demut', 'Opfer', 'Autorität'],
      biography: [
          "Jesus ist die zentrale Figur des Christentums, der Sohn Gottes und der Messias. Sein Leben bildet das Fundament des Neuen Testaments.",
          "Geboren in Bethlehem, verbrachte er seine frühen Jahre in Nazareth. Mit dreißig begann er seinen Dienst und predigte über das Reich Gottes.",
          "Seine Mission war das Opfer am Kreuz. Am dritten Tag erstand er von den Toten auf und besiegte damit Sünde und Tod."
      ]
    },
    {
        id: 'peter',
        name: 'Petrus',
        role: 'Der Fels',
        image: IMAGES.peter,
        meaningOfName: 'Fels (Petros)',
        timeline: 'gestorben ca. 64 n. Chr.',
        traits: ['Kühnheit', 'Leidenschaft', 'Führung', 'Treue'],
        biography: [
            "Ein einfacher Fischer, der zum Anführer der Apostel wurde. Er war bekannt für sein feuriges Temperament und seine Liebe zu Jesus.",
            "Obwohl er Jesus dreimal verleugnete, ist seine Geschichte eine der Wiederherstellung.",
            "Nach Pfingsten wurde Petrus zur führenden Stimme der frühen Kirche in Jerusalem."
        ]
    },
    {
        id: 'mary',
        name: 'Maria',
        role: 'Mutter Jesu',
        image: IMAGES.mary,
        meaningOfName: 'Die Geliebte',
        timeline: '1. Jahrhundert v. Chr./n. Chr.',
        traits: ['Glaubenstreue', 'Gehorsam', 'Stärke', 'Hingabe'],
        biography: [
            "Maria war eine junge Jüdin aus Nazareth, die von Gott auserwählt wurde, seinen Sohn zu gebären. Ihre Antwort an Gabriel ist ein Vorbild des Glaubens.",
            "Sie stand Jesus sein ganzes Leben lang bei, von der Krippe in Bethlehem bis zum Kreuz auf Golgatha.",
            "Maria wird für ihre Demut und ihre Bereitschaft verehrt, sich Gottes Heilsplan zu fügen."
        ]
    },
    {
        id: 'david',
        name: 'David',
        role: 'König von Israel',
        image: IMAGES.david,
        meaningOfName: 'Der Geliebte',
        timeline: 'ca. 1040 – 970 v. Chr.',
        traits: ['Mut', 'Reue', 'Künstlerisch', 'Führung'],
        biography: [
            "Zuerst ein Hirtenjunge, wurde David von Samuel zum zweiten König von Israel gesalbt. Berühmt wurde er durch den Sieg über den Riesen Goliath.",
            "David war ein 'Mann nach dem Herzen Gottes', doch sein Leben war von großen Triumphen und tiefen Fehltritten geprägt. Er verfasste viele Psalmen.",
            "Sein Vermächtnis ist von tiefer Umkehr geprägt. Aus seinem Stammbaum wurde Jesus Christus geboren."
        ]
    },
    {
        id: 'moses',
        name: 'Mose',
        role: 'Der Gesetzgeber',
        image: IMAGES.moses,
        meaningOfName: 'Aus dem Wasser gezogen',
        timeline: 'ca. 14.–13. Jh. v. Chr.',
        traits: ['Demut', 'Ausdauer', 'Gerechtigkeit', 'Fürbitte'],
        biography: [
            "Mose wurde von Gott berufen, die Israeliten aus der Sklaverei in Ägypten zu führen. Durch ihn vollbrachte Gott Wunder wie die Teilung des Schilfmeers.",
            "Am Berg Sinai empfing Mose die Zehn Gebote. Er führte das Volk vierzig Jahre lang durch die Wüste.",
            "Obwohl er das Gelobte Land nicht selbst betrat, blieb er der bedeutendste Prophet Israels, der mit Gott 'Angesicht zu Angesicht' sprach."
        ]
    },
    {
        id: 'paul',
        name: 'Paulus',
        role: 'Apostel der Heiden',
        image: IMAGES.paul,
        meaningOfName: 'Der Kleine',
        timeline: 'ca. 5 – 67 n. Chr.',
        traits: ['Eifer', 'Intellekt', 'Ausdauer', 'Apostelamt'],
        biography: [
            "Einst ein Verfolger der Christen namens Saulus, erlebte er eine radikale Umkehr vor Damaskus. Er wurde zum bedeutendsten Missionar.",
            "Paulus reiste durch das Römische Reich, gründete Gemeinden und verfasste Briefe, die heute einen großen Teil der Bibel ausmachen.",
            "Trotz Gefangenschaft und Martyrium wankte sein Eifer für das Evangelium nie."
        ]
    }
  ]
};