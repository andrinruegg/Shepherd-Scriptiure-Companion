
export const translations: Record<string, any> = {
  English: {
    home: {
        goodMorning: "Good Morning",
        goodAfternoon: "Good Afternoon",
        goodEvening: "Good Evening",
        subtitle: "Find peace in His word today.",
        welcome: "Welcome back, {name}",
        dailyVerse: "Verse of the Day",
        readVerse: "Read Verse",
        streak: "Day Streak",
        jumpTo: "Jump to...",
        chatTitle: "Ask Shepherd",
        chatDesc: "Get spiritual guidance",
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
    feedback: {
        title: "Share Feedback",
        desc: "Help us make Shepherd better. Found a bug or have an idea?",
        type: "Feedback Type",
        bug: "Report a Bug",
        feature: "Feature Request",
        suggestion: "General Suggestion",
        other: "Other",
        subject: "Subject",
        subjectPlaceholder: "Summarize your feedback",
        message: "Message",
        messagePlaceholder: "Tell us more about your experience...",
        submit: "Send Feedback",
        success: "Thank you! Your feedback has been sent.",
        error: "Oops! Something went wrong. Please try again.",
        targetEmail: "Sent to: andrinruegg732@gmail.com",
        requiredField: "Please fill out this field",
        invalidEmail: "Please enter a valid email"
    },
    common: {
        translate: "Translate",
        translated: "Translated",
        translating: "Translating...",
        original: "Show Original",
        loading: "Loading...",
        newChat: "New Chat"
    },
    composer: {
        title: "Visual Composer",
        theme: "Theme",
        content: "Content",
        background: "Background",
        typography: "Typography",
        textColor: "Text Color",
        quickSelect: "Quick Select Verse",
        selectPlaceholder: "Choose a verse...",
        message: "Message",
        reference: "Reference / Author",
        download: "Download Image",
        processing: "Processing...",
        securityWarning: "Could not generate image. Browser security might be blocking the external image source.",
        themes: {
            midnight: "Midnight",
            sunset: "Dawn",
            forest: "Forest",
            paper: "Paper",
            clean: "Clean",
            mountains: "Peaks",
            mist: "Mist",
            valley: "Valley",
            canyon: "Canyon",
            desert: "Dunes",
            field: "Golden",
            ocean: "Ocean",
            waterfall: "Falls",
            rain: "Rain",
            coast: "Coast",
            stars: "Galaxy",
            aurora: "Aurora",
            clouds: "Cloudy",
            dusk: "Dusk",
            nebula: "Nebula",
            bloom: "Bloom",
            lavender: "Lavender",
            winter: "Winter",
            autumn: "Autumn",
            leaves: "Ferns",
            palm: "Leaves",
            cross: "Bible"
        },
        presets: [
            { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
            { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", ref: "Romans 8:28" },
            { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
            { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
            { text: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1" },
            { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", ref: "1 Corinthians 13:4" }
        ]
    },
    dailyVerse: {
        title: "Daily Scripture",
        copy: "Copy",
        copied: "Copied!",
        createImage: "Create Image"
    },
    welcomeMessages: [
      "Peace be with you, {name}. I am Shepherd. How can I guide you today?",
      "Hello, {name}. I'm here to explore God's Word with you.",
      "Greetings, {name}. Let's find some encouragement in the Bible.",
      "Hi {name}! I'm ready to search the Scriptures with you."
    ],
    login: {
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      signInText: "Sign in to access your spiritual journal.",
      signUpText: "Sign up to start saving your conversations.",
      emailPlaceholder: "Email address",
      emailPlaceholderExample: "name@example.com",
      passwordPlaceholder: "Password",
      passwordPlaceholderExample: "••••••••",
      namePlaceholder: "Your Name",
      displayName: "Display Name", 
      rememberMe: "Remember me",
      signInBtn: "Sign In",
      signUpBtn: "Sign Up",
      noAccount: "Don't have an account? Sign Up",
      hasAccount: "Already have an account? Sign In",
      errorMissing: "Please enter both email and password.",
      successCreated: "Account created! Please check your email to confirm your account.",
      forgotPassword: "Forgot password?",
      sendReset: "Send Reset Link",
      resetText: "Enter your email to receive a reset link.",
      setNewPassword: "Set New Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updatePassword: "Update Password",
      passwordUpdated: "Password Updated!",
      loggingOut: "Logging you out to sign in again..."
    },
    sidebar: {
      home: "Home",
      newChat: "New Conversation",
      dailyVerse: "Daily Verse",
      history: "History",
      noChats: "No saved conversations yet.",
      settings: "Settings",
      deleteConfirm: "Delete this chat?",
      rename: "Rename",
      delete: "Delete",
      tooltips: {
          inbox: "Notifications",
          sanctuary: "Sanctuary",
          profile: "Profile",
          settings: "Settings"
      },
      tabs: {
          home: "Home",
          chat: "Chat",
          bible: "Bible",
          saved: "Saved",
          prayer: "Prayers",
          quiz: "Trivia"
      },
      sanctuary: "Sanctuary"
    },
    chat: {
      subtitle: "Scripture Companion",
      placeholder: "Ask Shepherd for a verse, topic, or guidance...",
      regenerate: "Regenerate",
      retry: "Retry",
      paintMode: "Paint Mode",
      placeholderShort: "Ask Shepherd...",
      missingKeyTitle: "API Key Required",
      missingKeyDesc: "To chat with Shepherd, you need to provide a free Google Gemini API Key.",
      setupKey: "Setup API Key"
    },
    bible: {
        selectBook: "Select Book",
        chapter: "Chapter",
        oldTestament: "Old Testament",
        newTestament: "New Testament",
        searchBooks: "Search books...",
        loading: "Loading Scripture...",
        error: "Could not load chapter.",
        highlight: "Highlight",
        colors: {
            yellow: "Yellow",
            green: "Green",
            blue: "Blue",
            pink: "Pink",
            remove: "Remove Color"
        },
        save: "Save to Collection",
        read: "Read",
        prev: "Prev",
        next: "Next",
        audio: {
            play: "Listen",
            pause: "Pause"
        }
    },
    saved: {
        title: "Saved Collection",
        empty: "No saved items yet.",
        filterAll: "All",
        filterVerse: "Verses",
        filterChat: "Chat",
        filterPrayer: "Prayers",
        remove: "Remove",
        bibleVerse: "Bible Verse",
        chatMessage: "AI Guidance",
        prayerItem: "Prayer",
        date: "Date"
    },
    prayer: {
        title: "Prayer Journal",
        tabs: {
            journal: "My Journal",
            community: "Prayer Wall"
        },
        newPrayer: "New Prayer",
        placeholder: "What's on your heart?",
        markAnswered: "Mark Answered",
        answered: "Answered",
        empty: "No prayers recorded yet.",
        active: "Active",
        privacy: {
            label: "Visibility",
            private: "Only Me",
            friends: "Friends Only",
            specific: "Specific People",
            public: "Public Wall",
            selectFriends: "Select Friends",
            anonymous: "Anonymous",
            publicId: "Public ID"
        },
        amen: "Amen"
    },
    sanctuary: {
        title: "Sanctuary",
        rain: "Rain",
        fire: "Fire",
        stream: "Stream",
        night: "Night",
        volume: "Volume"
    },
    quiz: {
        title: "Bible Trivia",
        start: "Start Quiz",
        difficulty: "Select Difficulty",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        score: "Score",
        next: "Next Question",
        correct: "Correct!",
        incorrect: "Incorrect",
        explanation: "Explanation",
        loading: "Generating question...",
        results: "Results",
        time: "Time Taken",
        accuracy: "Accuracy",
        playAgain: "Play Again",
        home: "Home",
        mode: "Mode",
        question: "Question"
    },
    topics: {
      title: "Explore a Topic",
      anxiety: { label: "Anxiety", query: "I am feeling anxious. Please give me a comforting Bible verse about peace." },
      love: { label: "Love", query: "What does the Bible say about love? Give me a beautiful verse." },
      hope: { label: "Hope", query: "I need some hope today. Please share a scripture about hope and future." },
      sadness: { label: "Sadness", query: "I am feeling sad. Please provide a comforting verse for a heavy heart." },
      gratitude: { label: "Gratitude", query: "I want to be thankful. Give me a verse about gratitude." },
      strength: { label: "Strength", query: "I feel weak. Please share a Bible verse about God giving us strength." },
      joy: { label: "Joy", query: "I want to rejoice! Give me a joyful Bible verse." },
      forgiveness: { label: "Forgiveness", query: "What does the Bible say about forgiveness? Please give me a verse on this topic." },
    },
    settings: {
      title: "Settings",
      preferences: "Preferences",
      language: "System Language",
      translation: "Preferred Translation",
      translationHelp: "Shepherd will use this version for all scripture quotes.",
      appearance: "Appearance",
      light: "Light",
      dark: "Dark",
      
      winter: {
          title: "Winter Mode",
          desc: "Festive animations",
          snow: "Falling Snow",
          lights: "Christmas Lights",
          icicles: "Icicles"
      },
      princess: {
          title: "Princess Mode",
          desc: "Hearts, pink themes & magic",
          hearts: "Floating Hearts",
          aurora: "Magic Aurora"
      },

      account: "Account",
      loggedIn: "Logged in via Supabase",
      signOut: "Sign Out",
      about: "About",
      aboutText: "Shepherd Scripture Companion is dedicated to spreading God's word and providing spiritual encouragement.\n\nIt is designed to help believers grow closer to God through the power of Scripture and a community of faith.",
      displayName: "Display Name",
      bio: "Bio / Description",
      noBio: "No description yet.",
      apiKey: {
          title: "Unlimited Access",
          desc: "For unlimited high-speed messaging, you can provide your own free Google Gemini API Key.",
          shared: "Using Shared Key",
          custom: "Custom Key Active",
          add: "Add Key",
          change: "Change Key",
          howTo: "How to get a free API Key",
          step1: "Go to Google AI Studio.",
          step2: "Click the blue 'Create API Key' button.",
          step3: "Important: Select 'Create API key in new project'.",
          step4: "Note: Do not re-use the same project, or the limits will be shared!",
          step5: "Copy the key (starts with AIza...) and paste it above."
      }
    },
    social: {
        title: "Social & Updates",
        tabs: {
            inbox: "Inbox",
            friends: "Friends",
            add: "Add",
            me: "Me"
        },
        inbox: {
            title: "Notifications",
            requests: "Friend Requests",
            noRequests: "No pending requests",
            updates: "System Updates"
        },
        friends: {
            title: "My Friends",
            loading: "Loading friends...",
            empty: "You haven't added any friends yet.",
            streak: "Streak"
        },
        add: {
            title: "Add Friend",
            yourId: "Your Share ID",
            shareText: "Share this ID with friends so they can add you.",
            enterId: "Enter Friend's ID",
            search: "Search"
        },
        socialTitle: "Social",
        socialDesc: "Connect with others",
        profile: {
            title: "My Profile",
            streak: "Daily Streak",
            achievements: "Achievements",
            locked: "Locked",
            about: "About",
            message: "Message",
            unfriend: "Unfriend",
            addFriend: "Add Friend"
        },
        chat: {
            placeholder: "Message...",
            paintMode: "Paint Mode"
        },
        status: {
            online: "Online",
            offline: "Offline",
            activeNow: "Active now",
            lastSeen: "Last seen",
            ago: "ago"
        },
        updatesList: [
            { version: "1.7.0", date: "2025-12-14", title: "New Dashboard", changes: ["Added Home View", "Improved Navigation"] },
            { version: "1.6.0", date: "2025-12-12", title: "Bible Reader Upgrade", changes: ["Fixed Romanian Bible (Cornilescu) loading", "Instant chapter switching", "Offline-ready Bible text"] },
            { version: "1.5.0", date: "2025-12-11", title: "Quiz & Achievements", changes: ["Added Bible Trivia mode", "Earn achievements for perfect scores", "View friend's streaks and badges", "Global progress tracking"] },
            { version: "1.4.0", date: "2025-12-10", title: "Graffiti Perfection", changes: ["Fixed Graffiti Mode saving issues", "Smoother drawing experience", "Improved upload reliability"] },
            { version: "1.3.0", date: "2025-12-09", title: "Social Chat", changes: ["Real-time messaging with friends", "Photo sharing", "Voice messages", "Online Status & Read Receipts"] },
            { version: "1.2.0", date: "2025-12-09", title: "Winter Update", changes: ["Added festive Winter Mode", "Improved splash screen visuals", "Bug fixes for API connectivity"] },
            { version: "1.1.0", date: "2025-12-08", title: "Bible Reader", changes: ["Added full Bible reader", "Highlighting support", "Save verses to collection"] },
            { version: "1.0.0", date: "2025-12-08", title: "Initial Launch", changes: ["Shepherd AI Chat", "Supabase Integration"] }
        ],
        achievementList: {
            'perfect-easy': { title: "Bible Scholar", description: "Score 100% on Easy Quiz" },
            'perfect-medium': { title: "Disciple", description: "Score 100% on Medium Quiz" },
            'perfect-hard': { title: "Theologian", description: "Score 100% on Hard Quiz" }
        }
    },
    // Fix: Add missing stories translations for PersonaTab
    stories: {
        title: "Biblical Heroes",
        subtitle: "Converse with figures of faith",
        disclaimer: "Conversations are AI roleplay. Always refer to Scripture as the final authority.",
        startRoleplay: "Speak with them"
    }
  },
  Romanian: {
    home: {
        goodMorning: "Bună Dimineața",
        goodAfternoon: "Bună Ziua",
        goodEvening: "Bună Seara",
        subtitle: "Găsește pacea în cuvântul Lui astăzi.",
        welcome: "Bine ai revenit, {name}",
        dailyVerse: "Versetul Zilei",
        readVerse: "Citește Versetul",
        streak: "Serie",
        jumpTo: "Mergi la...",
        chatTitle: "Întreabă Păstorul",
        chatDesc: "Ghidare spirituală",
        bibleTitle: "Citește Biblia",
        bibleDesc: "Explorează scripturile",
        prayerTitle: "Jurnal Rugăciune",
        prayerDesc: "Scrie & partajează",
        quizTitle: "Trivia Biblică",
        quizDesc: "Testează cunoștințele",
        friendsTitle: "Prieteni",
        friendsDesc: "Chat & Conectare",
        favoritesTitle: "Favorite",
        favoritesSub: "Colecția Ta",
        favoritesDesc: "Colecția ta salvată",
        feedback: "Trimite Feedback"
    },
    feedback: {
        title: "Trimite Feedback",
        desc: "Ajută-ne să facem Shepherd mai bun. Ai găsit un bug sau ai o idee?",
        type: "Tip Feedback",
        bug: "Raportează un Bug",
        feature: "Sugestie Funcție",
        suggestion: "Sugestie Generală",
        other: "Altele",
        subject: "Subiect",
        subjectPlaceholder: "Rezumat feedback",
        message: "Mesaj",
        messagePlaceholder: "Spune-ne mai multe despre experiența ta...",
        submit: "Trimite Feedback",
        success: "Mulțumim! Feedback-ul tău a fost trimis.",
        error: "Hopa! Ceva n-a mers bine. Te rugăm să încerci din nou.",
        targetEmail: "Trimis către: andrinruegg732@gmail.com",
        requiredField: "Vă rugăm să completați acest câmp",
        invalidEmail: "Vă rugăm să introduceți un e-mail valid"
    },
    common: {
        translate: "Traduce",
        translated: "Tradus",
        translating: "Traducere...",
        original: "Arată Originalul",
        loading: "Se încarcă...",
        newChat: "Chat Nou"
    },
    composer: {
        title: "Compozitor Vizual",
        theme: "Temă",
        content: "Conținut",
        background: "Fundal",
        typography: "Tipografie",
        textColor: "Culoare Text",
        quickSelect: "Selectare Rapidă",
        selectPlaceholder: "Alege un verset...",
        message: "Mesaj",
        reference: "Referință / Autor",
        download: "Descarcă Imagine",
        processing: "Se procesează...",
        securityWarning: "Nu s-a putut genera imaginea. Setările de securitate ale browserului ar putea bloca sursa externă.",
        themes: {
            midnight: "Miezul Nopții",
            sunset: "Zori",
            forest: "Pădure",
            paper: "Hârtie",
            clean: "Curat",
            mountains: "Vârfuri",
            mist: "Ceață",
            valley: "Vale",
            canyon: "Canion",
            desert: "Dune",
            field: "Auriu",
            ocean: "Ocean",
            waterfall: "Cascadă",
            rain: "Ploaie",
            coast: "Coastă",
            stars: "Galaxie",
            aurora: "Auroră",
            clouds: "Noros",
            dusk: "Apus",
            nebula: "Nebuloasă",
            bloom: "Înflorire",
            lavender: "Lavandă",
            winter: "Iarnă",
            autumn: "Toamnă",
            leaves: "Ferigi",
            palm: "Frunze",
            cross: "Biblie"
        },
        presets: [
            { text: "Căci Eu ştiu gândurile pe care le am cu privire la voi, zice Domnul, gânduri de pace şi nu de nenorocire, ca să vă dau un viitor şi o nădejde.", ref: "Ieremia 29:11" },
            { text: "De altă parte, ştim că toate lucrurile lucrează împreună spre binele celor ce iubesc pe Dumnezeu.", ref: "Romani 8:28" },
            { text: "Pot totul în Hristos, care mă întăreşte.", ref: "Filipeni 4:13" },
            { text: "Încrede-te în Domnul din toată inima ta şi nu te bizui pe înţelepciunea ta!", ref: "Proverbe 3:5" },
            { text: "Domnul este Păstorul meu: nu voi duce lipsă de nimic.", ref: "Psalmul 23:1" },
            { text: "Dragostea este îndelung răbdătoare, este plină de bunătate; dragostea nu pizmuieşte; dragostea nu se laudă.", ref: "1 Corinteni 13:4" }
        ]
    },
    dailyVerse: {
        title: "Versetul Zilei",
        copy: "Copiază",
        copied: "Copiat!",
        createImage: "Creează Imagine"
    },
    welcomeMessages: [
      "Pacea fie cu tine, {name}. Sunt Păstorul. Cum te pot ghida astăzi?",
      "Salut, {name}. Sunt aici să explorăm Cuvântul lui Dumnezeu împreună.",
      "Te salut, {name}. Hai să găsim încurajare în Biblie.",
      "Bună {name}! Sunt gata să cercetez Scripturile cu tine."
    ],
    login: {
      welcomeBack: "Bine ai revenit",
      createAccount: "Creează Cont",
      signInText: "Autentifică-te pentru a accesa jurnalul tău spiritual.",
      signUpText: "Înregistrează-te pentru a salva conversațiile.",
      emailPlaceholder: "Adresă de email",
      emailPlaceholderExample: "nume@exemplu.com",
      passwordPlaceholder: "Parolă",
      passwordPlaceholderExample: "••••••••",
      namePlaceholder: "Numele Tău",
      displayName: "Nume Afișat",
      rememberMe: "Ține-mă minte",
      signInBtn: "Autentificare",
      signUpBtn: "Înregistrare",
      noAccount: "Nu ai cont? Înregistrează-te",
      hasAccount: "Ai deja cont? Autentifică-te",
      errorMissing: "Te rog introdu email și parolă.",
      successCreated: "Cont creat! Te rog verifică email-ul pentru confirmare.",
      forgotPassword: "Ai uitat parola?",
      sendReset: "Trimite Link Resetare",
      resetText: "Introdu email-ul pentru a primi link-ul de resetare.",
      setNewPassword: "Setează Parolă Nouă",
      newPassword: "Parolă Nouă",
      confirmPassword: "Confirmă Parola",
      updatePassword: "Actualizează Parola",
      passwordUpdated: "Parolă Actualizată!",
      loggingOut: "Te deconectăm pentru a te autentifica din nou..."
    },
    sidebar: {
      home: "Acasă",
      newChat: "Conversație Nouă",
      dailyVerse: "Versetul Zilei",
      history: "Istoric",
      noChats: "Nicio conversație salvată.",
      settings: "Setări",
      deleteConfirm: "Ștergi conversația?",
      rename: "Redenumire",
      delete: "Ștergere",
      tooltips: {
          inbox: "Notificări",
          sanctuary: "Sanctuar",
          profile: "Profil",
          settings: "Setări"
      },
      tabs: {
          home: "Acasă",
          chat: "Chat",
          bible: "Biblia",
          saved: "Salvate",
          prayer: "Rugăciuni",
          quiz: "Trivia"
      },
      sanctuary: "Sanctuar"
    },
    chat: {
      subtitle: "Partener Scriptural",
      placeholder: "Întreabă Păstorul despre un verset, subiect sau sfat...",
      regenerate: "Regenerează",
      retry: "Reîncearcă",
      paintMode: "Mod Pictură",
      placeholderShort: "Întreabă Păstorul...",
      missingKeyTitle: "Cheie API Necesară",
      missingKeyDesc: "Pentru a discuta cu Păstorul, trebuie să furnizezi o cheie gratuită Google Gemini API.",
      setupKey: "Setare Cheie API"
    },
    bible: {
        selectBook: "Alege Cartea",
        chapter: "Capitolul",
        oldTestament: "Vechiul Testament",
        newTestament: "Noul Testament",
        searchBooks: "Caută cărți...",
        loading: "Se încarcă Scriptura...",
        error: "Nu s-a putut încărca capitolul.",
        highlight: "Evidențiază",
        colors: {
            yellow: "Galben",
            green: "Verde",
            blue: "Albastru",
            pink: "Roz",
            remove: "Șterge Culoarea"
        },
        save: "Salvează în Colecție",
        read: "Citește",
        prev: "Înapoi",
        next: "Înainte",
        audio: {
            play: "Ascultă",
            pause: "Pauză"
        }
    },
    saved: {
        title: "Colecție Salvată",
        empty: "Niciun element salvat încă.",
        filterAll: "Toate",
        filterVerse: "Versete",
        filterChat: "Chat",
        filterPrayer: "Rugăciuni",
        remove: "Șterge",
        bibleVerse: "Verset Biblic",
        chatMessage: "Îndrumare AI",
        prayerItem: "Rugăciune",
        date: "Dată"
    },
    prayer: {
        title: "Jurnal de Rugăciune",
        tabs: {
            journal: "Jurnalul Meu",
            community: "Zidul Rugăciunii"
        },
        newPrayer: "Rugăciune Nouă",
        placeholder: "Ce ai pe inimă?",
        markAnswered: "Marchează ca Răspuns",
        answered: "Răspuns",
        empty: "Nicio rugăciune înregistrată.",
        active: "Active",
        privacy: {
            label: "Vizibilitate",
            private: "Doar Eu",
            friends: "Doar Prietenii",
            specific: "Anumite Persoane",
            public: "Public",
            selectFriends: "Alege Prieteni",
            anonymous: "Anonim",
            publicId: "ID Public"
        },
        amen: "Amin"
    },
    sanctuary: {
        title: "Sanctuar",
        rain: "Ploaie",
        fire: "Foc",
        stream: "Pârâu",
        night: "Noapte",
        volume: "Volum"
    },
    quiz: {
        title: "Trivia Biblică",
        start: "Începe Quiz",
        difficulty: "Alege Dificultatea",
        easy: "Ușor",
        medium: "Mediu",
        hard: "Greu",
        score: "Scor",
        next: "Următoarea Întrebare",
        correct: "Corect!",
        incorrect: "Incorect",
        explanation: "Explicație",
        loading: "Se generează întrebarea...",
        results: "Rezultate",
        time: "Timp",
        accuracy: "Precizie",
        playAgain: "Joacă din nou",
        home: "Acasă",
        mode: "Mod",
        question: "Întrebare"
    },
    topics: {
      title: "Explorează un Subiect",
      anxiety: { label: "Anxietate", query: "Mă simt anxios. Te rog dă-mi un verset biblic liniștitor despre pace." },
      love: { label: "Dragoste", query: "Ce spune Biblia despre dragoste? Dă-mi un verset frumos." },
      hope: { label: "Speranță", query: "Am nevoie de speranță azi. Te rog împărtășește o scriptură despre viitor." },
      sadness: { label: "Tristețe", query: "Mă simt trist. Te rog oferă-mi un verset de mângâiere pentru o inimă grea." },
      gratitude: { label: "Recunoștință", query: "Vreau să fiu recunoscător. Dă-mi un verset despre mulțumire." },
      strength: { label: "Putere", query: "Mă simt slab. Te rog împărtășește un verset despre puterea de la Dumnezeu." },
      joy: { label: "Bucurie", query: "Vreau să mă bucur! Dă-mi un verset biblic plin de bucurie." },
      forgiveness: { label: "Iertare", query: "Ce spune Biblia despre iertare? Dă-mi un verset pe acest subiect." },
    },
    settings: {
      title: "Setări",
      preferences: "Preferințe",
      language: "Limbă Sistem",
      translation: "Traducere Preferată",
      translationHelp: "Păstorul va folosi această versiune pentru citate.",
      appearance: "Aspect",
      light: "Luminos",
      dark: "Întunecat",
      
      winter: {
          title: "Mod Iarnă",
          desc: "Animații festive",
          snow: "Ninsoare",
          lights: "Luminițe",
          icicles: "Țurțuri"
      },
      princess: {
          title: "Mod Prințesă",
          desc: "Inimi, roz și magie",
          hearts: "Inimi Plutitoare",
          aurora: "Auroră Magică"
      },

      account: "Cont",
      loggedIn: "Autentificat prin Supabase",
      signOut: "Deconectare",
      about: "Despre",
      aboutText: "Shepherd Scripture Companion este dedicat răspândirii cuvântului lui Dumnezeu și oferirii de încurajare spirituală.\n\nEste conceput pentru a ajuta credincioșii să se apropie de Dumnezeu prin puterea Scripturii și o comunitate de credință.",
      displayName: "Nume Afișat",
      bio: "Bio / Descriere",
      noBio: "Nicio descriere.",
      apiKey: {
          title: "Acces Nelimitat",
          desc: "Pentru mesaje nelimitate de mare viteză, poți furniza propria cheie gratuită Google Gemini API.",
          shared: "Folosind Cheie Partajată",
          custom: "Cheie Personală Activă",
          add: "Adaugă Cheie",
          change: "Schimbă Cheia",
          howTo: "Cum să obții o cheie API gratuită",
          step1: "Mergi la Google AI Studio.",
          step2: "Apasă butonul albastru 'Create API Key'.",
          step3: "Important: Selectează 'Create API key in new project'.",
          step4: "Notă: Nu refolosi același proiect, altfel limitele vor fi partajate!",
          step5: "Copiază cheia (începe cu AIza...) și lipește-o mai sus."
      }
    },
    social: {
        title: "Social & Noutăți",
        tabs: {
            inbox: "Inbox",
            friends: "Prieteni",
            add: "Adaugă",
            me: "Eu"
        },
        inbox: {
            title: "Notificări",
            requests: "Cereri de Prietenie",
            noRequests: "Nicio cerere în așteptare",
            updates: "Actualizări Sistem"
        },
        friends: {
            title: "Prieteni",
            loading: "Se încarcă prietenii...",
            empty: "Nu ai adăugat niciun prieten încă.",
            streak: "Serie"
        },
        add: {
            title: "Adaugă Prieten",
            yourId: "ID-ul Tău de Partajare",
            shareText: "Distribuie acest ID prietenilor pentru a te adăuga.",
            enterId: "Introdu ID Prieten",
            search: "Caută"
        },
        socialTitle: "Social",
        socialDesc: "Conectează-te cu alții",
        profile: {
            title: "Profilul Meu",
            streak: "Serie",
            achievements: "Realizări",
            locked: "Blocat",
            about: "Despre",
            message: "Mesaj",
            unfriend: "Șterge",
            addFriend: "Adaugă Prieten"
        },
        chat: {
            placeholder: "Mesaj...",
            paintMode: "Paint Mode"
        },
        status: {
            online: "Online",
            offline: "Offline",
            activeNow: "Activ acum",
            lastSeen: "Văzut ultima dată",
            ago: "în urmă"
        },
        updatesList: [
            { version: "1.7.0", date: "14-12-2025", title: "Tablou de bord nou", changes: ["Adăugat ecran principal", "Navigație îmbunătățită"] },
            { version: "1.6.0", date: "12-12-2025", title: "Actualizare Biblie", changes: ["S-a reparat încărcarea Bibliei Cornilescu", "Schimbare instantanee a capitolelor", "Text disponibil offline"] },
            { version: "1.5.0", date: "11-12-2025", title: "Quiz & Realizări", changes: ["Mod Trivia Biblică", "Câștigă realizări", "Vezi seriile prietenilor", "Urmărire progres"] },
            { version: "1.4.0", date: "10-12-2025", title: "Perfecțiune Graffiti", changes: ["Probleme de salvare rezolvate", "Experiență de desen mai fluidă", "Fiabilitate upload"] },
            { version: "1.3.0", date: "09-12-2025", title: "Chat Social", changes: ["Mesaje în timp real", "Partajare foto", "Mesaje vocale", "Status Online"] },
            { version: "1.2.0", date: "09-12-2025", title: "Actualizare Iarnă", changes: ["Mod Iarnă adăugat", "Vizualuri îmbunătățite", "Reparații API"] },
            { version: "1.1.0", date: "08-12-2025", title: "Cititor Biblie", changes: ["Cititor complet", "Suport evidențiere", "Salvare versete"] },
            { version: "1.0.0", date: "08-12-2025", title: "Lansare Inițială", changes: ["Shepherd AI Chat", "Integrare Supabase"] }
        ],
        achievementList: {
            'perfect-easy': { title: "Erudit Biblic", description: "Obține 100% la modul Ușor" },
            'perfect-medium': { title: "Ucenic", description: "Obține 100% la modul Mediu" },
            'perfect-hard': { title: "Teolog", description: "Obține 100% la modul Greu" }
        }
    },
    // Fix: Add missing stories translations for PersonaTab (Romanian)
    stories: {
        title: "Eroi Biblici",
        subtitle: "Conversați cu figuri ale credinței",
        disclaimer: "Conversațiile sunt joc de rol AI. Consultați întotdeauna Scriptura ca autoritate finală.",
        startRoleplay: "Vorbește cu ei"
    }
  },
  German: {
    home: {
        goodMorning: "Guten Morgen",
        goodAfternoon: "Guten Tag",
        goodEvening: "Guten Abend",
        subtitle: "Finde heute Frieden in Seinem Wort.",
        welcome: "Willkommen zurück, {name}",
        dailyVerse: "Vers des Tages",
        readVerse: "Vers lesen",
        streak: "Tages-Serie",
        jumpTo: "Springe zu...",
        chatTitle: "Frag Hirte",
        chatDesc: "Erhalte geistliche Führung",
        bibleTitle: "Bibel lesen",
        bibleDesc: "Erkunde die Schrift",
        prayerTitle: "Gebetstagebuch",
        prayerDesc: "Schreiben & teilen",
        quizTitle: "Bibel Trivia",
        quizDesc: "Teste dein Wissen",
        friendsTitle: "Freunde",
        friendsDesc: "Chatten & Verbinden",
        favoritesTitle: "Favoriten",
        favoritesSub: "Deine Sammlung",
        favoritesDesc: "Deine Sammlung",
        feedback: "Feedback teilen"
    },
    feedback: {
        title: "Feedback teilen",
        desc: "Helfen Sie uns, Shepherd besser zu machen. Bug gefunden oder eine Idee?",
        type: "Feedback-Typ",
        bug: "Fehler melden",
        feature: "Funktionswunsch",
        suggestion: "Allgemeiner Vorschlag",
        other: "Sonstiges",
        subject: "Betreff",
        subjectPlaceholder: "Feedback zusammenfassen",
        message: "Nachricht",
        messagePlaceholder: "Erzähle uns mehr über deine Erfahrung...",
        submit: "Feedback senden",
        success: "Danke! Ihr Feedback wurde gesendet.",
        error: "Hoppla! Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
        targetEmail: "Gesendet an: andrinruegg732@gmail.com",
        requiredField: "Bitte füllen Sie dieses Feld aus",
        invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein"
    },
    common: {
        translate: "Übersetzen",
        translated: "Übersetzt",
        translating: "Übersetzen...",
        original: "Original anzeigen",
        loading: "Lädt...",
        newChat: "Neuer Chat"
    },
    composer: {
        title: "Visueller Komponist",
        theme: "Thema",
        content: "Inhalt",
        background: "Hintergrund",
        typography: "Typografie",
        textColor: "Textfarbe",
        quickSelect: "Schnellauswahl",
        selectPlaceholder: "Wähle einen Vers...",
        message: "Nachricht",
        reference: "Referenz / Autor",
        download: "Bild herunterladen",
        processing: "Verarbeite...",
        securityWarning: "Bild konnte nicht erstellt werden. Browser-Sicherheit blockiert möglicherweise die externe Bildquelle.",
        themes: {
            midnight: "Mitternacht",
            sunset: "Morgendämmerung",
            forest: "Wald",
            paper: "Papier",
            clean: "Sauber",
            mountains: "Gipfel",
            mist: "Nebel",
            valley: "Tal",
            canyon: "Schlucht",
            desert: "Dünen",
            field: "Golden",
            ocean: "Ozean",
            waterfall: "Wasserfall",
            rain: "Regen",
            coast: "Küste",
            stars: "Galaxie",
            aurora: "Aurora",
            clouds: "Bewölkt",
            dusk: "Dämmerung",
            nebula: "Nebel",
            bloom: "Blüte",
            lavender: "Lavendel",
            winter: "Winter",
            autumn: "Herbst",
            leaves: "Farne",
            palm: "Blätter",
            cross: "Bibel"
        },
        presets: [
            { text: "Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich gebe Zukunft und Hoffnung.", ref: "Jeremia 29,11" },
            { text: "Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen.", ref: "Römer 8,28" },
            { text: "Ich vermag alles durch den, der mich mächtig macht.", ref: "Philipper 4,13" },
            { text: "Verlass dich auf den HERRN von ganzem Herzen, und verlass dich nicht auf deinen Verstand.", ref: "Sprüche 3,5" },
            { text: "Der HERR ist mein Hirte, mir wird nichts mangeln.", ref: "Psalm 23,1" },
            { text: "Die Liebe ist langmütig und freundlich, die Liebe eifert nicht, die Liebe treibt nicht Mutwillen.", ref: "1. Korinther 13,4" }
        ]
    },
    dailyVerse: {
        title: "Tagesvers",
        copy: "Kopieren",
        copied: "Kopiert!",
        createImage: "Bild erstellen"
    },
    welcomeMessages: [
      "Friede sei mit dir, {name}. Ich bin Hirte. Wie kann ich dich heute führen?",
      "Hallo, {name}. Ich bin hier, um Gottes Wort mit dir zu erkunden.",
      "Grüße, {name}. Lass uns Ermutigung in der Bibel finden.",
      "Hi {name}! Ich bin bereit, die Schriften mit dir zu durchsuchen."
    ],
    login: {
      welcomeBack: "Willkommen zurück",
      createAccount: "Konto erstellen",
      signInText: "Melde dich an, um auf dein geistliches Tagebuch zuzugreifen.",
      signUpText: "Registriere dich, um deine Gespräche zu speichern.",
      emailPlaceholder: "E-Mail-Adresse",
      emailPlaceholderExample: "name@beispiel.de",
      passwordPlaceholder: "Passwort",
      passwordPlaceholderExample: "••••••••",
      namePlaceholder: "Dein Name",
      displayName: "Anzeigename",
      rememberMe: "Angemeldet bleiben",
      signInBtn: "Anmelden",
      signUpBtn: "Registrieren",
      noAccount: "Kein Konto? Registrieren",
      hasAccount: "Bereits ein Konto? Anmelden",
      errorMissing: "Bitte gib E-Mail und Passwort ein.",
      successCreated: "Konto erstellt! Bitte überprüfe deine E-Mail zur Bestätigung.",
      forgotPassword: "Passwort vergessen?",
      sendReset: "Reset-Link senden",
      resetText: "Gib deine E-Mail ein, um einen Reset-Link zu erhalten.",
      setNewPassword: "Neues Passwort setzen",
      newPassword: "Neues Passwort",
      confirmPassword: "Passwort bestätigen",
      updatePassword: "Passwort aktualisieren",
      passwordUpdated: "Passwort aktualisiert!",
      loggingOut: "Du wirst abgemeldet, um dich neu anzumelden..."
    },
    sidebar: {
      home: "Startseite",
      newChat: "Neue Unterhaltung",
      dailyVerse: "Tagesvers",
      history: "Verlauf",
      noChats: "Noch keine gespeicherten Unterhaltungen.",
      settings: "Einstellungen",
      deleteConfirm: "Chat löschen?",
      rename: "Umbenennen",
      delete: "Löschen",
      tooltips: {
          inbox: "Benachrichtigungen",
          sanctuary: "Ruheort",
          profile: "Profil",
          settings: "Einstellungen"
      },
      tabs: {
          home: "Startseite",
          chat: "Chat",
          bible: "Bibel",
          saved: "Gespeichert",
          prayer: "Gebete",
          quiz: "Trivia"
      },
      sanctuary: "Ruheort"
    },
    chat: {
      subtitle: "Schriftbegleiter",
      placeholder: "Frag Hirte nach einem Vers, Thema oder Rat...",
      regenerate: "Neu generieren",
      retry: "Wiederholen",
      paintMode: "Malmodus",
      placeholderShort: "Frag Hirte...",
      missingKeyTitle: "API-Schlüssel erforderlich",
      missingKeyDesc: "Um mit Hirte zu chatten, musst du einen kostenlosen Google Gemini API-Schlüssel angeben.",
      setupKey: "API-Schlüssel einrichten"
    },
    bible: {
        selectBook: "Buch wählen",
        chapter: "Kapitel",
        oldTestament: "Altes Testament",
        newTestament: "Neues Testament",
        searchBooks: "Bücher suchen...",
        loading: "Schrift wird geladen...",
        error: "Kapitel konnte nicht geladen werden.",
        highlight: "Markieren",
        colors: {
            yellow: "Gelb",
            green: "Grün",
            blue: "Blau",
            pink: "Pink",
            remove: "Farbe entfernen"
        },
        save: "In Sammlung speichern",
        read: "Lesen",
        prev: "Zurück",
        next: "Weiter",
        audio: {
            play: "Anhören",
            pause: "Pause"
        }
    },
    saved: {
        title: "Gespeicherte Sammlung",
        empty: "Noch keine Elemente gespeichert.",
        filterAll: "Alle",
        filterVerse: "Verse",
        filterChat: "Chat",
        filterPrayer: "Gebete",
        remove: "Entfernen",
        bibleVerse: "Bibelvers",
        chatMessage: "KI-Führung",
        prayerItem: "Gebet",
        date: "Datum"
    },
    prayer: {
        title: "Gebetstagebuch",
        tabs: {
            journal: "Mein Tagebuch",
            community: "Gebetswand"
        },
        newPrayer: "Neues Gebet",
        placeholder: "Was liegt dir auf dem Herzen?",
        markAnswered: "Als erhört markieren",
        answered: "Erhört",
        empty: "Noch keine Gebete aufgezeichnet.",
        active: "Aktiv",
        privacy: {
            label: "Sichtbarkeit",
            private: "Nur Ich",
            friends: "Nur Freunde",
            specific: "Bestimmte Personen",
            public: "Öffentlich",
            selectFriends: "Freunde wählen",
            anonymous: "Anonym",
            publicId: "Öffentliche ID"
        },
        amen: "Amen"
    },
    sanctuary: {
        title: "Ruheort",
        rain: "Regen",
        fire: "Feuer",
        stream: "Bach",
        night: "Nacht",
        volume: "Lautstärke"
    },
    quiz: {
        title: "Bibel Trivia",
        start: "Quiz starten",
        difficulty: "Schwierigkeit wählen",
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
        score: "Punktestand",
        next: "Nächste Frage",
        correct: "Richtig!",
        incorrect: "Falsch",
        explanation: "Erklärung",
        loading: "Frage wird generiert...",
        results: "Ergebnisse",
        time: "Zeit",
        accuracy: "Genauigkeit",
        playAgain: "Nochmal spielen",
        home: "Startseite",
        mode: "Modus",
        question: "Frage"
    },
    topics: {
      title: "Erkunde ein Thema",
      anxiety: { label: "Angst", query: "Ich fühle mich ängstlich. Bitte gib mir einen tröstenden Bibelvers über Frieden." },
      love: { label: "Liebe", query: "Was sagt die Bibel über Liebe? Geben Sie mir einen schönen Vers." },
      hope: { label: "Hoffnung", query: "Ich brauche heute Hoffnung. Bitte teile eine Schriftstelle über Zukunft." },
      sadness: { label: "Traurigkeit", query: "Ich bin traurig. Bitte gib mir einen Vers des Trostes für ein schweres Herz." },
      gratitude: { label: "Dankbarkeit", query: "Ich möchte dankbar sein. Gib mir einen Vers über Dankbarkeit." },
      strength: { label: "Stärke", query: "Ich fühle mich schwach. Bitte teile einen Vers über die Kraft von Gott." },
      joy: { label: "Freude", query: "Ich möchte mich freuen! Geben Sie mir einen freudigen Bibelvers." },
      forgiveness: { label: "Vergebung", query: "Was sagt die Bibel über Vergebung? Gib mir einen Vers zu diesem Thema." },
    },
    settings: {
      title: "Einstellungen",
      preferences: "Präferenzen",
      language: "Systemsprache",
      translation: "Bevorzugte Übersetzung",
      translationHelp: "Hirte wird diese Version für Zitate verwenden.",
      appearance: "Aussehen",
      light: "Hell",
      dark: "Dunkel",
      
      winter: {
          title: "Wintermodus",
          desc: "Festliche Animationen",
          snow: "Schnee",
          lights: "Lichterketten",
          icicles: "Eiszapfen"
      },
      princess: {
          title: "Prinzessinnen-Modus",
          desc: "Herzen, Pink & Magie",
          hearts: "Schwebende Herzen",
          aurora: "Magische Aurora"
      },

      account: "Konto",
      loggedIn: "Eingeloggt über Supabase",
      signOut: "Abmelden",
      about: "Über",
      aboutText: "Shepherd Scripture Companion widmet sich der Verbreitung von Gottes Wort und der Bereitstellung geistlicher Ermutigung.\n\nEs ist darauf ausgelegt, Gläubigen zu helfen, durch die Kraft der Schrift und eine Gemeinschaft des Glaubens Gott näher zu kommen.",
      displayName: "Anzeigename",
      bio: "Bio / Beschreibung",
      noBio: "Noch keine Beschreibung.",
      apiKey: {
          title: "Unbegrenzter Zugang",
          desc: "Für unbegrenzte Hochgeschwindigkeits-Nachrichten kannst du deinen eigenen kostenlosen Google Gemini API-Schlüssel hinzufügen.",
          shared: "Geteilten Schlüssel nutzen",
          custom: "Eigener Schlüssel aktiv",
          add: "Schlüssel hinzufügen",
          change: "Schlüssel ändern",
          howTo: "Wie man einen kostenlosen API-Schlüssel erhält",
          step1: "Gehe zu Google AI Studio.",
          step2: "Klicke den blauen 'Create API Key' Button.",
          step3: "Wichtig: Wähle 'Create API key in new project'.",
          step4: "Hinweis: Verwende nicht dasselbe Projekt erneut, sonst werden die Limits geteilt!",
          step5: "Kopiere den Schlüssel (beginnt mit AIza...) und füge ihn oben ein."
      }
    },
    social: {
        title: "Soziales & Updates",
        tabs: {
            inbox: "Posteingang",
            friends: "Freunde",
            add: "Hinzufügen",
            me: "Ich"
        },
        inbox: {
            title: "Benachrichtigungen",
            requests: "Freundschaftsanfragen",
            noRequests: "Keine offenen Anfragen",
            updates: "System-Updates"
        },
        friends: {
            title: "Meine Freunde",
            loading: "Lade Freunde...",
            empty: "Du hast noch keine Freunde hinzugefügt.",
            streak: "Serie"
        },
        add: {
            title: "Freund hinzufügen",
            yourId: "Deine Share-ID",
            shareText: "Teile diese ID mit Freunden, damit sie dich hinzufügen können.",
            enterId: "Freund-ID eingeben",
            search: "Suchen"
        },
        socialTitle: "Soziales",
        socialDesc: "Vernetze dich mit anderen",
        profile: {
            title: "Mein Profil",
            streak: "Tages-Serie",
            achievements: "Erfolge",
            locked: "Gesperrt",
            about: "Über",
            message: "Nachricht",
            unfriend: "Entfernen",
            addFriend: "Freund hinzufügen"
        },
        chat: {
            placeholder: "Nachricht...",
            paintMode: "Malmodus"
        },
        status: {
            online: "Online",
            offline: "Offline",
            activeNow: "Jetzt aktiv",
            lastSeen: "Zuletzt gesehen",
            ago: "vor"
        },
        updatesList: [
            { version: "1.7.0", date: "14.12.2025", title: "Neues Dashboard", changes: ["Startseite hinzugefügt", "Verbesserte Navigation"] },
            { version: "1.6.0", date: "12.12.2025", title: "Bibel-Reader Update", changes: ["Laden der rumänischen Bibel behoben", "Sofortiger Kapitelwechsel", "Offline-verfügbarer Text"] },
            { version: "1.5.0", date: "11.12.2025", title: "Quiz & Erfolge", changes: ["Bibel Trivia Modus", "Erfolge für Punkte", "Freunde-Streaks ansehen", "Fortschrittstracking"] },
            { version: "1.4.0", date: "10-12-2025", title: "Graffiti Perfektion", changes: ["Speicherprobleme behoben", "Weicheres Zeichnen", "Upload Zuverlässigkeit"] },
            { version: "1.3.0", date: "09.12.2025", title: "Sozialer Chat", changes: ["Echtzeit-Nachrichten", "Fotos teilen", "Sprachnachrichten", "Online Status"] },
            { version: "1.2.0", date: "09.12.2025", title: "Winter Update", changes: ["Wintermodus hinzugefügt", "Verbesserte Visuals", "API Fixes"] },
            { version: "1.1.0", date: "08.12.2025", title: "Bibel-Reader", changes: ["Vollständiger Bibel-Reader", "Markierungen", "Verse speichern"] },
            { version: "1.0.0", date: "08.12.2025", title: "Start", changes: ["Shepherd KI Chat", "Integrare Supabase"] }
        ],
        achievementList: {
            'perfect-easy': { title: "Bibelgelehrter", description: "Erziele 100% im einfachen Modus" },
            'perfect-medium': { title: "Jünger", description: "Erziele 100% im mittleren Modus" },
            'perfect-hard': { title: "Theologe", description: "Erziele 100% im schweren Modus" }
        }
    },
    // Fix: Add missing stories translations for PersonaTab (German)
    stories: {
        title: "Biblische Helden",
        subtitle: "Sprechen Sie mit Vorbildern des Glaubens",
        disclaimer: "Gespräche sind KI-Rollenspiele. Beziehen Sie sich immer auf die Heilige Schrift als letzte Instanz.",
        startRoleplay: "Mit ihnen sprechen"
    }
  }
};
