
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, XCircle, ArrowRight, Trophy, Menu, Flame, RotateCw, Award, CheckCircle2, Timer } from 'lucide-react';
import { STATIC_QUIZ_DATA } from '../data/staticQuizData';
import { QuizQuestion, Achievement } from '../types';
import { translations } from '../utils/translations';
import { db } from '../services/db';
import ShepherdLogo from './ShepherdLogo';

interface QuizModeProps {
    language: string;
    onMenuClick: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ language, onMenuClick }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'result' | 'complete'>('menu');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    
    // Quiz State
    const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    
    // Stats
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    
    const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
    const [myAchievements, setMyAchievements] = useState<Set<string>>(new Set());

    const t = translations[language]?.quiz || translations['English'].quiz;

    // Load achievements on mount
    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const profile = await db.social.getCurrentUser();
                if (profile && profile.achievements) {
                    const ids = new Set(profile.achievements.map(a => a.id));
                    setMyAchievements(ids);
                }
            } catch (e) {
                console.error("Failed to load achievements", e);
            }
        };
        fetchAchievements();
    }, []);

    // Helper to shuffle answers so users can't memorize positions
    const randomizeQuestion = (q: QuizQuestion): QuizQuestion => {
        const correctString = q.options[q.correctIndex];
        // Shuffle options
        const newOptions = [...q.options].sort(() => 0.5 - Math.random());
        // Find new index of the correct string
        const newCorrectIndex = newOptions.indexOf(correctString);
        
        return {
            ...q,
            options: newOptions,
            correctIndex: newCorrectIndex
        };
    };

    const startQuiz = (diff: 'Easy' | 'Medium' | 'Hard') => {
        setDifficulty(diff);
        const allQuestions = [...STATIC_QUIZ_DATA[diff]];
        
        // 1. Shuffle the order of questions
        const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
        
        // 2. Randomize the answer positions for each question
        const randomizedQuestions = shuffledQuestions.map(randomizeQuestion);

        setSessionQuestions(randomizedQuestions);
        
        // Reset State
        setCurrentIndex(0);
        setCorrectCount(0);
        setStreak(0);
        setEarnedAchievement(null);
        setStartTime(Date.now());
        
        // Load first
        setCurrentQuestion(randomizedQuestions[0]);
        setGameState('playing');
        setShowResult(false);
        setSelectedOption(null);
    };

    const handleOptionClick = (index: number) => {
        if (showResult || !currentQuestion) return;
        setSelectedOption(index);
        setShowResult(true);

        if (index === currentQuestion.correctIndex) {
            setStreak(s => s + 1);
            setCorrectCount(c => c + 1);
        } else {
            setStreak(0);
        }
    };

    const nextQuestion = async () => {
        if (currentIndex < sessionQuestions.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setCurrentQuestion(sessionQuestions[nextIdx]);
            setShowResult(false);
            setSelectedOption(null);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setEndTime(Date.now());
        setGameState('complete');

        // Check for Achievement (100% Correct)
        const percentage = Math.round((correctCount / sessionQuestions.length) * 100);
        
        if (percentage === 100) {
            let title = "";
            let desc = "";
            let icon = "Award";

            if (difficulty === 'Easy') { title = "Bible Scholar"; desc = "Perfect score on Easy mode!"; icon = "Book"; }
            if (difficulty === 'Medium') { title = "Disciple"; desc = "Perfect score on Medium mode!"; icon = "Scroll"; }
            if (difficulty === 'Hard') { title = "Theologian"; desc = "Perfect score on Hard mode!"; icon = "Trophy"; }

            const achievementId = `perfect-${difficulty.toLowerCase()}`;
            
            // Only award if not already earned
            if (!myAchievements.has(achievementId)) {
                const achievement: Achievement = {
                    id: achievementId,
                    icon,
                    title,
                    description: desc,
                    date_earned: Date.now(),
                    difficulty_level: difficulty
                };
                
                setEarnedAchievement(achievement);
                // Update local state immediately so menu checkmark appears
                setMyAchievements(prev => new Set(prev).add(achievementId));
                
                // Save to DB
                try {
                    await db.social.addAchievement(achievement);
                    await db.social.updateProfileStats(streak); 
                } catch (e) {
                    console.error("Failed to save achievement", e);
                }
            }
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    // Smoother progress bar logic: Base progress + 1 step if answered
    const progressPercentage = sessionQuestions.length > 0 
        ? ((currentIndex + (showResult ? 1 : 0)) / sessionQuestions.length) * 100 
        : 0;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <Brain size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t.title}</h1>
                        {gameState === 'playing' && <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">{difficulty} Mode</span>}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                <div className="min-h-full flex flex-col items-center justify-center w-full max-w-lg mx-auto py-4">
                    
                    {gameState === 'menu' && (
                        <div className="w-full space-y-8 animate-scale-in text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full"></div>
                                <ShepherdLogo className="relative z-10 text-purple-600 dark:text-purple-400 mx-auto w-24 h-24 mb-4" size={64} />
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.start}</h2>
                                <p className="text-slate-500 dark:text-slate-400">{t.difficulty}</p>
                            </div>

                            <div className="grid gap-3">
                                <button onClick={() => startQuiz('Easy')} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-purple-500 hover:shadow-md transition-all font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between group relative overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="block font-bold">🌱 {t.easy}</span>
                                                {myAchievements.has('perfect-easy') && (
                                                    <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">Perfect for beginners</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-500">{STATIC_QUIZ_DATA.Easy.length} Qs</span>
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" size={18} />
                                </button>
                                
                                <button onClick={() => startQuiz('Medium')} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-purple-500 hover:shadow-md transition-all font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between group relative overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="block font-bold">📖 {t.medium}</span>
                                                {myAchievements.has('perfect-medium') && (
                                                    <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">Test your knowledge</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-500">{STATIC_QUIZ_DATA.Medium.length} Qs</span>
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" size={18} />
                                </button>
                                
                                <button onClick={() => startQuiz('Hard')} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-purple-500 hover:shadow-md transition-all font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between group relative overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="block font-bold">🔥 {t.hard}</span>
                                                {myAchievements.has('perfect-hard') && (
                                                    <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400">For true scholars</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-500">{STATIC_QUIZ_DATA.Hard.length} Qs</span>
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && currentQuestion && (
                        <div className="w-full space-y-6 animate-slide-up pb-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                {/* PROGRESS BAR */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-700">
                                    <div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4 mt-2">
                                    <span className="text-xs font-bold text-slate-400">Question {currentIndex + 1} / {sessionQuestions.length}</span>
                                    {streak > 1 && !showResult && (
                                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full animate-bounce">
                                            <Flame size={12} fill="currentColor" /> {streak} Streak
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 leading-relaxed">
                                    {currentQuestion.question}
                                </h3>
                            </div>

                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, index) => {
                                    let stateClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400";
                                    if (showResult) {
                                        if (index === currentQuestion.correctIndex) stateClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500";
                                        else if (index === selectedOption) stateClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                        else stateClass = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionClick(index)}
                                            disabled={showResult}
                                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all shadow-sm flex items-center justify-between text-slate-700 dark:text-slate-200 ${stateClass}`}
                                        >
                                            <span>{option}</span>
                                            {showResult && index === currentQuestion.correctIndex && <CheckCircle size={20} className="text-emerald-500" />}
                                            {showResult && index === selectedOption && index !== currentQuestion.correctIndex && <XCircle size={20} className="text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {showResult && (
                                <div className="animate-scale-in space-y-4">
                                    <div className={`p-4 rounded-xl border ${selectedOption === currentQuestion.correctIndex ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900'}`}>
                                        <div className="flex items-start gap-3">
                                            <Sparkles className={selectedOption === currentQuestion.correctIndex ? 'text-emerald-500' : 'text-slate-400'} size={20} />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                                                    {selectedOption === currentQuestion.correctIndex ? t.correct : t.incorrect}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {currentQuestion.explanation}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                                                    {currentQuestion.reference}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={nextQuestion}
                                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {currentIndex < sessionQuestions.length - 1 ? t.next : "See Results"} <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {gameState === 'complete' && (
                         <div className="w-full space-y-8 animate-scale-in text-center py-8">
                             <div className="relative inline-block">
                                 <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                                 <Trophy className="relative z-10 text-amber-500 mx-auto w-24 h-24 mb-4 drop-shadow-md" size={64} />
                             </div>
                             
                             <div>
                                 <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 font-serif-text">Congratulations!</h2>
                                 <p className="text-slate-500 dark:text-slate-400">You completed the {difficulty} Quiz</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
                                     <span className="text-xs font-bold text-slate-400 uppercase mb-1">Time Taken</span>
                                     <div className="flex items-center gap-2">
                                        <Timer size={18} className="text-purple-500"/>
                                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(endTime - startTime)}</span>
                                     </div>
                                 </div>
                                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
                                     <span className="text-xs font-bold text-slate-400 uppercase mb-1">Accuracy</span>
                                     <div className="flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-emerald-500"/>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount}/{sessionQuestions.length}</span>
                                     </div>
                                 </div>
                             </div>
                             
                             {earnedAchievement && (
                                 <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-3 animate-pop-in shadow-md">
                                     <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-500 border border-amber-200 dark:border-amber-800">
                                         <Award size={24} />
                                     </div>
                                     <div className="text-left">
                                         <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">Achievement Unlocked!</p>
                                         <p className="font-serif-text font-bold text-lg text-amber-800 dark:text-amber-200">{earnedAchievement.title}</p>
                                         <p className="text-xs text-amber-600 dark:text-amber-400">Perfect Score on {difficulty} Mode</p>
                                     </div>
                                 </div>
                             )}

                             <div className="flex gap-3 pt-4">
                                <button onClick={() => setGameState('menu')} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                    Home
                                </button>
                                <button onClick={() => startQuiz(difficulty)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                    <RotateCw size={18} /> Play Again
                                </button>
                             </div>
                         </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuizMode;
