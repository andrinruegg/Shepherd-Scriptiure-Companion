

export const translations: Record<string, any> = {
  English: {
    dailyVerse: {
        title: "Daily Scripture",
        copy: "Copy",
        copied: "Copied!"
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
      passwordPlaceholder: "Password",
      rememberMe: "Remember me",
      signInBtn: "Sign In",
      signUpBtn: "Sign Up",
      noAccount: "Don't have an account? Sign Up",
      hasAccount: "Already have an account? Sign In",
      errorMissing: "Please enter both email and password.",
      successCreated: "Account created! Please check your email to confirm your account.",
    },
    sidebar: {
      newChat: "New Conversation",
      history: "History",
      noChats: "No saved conversations yet.",
      settings: "Settings",
      deleteConfirm: "Delete this chat?",
      rename: "Rename",
      delete: "Delete",
      tabs: {
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
        remove: "Remove",
        bibleVerse: "Bible Verse",
        chatMessage: "Chat Message",
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
            selectFriends: "Select Friends"
        },
        amen: "Amen"
    },
    sanctuary: {
        title: "Sanctuary",
        rain: "Rain",
        fire: "Fire",
        stream: "Stream",
        night: "Night",
        off: "Silence"
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
        loading: "Generating question..."
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
      winterMode: "Winter Mode",
      account: "Account",
      loggedIn: "Logged in via Supabase",
      signOut: "Sign Out",
      about: "About",
    }
  }
};