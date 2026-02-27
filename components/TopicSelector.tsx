
import React from 'react';
import { Heart, CloudRain, Sun, Smile, Shield, HeartHandshake, Anchor, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface TopicSelectorProps {
  onSelectTopic: (topic: string, hiddenContext?: string) => void;
  language: string;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, language }) => {
  const { t } = useTranslation();

  // SUB-TOPIC ENGINE
  const subTopics: Record<string, string[]> = {
    anxiety: [
      "peace that transcends understanding",
      "God's sovereignty over worry",
      "casting cares upon Him",
      "courage in the face of fear",
      "sleep and rest in God",
      "God as our refuge",
      "Do not be afraid"
    ],
    love: [
      "God's sacrificial love (Agape)",
      "brotherly love and friendship",
      "love for enemies",
      "love in marriage",
      "God's love for the broken",
      "love as a fruit of the spirit",
      "nothing can separate us from His love"
    ],
    hope: [
      "hope for the future plans",
      "hope during suffering",
      "eternal hope in heaven",
      "waiting on the Lord",
      "hope as an anchor for the soul",
      "renewed strength through hope"
    ],
    sadness: [
      "God is close to the brokenhearted",
      "joy comes in the morning",
      "Jesus weeping and empathy",
      "comfort in affliction",
      "God wiping away tears",
      "turning mourning into dancing"
    ],
    gratitude: [
      "giving thanks in all circumstances",
      "praise for creation",
      "thankfulness for salvation",
      "gratitude for daily bread",
      "entering His gates with thanksgiving"
    ],
    strength: [
      "strength in weakness",
      "mounting up with wings like eagles",
      "the joy of the Lord is strength",
      "putting on the armor of God",
      "I can do all things through Christ",
      "David and Goliath courage"
    ],
    joy: [
      "joy unspeakable",
      "rejoicing in the Lord always",
      "joy as a fruit of the Spirit",
      "shouts of joy in the psalms",
      "finding joy in trials"
    ],
    forgiveness: [
      "forgiving others as Christ forgave us",
      "God removing our sins as far as the east is from the west",
      "mercy triumphing over judgment",
      "the parable of the unmerciful servant",
      "cleansing from all unrighteousness"
    ]
  };

  const topics = [
    { id: 'anxiety', label: t('topics.anxiety.label'), icon: CloudRain, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' },
    { id: 'love', label: t('topics.love.label'), icon: Heart, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300' },
    { id: 'hope', label: t('topics.hope.label'), icon: Sun, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300' },
    { id: 'sadness', label: t('topics.sadness.label'), icon: Anchor, color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
    { id: 'gratitude', label: t('topics.gratitude.label'), icon: HeartHandshake, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300' },
    { id: 'strength', label: t('topics.strength.label'), icon: Shield, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' },
    { id: 'joy', label: t('topics.joy.label'), icon: Smile, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300' },
    { id: 'forgiveness', label: t('topics.forgiveness.label'), icon: Sparkles, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300' },
  ];

  const handleSelect = (topicId: string) => {
    const baseQuery = t(`topics.${topicId}.query`);
    const specificAngles = subTopics[topicId] || [];
    const randomAngle = specificAngles[Math.floor(Math.random() * specificAngles.length)];
    const visiblePrompt = baseQuery;
    const hiddenContext = `Context-Seed-${uuidv4()}. The user specifically needs a verse regarding: "${randomAngle}". Ensure this is different from previous generic answers.`;

    onSelectTopic(visiblePrompt, hiddenContext);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <h2 className="text-center text-slate-500 dark:text-slate-400 text-sm uppercase tracking-widest font-semibold mb-6">
        {t('topics.title')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleSelect(topic.id)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className={`p-3 rounded-full mb-3 ${topic.color} group-hover:scale-110 transition-transform`}>
              <topic.icon size={24} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;
