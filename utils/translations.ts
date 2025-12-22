
export const translations: Record<string, any> = {
  English: {
    welcomeMessages: [
      "Welcome back, {name}. How can I help you find peace in the Word today? ✨",
      "Peace be with you, {name}. Is there a specific situation you'd like to find a verse for? 📖",
      "Hello {name}! I'm here to guide you through the scriptures. What's on your heart? 🌿"
    ],
    home: {
        goodMorning: "Good Morning",
        goodAfternoon: "Good Afternoon",
        goodEvening: "Good Evening",
        subtitle: "Find peace in His word today.",
        welcome: "Welcome back, {name}",
        dailyVerse: "Verse of the Day",
        readVerse: "Read Verse",
        streak: "Day Streak",
        jumpTo: "Library",
        chatTitle: "Ask Shepherd",
        chatDesc: "Get spiritual guidance",
        roleplayTitle: "Walk with Petrus",
        roleplayDesc: "First Century Roleplay",
        bibleTitle: "Read Bible",
        bibleDesc: "Explore the scriptures",
        prayerTitle: "Prayer Journal",
        prayerDesc: "Write & share prayers",
        quizTitle: "Bible Trivia",
        quizDesc: "Test your knowledge",
        friendsTitle: "Friends",
        friendsDesc: "Chat & Connect",
        favoritesTitle: "Favorites",
        favoritesSub: "Your Collection",
        favoritesDesc: "Your saved collection",
        feedback: "Share Feedback"
    },
    stories: {
        title: "AI Roleplay",
        subtitle: "Experience the First Century",
        disclaimer: "Petrus speaks as a witness of 2000 years ago. He refers to Jesus as the Master.",
        startRoleplay: "Enter the Encounter",
        newEncounter: "New Encounter",
        history: "Encounters",
        deleteEncounter: "End this encounter?"
    },
    dailyVerse: {
        title: "Daily Verse",
        copy: "Copy",
        copied: "Copied!",
        createImage: "Create Image"
    },
    login: {
        welcomeBack: "Welcome Back",
        signInText: "Sign in to your Shepherd account",
        signUpText: "Create a new account to sync your data",
        resetText: "Enter your email to reset password",
        emailPlaceholder: "Email Address",
        emailPlaceholderExample: "name@example.com",
        passwordPlaceholder: "Password",
        passwordPlaceholderExample: "••••••••",
        displayName: "Display Name",
        namePlaceholder: "How should we call you?",
        signInBtn: "Sign In",
        signUpBtn: "Create Account",
        sendReset: "Send Reset Link",
        forgotPassword: "Forgot password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        successCreated: "Account created! Please check your email to confirm.",
        errorTitle: "Authentication Error"
    },
    sidebar: {
        home: "Home",
        newChat: "New Conversation",
        history: "Recent Chats",
        noChats: "No conversations yet.",
        rename: "Rename",
        delete: "Delete",
        deleteConfirm: "Are you sure?",
        tooltips: {
            sanctuary: "Ambient Sounds",
            inbox: "Notifications",
            settings: "Settings",
            profile: "My Profile"
        }
    },
    common: { translate: "Translate", translated: "Translated", translating: "Translating...", original: "Show Original", loading: "Loading...", newChat: "New Chat" },
    chat: { subtitle: "Scripture Companion", placeholder: "Ask Shepherd for guidance...", regenerate: "Regenerate", retry: "Retry", paintMode: "Paint Mode", placeholderShort: "Ask Shepherd...", missingKeyTitle: "API Key Required", missingKeyDesc: "API Key needed.", setupKey: "Setup" },
    bible: { selectBook: "Select Book", chapter: "Chapter", oldTestament: "Old Testament", newTestament: "New Testament", searchBooks: "Search books...", loading: "Loading...", error: "Error.", highlight: "Highlight", colors: { yellow: "Yellow", green: "Green", blue: "Blue", pink: "Pink", remove: "Remove" }, save: "Save", read: "Read", prev: "Prev", next: "Next", audio: { play: "Listen", pause: "Pause" } },
    saved: { title: "Saved", empty: "Empty.", filterAll: "All", filterVerse: "Verses", filterChat: "Chat", filterPrayer: "Prayers", remove: "Remove", bibleVerse: "Verse", chatMessage: "AI", prayerItem: "Prayer", date: "Date" },
    prayer: { title: "Prayers", tabs: { journal: "Journal", community: "Wall" }, newPrayer: "New", placeholder: "On your heart?", markAnswered: "Answered", answered: "Answered", empty: "Empty.", active: "Active", privacy: { label: "Privacy", private: "Private", friends: "Friends", specific: "Specific", public: "Public", selectFriends: "Select", anonymous: "Anon", publicId: "ID" }, amen: "Amen" },
    sanctuary: { title: "Sanctuary", rain: "Rain", fire: "Fire", stream: "Stream", night: "Night", volume: "Volume" },
    quiz: { title: "Trivia", start: "Start", difficulty: "Difficulty", easy: "Easy", medium: "Medium", hard: "Hard", score: "Score", next: "Next", correct: "Correct!", incorrect: "Incorrect", explanation: "Explanation", loading: "Loading...", results: "Results", time: "Time", accuracy: "Accuracy", playAgain: "Again", home: "Home", mode: "Mode", question: "Question" },
    topics: { title: "Topics", anxiety: { label: "Anxiety", query: "Anxious help." }, love: { label: "Love", query: "About love." }, hope: { label: "Hope", query: "Need hope." }, sadness: { label: "Sadness", query: "Feeling sad." }, gratitude: { label: "Gratitude", query: "Be thankful." }, strength: { label: "Strength", query: "Be strong." }, joy: { label: "Joy", query: "Need joy." }, forgiveness: { label: "Forgiveness", query: "Forgive." } },
    settings: { title: "Settings", preferences: "Preferences", language: "Language", appearance: "Theme", light: "Light", dark: "Dark", winter: { title: "Winter", desc: "Snow", snow: "Snow", lights: "Lights", icicles: "Icicles" }, princess: { title: "Princess", desc: "Magic", hearts: "Hearts", aurora: "Aurora" }, account: "Account", loggedIn: "LoggedIn", signOut: "Sign Out", about: "About", aboutText: "Companion app.", displayName: "Name", bio: "Bio", noBio: "Empty." },
    social: { 
        title: "Social", 
        tabs: { inbox: "Inbox", friends: "Friends", add: "Add", me: "Me" }, 
        inbox: { title: "Inbox", requests: "Requests", noRequests: "None", updates: "Updates" }, 
        friends: { title: "Friends", loading: "Loading...", empty: "Empty.", streak: "Streak" }, 
        add: { title: "Add", yourId: "ID", shareText: "Share", enterId: "Enter ID", search: "Search" }, 
        profile: { title: "Profile", streak: "Streak", achievements: "Badges", locked: "Locked", about: "About", message: "Message", unfriend: "Remove", addFriend: "Add" }, 
        chat: { placeholder: "Message...", paintMode: "Paint" }, 
        status: { online: "Online", offline: "Offline", activeNow: "Active", lastSeen: "Last seen", ago: "ago" }, 
        updatesList: [
            { version: "1.8.0", date: "Today", title: "Eyewitness Restoration", changes: ["Petrus Persona complete rewrite (forbidden from citations/emojis)", "Premium UI effects restored for AI tools", "Library layout re-architected", "Bible fetch error handling improved"] },
            { version: "1.7.0", date: "14.12.2025", title: "New Dashboard", changes: ["Home page added", "Improved navigation", "Quick actions"] },
            { version: "1.6.0", date: "12.12.2025", title: "Bible Reader Update", changes: ["Fixed Romanian Bible loading", "Instant chapter switching", "Offline-available text"] },
            { version: "1.5.0", date: "11.12.2025", title: "Quiz & Achievements", changes: ["Bible Trivia mode", "Achievements for scores", "View friends streaks", "Progress tracking"] },
            { version: "1.4.0", date: "10.12.2025", title: "Graffiti Perfection", changes: ["Fixed save issues", "Smoother drawing", "Upload reliability"] },
            { version: "1.3.0", date: "09.12.2025", title: "Social Chat", changes: ["Real-time messaging", "Photo sharing", "Voice messages", "Online status"] },
            { version: "1.2.0", date: "09.12.2025", title: "Winter Update", changes: ["Winter mode added", "Improved visuals", "API fixes"] },
            { version: "1.1.0", date: "08.12.2025", title: "Bible Reader", changes: ["Full Bible reader", "Highlights", "Save verses"] },
            { version: "1.0.0", date: "08.12.2025", title: "Launch", changes: ["Shepherd AI Chat", "Supabase integration"] }
        ], 
        achievementList: {
            "perfect-easy": { title: "Bible Scholar", description: "Completed Easy Quiz with 100% accuracy!" },
            "perfect-medium": { title: "Faithful Disciple", description: "Completed Medium Quiz with 100% accuracy!" },
            "perfect-hard": { title: "Divine Theologian", description: "Completed Hard Quiz with 100% accuracy!" }
        } 
    },
    feedback: { title: "Feedback", desc: "Improve app.", type: "Type", bug: "Bug", feature: "Feature", suggestion: "Idea", other: "Other", subject: "Subject", subjectPlaceholder: "Title", message: "Message", messagePlaceholder: "Text", submit: "Send", success: "Sent!", error: "Error.", targetEmail: "andrinruegg732@gmail.com", requiredField: "Required", invalidEmail: "Invalid" },
    composer: {
        title: "Visual Composer",
        theme: "Theme",
        content: "Content",
        background: "Background",
        typography: "Typography",
        textColor: "Text Color",
        quickSelect: "Quick Select",
        selectPlaceholder: "Select a preset...",
        message: "Message",
        reference: "Reference",
        download: "Download Image",
        processing: "Processing...",
        securityWarning: "Download failed. Check connection.",
        themes: { midnight: "Midnight", sunset: "Sunset", forest: "Forest", paper: "Paper", clean: "Clean" },
        presets: [
            { text: "The Lord is my shepherd.", ref: "Psalm 23:1" },
            { text: "God is love.", ref: "1 John 4:8" }
        ]
    }
  },
  Romanian: {
    welcomeMessages: [
      "Bine ai revenit, {name}. Cum te pot ajuta să găsești pacea în Cuvânt astăzi? ✨",
      "Pacea să fie cu tine, {name}. Există un context anume pentru care cauți un verset? 📖",
      "Salut {name}! Sunt aici să te ghidez prin scripturi. Ce ai pe inimă? 🌿"
    ],
    home: {
        goodMorning: "Bună Dimineața",
        goodAfternoon: "Bună Ziua",
        goodEvening: "Bună Seara",
        subtitle: "Găsește pacea în cuvântul Lui astăzi.",
        welcome: "Bine ai revenit, {name}",
        dailyVerse: "Versetul Zilei",
        readVerse: "Citește Versetul",
        streak: "Serie",
        jumpTo: "Librărie",
        chatTitle: "Întreabă Păstorul",
        chatDesc: "Ghidare spirituală",
        roleplayTitle: "Mergi cu Petru",
        roleplayDesc: "Joc de rol istoric",
        bibleTitle: "Citește Biblia",
        bibleDesc: "Explorează scripturile",
        prayerTitle: "Rugăciune",
        prayerDesc: "Scrie & partajează",
        quizTitle: "Trivia Biblică",
        quizDesc: "Testează cunoștințele",
        friendsTitle: "Prieteni",
        friendsDesc: "Conectare",
        favoritesTitle: "Favorite",
        favoritesSub: "Colecția Ta",
        favoritesDesc: "Colecția ta salvată",
        feedback: "Feedback"
    },
    stories: {
        title: "AI Roleplay",
        subtitle: "Trăiește Secolul Întâi",
        disclaimer: "Petru vorbește ca un martor de acum 2000 de ani. Îl numește pe Isus Învățătorul.",
        startRoleplay: "Intră în Întâlnire",
        newEncounter: "Întâlnire Nouă",
        history: "Istoric",
        deleteEncounter: "Închei întâlnirea?"
    },
    dailyVerse: {
        title: "Versetul Zilei",
        copy: "Copiază",
        copied: "Copiat!",
        createImage: "Creează Imagine"
    },
    login: {
        welcomeBack: "Bine ai revenit",
        signInText: "Autentifică-te în contul Shepherd",
        signUpText: "Creează un cont nou pentru sincronizare",
        resetText: "Introdu email-ul pentru resetare",
        emailPlaceholder: "Adresă Email",
        passwordPlaceholder: "Parolă",
        displayName: "Nume Afișat",
        signInBtn: "Autentificare",
        signUpBtn: "Creează Cont",
        sendReset: "Trimite Link Resetare",
        forgotPassword: "Ai uitat parola?",
        noAccount: "Nu ai cont?",
        hasAccount: "Ai deja cont?"
    },
    sidebar: {
        home: "Acasă",
        newChat: "Conversație Nouă",
        history: "Istoric",
        noChats: "Nicio conversație.",
        rename: "Redenumire",
        delete: "Șterge",
        deleteConfirm: "Ești sigur?",
        tooltips: {
            sanctuary: "Sunete Ambientale",
            inbox: "Notificări",
            settings: "Setări",
            profile: "Profilul Meu"
        }
    },
    common: { translate: "Traduce", translated: "Tradus", translating: "Se traduce...", original: "Original", loading: "Se încarcă...", newChat: "Chat Nou" },
    chat: { subtitle: "Partener Scriptură", placeholder: "Întreabă Păstorul...", regenerate: "Regenerează", retry: "Reîncearcă", paintMode: "Mod Desen", placeholderShort: "Întreabă..." },
    bible: { selectBook: "Alege Cartea", chapter: "Capitol", oldTestament: "Vechiul Testament", newTestament: "Noul Testament", searchBooks: "Caută...", loading: "Se încarcă...", error: "Eroare.", highlight: "Evidențiază", colors: { yellow: "Galben", green: "Verde", blue: "Albastru", pink: "Roz", remove: "Șterge" }, save: "Salvează", read: "Citește", prev: "Înapoi", next: "Înainte", audio: { play: "Ascultă", pause: "Pauză" } },
    saved: { title: "Salvate", empty: "Gol.", filterAll: "Toate", filterVerse: "Versete", filterChat: "Chat", filterPrayer: "Rugăciuni", remove: "Șterge", bibleVerse: "Verset", chatMessage: "AI", prayerItem: "Rugăciune" },
    prayer: { title: "Rugăciuni", tabs: { journal: "Jurnal", community: "Zid" }, newPrayer: "Nou", placeholder: "Ce ai pe inimă?", markAnswered: "Răspuns", answered: "Răspuns", empty: "Gol.", active: "Active", privacy: { label: "Confidențialitate", private: "Privat", friends: "Prieteni", specific: "Specific", public: "Public", selectFriends: "Selectează", anonymous: "Anonim" }, amen: "Amin" },
    sanctuary: { title: "Sanctuar", rain: "Ploaie", fire: "Foc", stream: "Râu", volume: "Volum" },
    quiz: { title: "Trivia", start: "Start", difficulty: "Dificultate", easy: "Ușor", medium: "Mediu", hard: "Greu", score: "Scor", next: "Următorul", correct: "Corect!", incorrect: "Incorect", explanation: "Explicație", results: "Rezultate", time: "Timp", accuracy: "Acuratețe", playAgain: "Din nou", home: "Acasă", mode: "Mod", question: "Întrebare" },
    topics: { title: "Subiecte", anxiety: { label: "Anxietate", query: "Ajutor anxietate." }, love: { label: "Love", query: "Despre dragoste." }, hope: { label: "Speranță", query: "Am nevoie de speranță." }, sadness: { label: "Tristețe", query: "Sunt trist." }, gratitude: { label: "Recunoștință", query: "Mulțumire." }, strength: { label: "Putere", query: "Fii tare." }, joy: { label: "Bucurie", query: "Bucurie." }, forgiveness: { label: "Iertare", query: "Iertare." } },
    settings: { title: "Setări", preferences: "Preferințe", language: "Limbă", appearance: "Aspect", light: "Luminos", dark: "Întunecat", winter: { title: "Iarnă", desc: "Zăpadă", snow: "Zăpadă", lights: "Lumini", icicles: "Țurțuri" }, princess: { title: "Prințesă", desc: "Magic", hearts: "Inimi", aurora: "Aurora" }, account: "Cont", loggedIn: "Autentificat", signOut: "Deconectare", about: "Despre", aboutText: "Shepherd Companion.", displayName: "Nume", bio: "Bio", noBio: "Fără descriere." },
    social: { 
        title: "Social", 
        tabs: { inbox: "Mesaje", friends: "Prieteni", add: "Adaugă", me: "Eu" }, 
        inbox: { title: "Notificări", requests: "Cereri", noRequests: "Nicio cerere", updates: "Noutăți" }, 
        friends: { title: "Prieteni", loading: "Se încarcă...", empty: "Gol.", streak: "Serie" }, 
        add: { title: "Adaugă", yourId: "ID-ul tău", shareText: "Partajează", enterId: "Introdu ID", search: "Caută" }, 
        profile: { title: "Profil", streak: "Serie", achievements: "Insigne", locked: "Blocat", about: "Despre", message: "Mesaj", unfriend: "Șterge", addFriend: "Adaugă" }, 
        status: { online: "Online", offline: "Offline", activeNow: "Activ", lastSeen: "Văzut", ago: "în urmă" }, 
        updatesList: [
            { version: "1.8.0", date: "Azi", title: "Restaurare Divină", changes: ["Rescris persona lui Petru (fără citate/emoji)", "Restaurat efectele premium pentru unelte", "Reorganizat layout-ul Librăriei", "Îmbunătățit erorile de descărcare Biblie"] },
            { version: "1.7.0", date: "14.12.2025", title: "Tablou de Bord Nou", changes: ["Pagina principală adăugată", "Navigare îmbunătățită"] },
            { version: "1.6.0", date: "12.12.2025", title: "Update Bible Reader", changes: ["Rezolvat încărcarea Bibliei române", "Schimbare instantanee a capitolelor"] },
            { version: "1.5.0", date: "11.12.2025", title: "Quiz & Realizări", changes: ["Mod Trivia Biblică", "Insigne pentru scoruri"] },
            { version: "1.0.0", date: "08.12.2025", title: "Start", changes: ["Chat Shepherd AI", "Integrare Supabase"] }
        ], 
        achievementList: {
            "perfect-easy": { title: "Savant Biblic", description: "Test ușor finalizat cu 100%!" }
        } 
    },
    feedback: { title: "Feedback", desc: "Îmbunătățește aplicația.", type: "Type", bug: "Eroare", feature: "Funcție", suggestion: "Sugestie", other: "Altul", subject: "Subiect", subjectPlaceholder: "Titlu", message: "Mesaj", messagePlaceholder: "Text", submit: "Trimite", success: "Trimis!", error: "Eroare.", targetEmail: "andrinruegg732@gmail.com", requiredField: "Obligatoriu" },
    composer: {
        title: "Compozitor Vizual",
        theme: "Temă",
        content: "Conținut",
        background: "Fundal",
        typography: "Tipografie",
        textColor: "Culoare Text",
        quickSelect: "Selectare Rapidă",
        selectPlaceholder: "Alege un preset...",
        message: "Mesaj",
        reference: "Referință",
        download: "Descarcă Imaginea",
        processing: "Se procesează...",
        securityWarning: "Descărcare eșuată.",
        themes: { midnight: "Miezul Nopții", sunset: "Apus", forest: "Pădure", paper: "Hârtie", clean: "Curat" },
        presets: [{ text: "Domnul este Păstorul meu.", ref: "Psalmul 23:1" }]
    }
  },
  German: {
    welcomeMessages: [
      "Willkommen zurück, {name}. Wie kann ich dir helfen, heute Frieden im Wort zu finden? ✨",
      "Friede sei mit dir, {name}. Gibt es eine bestimmte Situation, für die du einen Vers suchst? 📖",
      "Hallo {name}! Ich bin hier, um dich durch die heiligen Schriften zu führen. Was liegt dir auf dem Herzen? 🌿"
    ],
    home: {
        goodMorning: "Guten Morgen",
        goodAfternoon: "Guten Tag",
        goodEvening: "Guten Abend",
        subtitle: "Finde Frieden in Seinem Wort.",
        welcome: "Willkommen, {name}",
        dailyVerse: "Tagesvers",
        readVerse: "Lesen",
        streak: "Serie",
        jumpTo: "Bibliothek",
        chatTitle: "Frag Hirte",
        chatDesc: "Geistliche Führung",
        roleplayTitle: "Mit Petrus gehen",
        roleplayDesc: "Historisches Rollenspiel",
        bibleTitle: "Bibel lesen",
        bibleDesc: "Die Schrift erkunden",
        prayerTitle: "Gebete",
        prayerDesc: "Schreiben & Teilen",
        quizTitle: "Trivia",
        quizDesc: "Wissen testen",
        friendsTitle: "Freunde",
        friendsDesc: "Verbinden",
        favoritesTitle: "Favoriten",
        favoritesSub: "Deine Sammlung",
        favoritesDesc: "Gespeichert",
        feedback: "Feedback"
    },
    stories: {
        title: "KI Rollenspiel",
        subtitle: "Erlebe das erste Jahrhundert",
        disclaimer: "Petrus spricht als Zeuge von vor 2000 Jahren. Er nennt Jesus den Meister.",
        startRoleplay: "Begegnung beginnen",
        newEncounter: "Neue Begegnung",
        history: "Verlauf",
        deleteEncounter: "Begegnung beenden?"
    },
    dailyVerse: {
        title: "Tagesvers",
        copy: "Kopieren",
        copied: "Kopiert!",
        createImage: "Bild erstellen"
    },
    login: {
        welcomeBack: "Willkommen zurück",
        signInText: "Melde dich bei Shepherd an",
        signUpText: "Erstelle ein Konto zum Synchronisieren",
        resetText: "Email zum Zurücksetzen eingeben",
        emailPlaceholder: "E-Mail-Adresse",
        passwordPlaceholder: "Passwort",
        displayName: "Anzeigename",
        signInBtn: "Anmelden",
        signUpBtn: "Konto erstellen",
        sendReset: "Link senden",
        forgotPassword: "Passwort vergessen?",
        noAccount: "Kein Konto?",
        hasAccount: "Bereits ein Konto?"
    },
    sidebar: {
        home: "Start",
        newChat: "Neuer Chat",
        history: "Verlauf",
        noChats: "Keine Chats vorhanden.",
        rename: "Umbenennen",
        delete: "Löschen",
        deleteConfirm: "Bist du sicher?",
        tooltips: {
            sanctuary: "Umgebungsgeräusche",
            inbox: "Benachrichtigungen",
            settings: "Einstellungen",
            profile: "Mein Profil"
        }
    },
    common: { translate: "Übersetzen", translated: "Übersetzt", translating: "Wird übersetzt...", original: "Original", loading: "Laden...", newChat: "Neuer Chat" },
    chat: { subtitle: "Schriftbegleiter", placeholder: "Frage den Hirten...", regenerate: "Neu generieren", retry: "Wiederholen", paintMode: "Malmodus", placeholderShort: "Fragen..." },
    bible: { selectBook: "Buch wählen", chapter: "Kapitel", oldTestament: "Altes Testament", newTestament: "Neues Testament", searchBooks: "Suchen...", loading: "Laden...", error: "Fehler.", highlight: "Markieren", colors: { yellow: "Gelb", green: "Grün", blue: "Blau", pink: "Rosa", remove: "Entfernen" }, save: "Speichern", read: "Lesen", prev: "Zurück", next: "Weiter", audio: { play: "Hören", pause: "Pause" } },
    saved: { title: "Gespeichert", empty: "Leer.", filterAll: "Alle", filterVerse: "Verse", filterChat: "Chat", filterPrayer: "Gebete", remove: "Löschen", bibleVerse: "Vers", chatMessage: "KI", prayerItem: "Gebet" },
    prayer: { title: "Gebete", tabs: { journal: "Journal", community: "Wand" }, newPrayer: "Neu", placeholder: "Was liegt dir am Herzen?", answered: "Beantwortet", empty: "Leer.", active: "Aktiv", privacy: { label: "Privatsphäre", private: "Privat", friends: "Freunde", specific: "Spezifisch", public: "Öffentlich", anonymous: "Anonym" }, amen: "Amen" },
    sanctuary: { title: "Heiligtum", rain: "Regen", fire: "Feuer", stream: "Bach", volume: "Lautstärke" },
    quiz: { title: "Quiz", start: "Start", difficulty: "Schwierigkeit", easy: "Einfach", medium: "Mittel", hard: "Schwer", score: "Punktzahl", next: "Weiter", correct: "Richtig!", incorrect: "Falsch", explanation: "Erklärung", results: "Ergebnisse", accuracy: "Genauigkeit", playAgain: "Nochmal", home: "Start", mode: "Modus", question: "Frage" },
    topics: { title: "Themen", anxiety: { label: "Angst", query: "Hilfe bei Angst." }, love: { label: "Liebe", query: "Über die Liebe." }, hope: { label: "Hoffnung", query: "Hoffnung." }, sadness: { label: "Trauer", query: "Bin trauerig." }, gratitude: { label: "Dankbarkeit", query: "Dankbarkeit." }, strength: { label: "Stärke", query: "Sei stark." }, joy: { label: "Freude", query: "Freude." }, forgiveness: { label: "Vergebung", query: "Vergebung." } },
    settings: { title: "Einstellungen", preferences: "Präferenzen", language: "Sprache", appearance: "Design", light: "Hell", dark: "Dunkel", winter: { title: "Winter", desc: "Schnee", snow: "Schnee", lights: "Lichter", icicles: "Eiszapfen" }, princess: { title: "Prinzessin", desc: "Magie", hearts: "Herzen", aurora: "Aurora" }, account: "Konto", loggedIn: "Angemeldet", signOut: "Abmelden", about: "Über", aboutText: "Shepherd Begleiter.", displayName: "Name", bio: "Bio", noBio: "Leer." },
    social: { 
        title: "Soziales", 
        tabs: { inbox: "Inbox", friends: "Freunde", add: "Hinzufügen", me: "Ich" }, 
        inbox: { title: "Benachrichtigungen", requests: "Anfragen", noRequests: "Keine Anfragen", updates: "Updates" }, 
        friends: { title: "Freunde", loading: "Laden...", empty: "Leer.", streak: "Serie" }, 
        add: { title: "Hinzufügen", yourId: "Deine ID", shareText: "Teilen", enterId: "ID eingeben", search: "Suchen" }, 
        profile: { title: "Profil", streak: "Serie", achievements: "Abzeichen", locked: "Gesperrt", about: "Über", message: "Nachricht", unfriend: "Löschen", addFriend: "Hinzufügen" }, 
        status: { online: "Online", offline: "Offline", activeNow: "Aktiv", lastSeen: "Zuletzt gesehen", ago: "vor" }, 
        updatesList: [
            { version: "1.8.0", date: "Heute", title: "Göttliche Wiederherstellung", changes: ["Petrus-Persona überarbeitet (keine Zitate/Emojis)", "Premium UI-Effekte wiederhergestellt", "Librärie-Layout verbessert", "Bibel-Ladefehler behoben"] },
            { version: "1.7.0", date: "14.12.2025", title: "Neues Dashboard", changes: ["Startseite hinzugefügt", "Verbesserte Navigation"] },
            { version: "1.6.0", date: "12.12.2025", title: "Bibel-Reader Update", changes: ["Laden der rumänischen Bibel behoben", "Sofortiger Kapitelwechsel", "Offline-verfügbarer Text"] },
            { version: "1.5.0", date: "11.12.2025", title: "Quiz & Erfolge", changes: ["Bibel Trivia Modus", "Erfolge für Punkte", "Freunde-Streaks ansehen", "Fortschrittstracking"] },
            { version: "1.0.0", date: "08.12.2025", title: "Start", changes: ["Shepherd KI Chat", "Supabase Integration"] }
        ], 
        achievementList: {
            "perfect-easy": { title: "Bibelgelehrter", description: "Einfaches Quiz zu 100 % abgeschlossen!" }
        } 
    },
    feedback: { title: "Feedback", desc: "App verbessern.", type: "Type", bug: "Fehler", feature: "Funktion", suggestion: "Vorschlag", other: "Sonstiges", subject: "Betreff", message: "Nachricht", submit: "Senden", success: "Gesendet!", error: "Fehler.", targetEmail: "andrinruegg732@gmail.com", requiredField: "Pflichtfeld" },
    composer: {
        title: "Bildgestalter",
        theme: "Design",
        content: "Inhalt",
        background: "Hintergrund",
        typography: "Schrift",
        textColor: "Textfarbe",
        quickSelect: "Schnellauswahl",
        selectPlaceholder: "Vorlage wählen...",
        message: "Nachricht",
        reference: "Referenz",
        download: "Bild speichern",
        processing: "Verarbeitung...",
        securityWarning: "Download fehlgeschlagen.",
        themes: { midnight: "Mitternacht", sunset: "Sonnenuntergang", forest: "Wald", paper: "Papier", clean: "Rein" },
        presets: [{ text: "Der Herr ist mein Hirte.", ref: "Psalm 23,1" }]
    }
  }
};
