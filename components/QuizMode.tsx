import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, XCircle, ArrowRight, Trophy, Menu, Flame, RotateCw, Award, CheckCircle2, Timer, ArrowLeft } from 'lucide-react';
import { STATIC_QUIZ_DATA } from '../data/staticQuizData.ts';
import { QuizQuestion, Achievement } from '../types.ts';
import { translations } from '../utils/translations.ts';
import { db } from '../services/db.ts';
import ShepherdLogo from './ShepherdLogo.tsx';

interface QuizModeProps {
    language: string;
    onMenuClick: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ language, onMenuClick }) => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'result' | 'complete'>('menu');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
    const [myAchievements, setMyAchievements] = useState<Set<string>>(new Set());

    const t = translations[language]?.quiz || translations['English'].quiz;

    useEffect(() => {
        db.social.getCurrentUser().then(p => { if (p && p.achievements) setMyAchievements(new Set(p.achievements.map(a => a.id))); });
    }, []);

    const randomizeQuestion = (q: QuizQuestion): QuizQuestion => {
        const correctString = q.options[q.correctIndex];
        const newOptions = [...q.options].sort(() => 0.5 - Math.random());
        return { ...q, options: newOptions, correctIndex: newOptions.indexOf(correctString) };
    };

    const startQuiz = (diff: 'Easy' | 'Medium' | 'Hard') => {
        setDifficulty(diff);
        const langData = STATIC_QUIZ_DATA[language] || STATIC_QUIZ_DATA['English'];
        const randomized = [...langData[diff]].sort(() => 0.5 - Math.random()).map(randomizeQuestion);
        setSessionQuestions(randomized);
        setCurrentIndex(0); setCorrectCount(0); setStreak(0); setEarnedAchievement(null); setStartTime(Date.now());
        setCurrentQuestion(randomized[0]); setGameState('playing'); setShowResult(false); setSelectedOption(null);
    };

    const handleOptionClick = (index: number) => {
        if (showResult || !currentQuestion) return;
        setSelectedOption(index); setShowResult(true);
        if (index === currentQuestion.correctIndex) { setStreak(s => s + 1); setCorrectCount(c => c + 1); } else setStreak(0);
    };

    const nextQuestion = () => {
        if (currentIndex < sessionQuestions.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx); setCurrentQuestion(sessionQuestions[nextIdx]); setShowResult(false); setSelectedOption(null);
        } else finishQuiz();
    };

    const finishQuiz = async () => {
        setEndTime(Date.now()); setGameState('complete');
        if (correctCount === sessionQuestions.length) {
            const achId = `perfect-${difficulty.toLowerCase()}`;
            if (!myAchievements.has(achId)) {
                const achievement: Achievement = { id: achId, icon: difficulty === 'Hard' ? 'Trophy' : difficulty === 'Medium' ? 'Scroll' : 'Book', title: `${difficulty} Scholar`, description: `Perfect on ${difficulty}`, date_earned: Date.now() };
                setEarnedAchievement(achievement);
                setMyAchievements(prev => new Set(prev).add(achId));
                try { await db.social.addAchievement(achievement); } catch (e) {}
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-950 border-b p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"><ArrowLeft size={24} /></button>
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Brain size={20} /></div>
                    <div><h1 className="text-xl font-bold font-serif-text">{t.title}</h1></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-center">
                    {gameState === 'menu' && (
                        <div className="w-full max-w-lg text-center space-y-8 animate-scale-in">
                            <ShepherdLogo className="text-purple-600 mx-auto w-24 h-24 mb-4" size={64} />
                            <div><h2 className="text-2xl font-bold">{t.start}</h2><p className="text-slate-500">{t.difficulty}</p></div>
                            <div className="grid gap-3">
                                {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                    <button key={d} onClick={() => startQuiz(d)} className="p-4 bg-white dark:bg-slate-800 border rounded-xl shadow-sm flex justify-between items-center group">
                                        <span className="font-bold">{d}</span>
                                        {myAchievements.has(`perfect-${d.toLowerCase()}`) && <CheckCircle2 size={18} className="text-emerald-500" />}
                                        <ArrowRight className="opacity-0 group-hover:opacity-100 text-purple-500" size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {gameState === 'playing' && currentQuestion && (
                        <div className="w-full max-w-lg space-y-6 animate-slide-up">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100"><div className="h-full bg-purple-500 transition-all" style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }} /></div>
                                <div className="text-xs font-bold text-slate-400 mt-2">{t.question} {currentIndex + 1} / {sessionQuestions.length}</div>
                                <h3 className="text-xl font-bold mt-2 leading-relaxed">{currentQuestion.question}</h3>
                            </div>
                            <div className="grid gap-3">
                                {currentQuestion.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleOptionClick(i)} disabled={showResult} className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${showResult ? (i === currentQuestion.correctIndex ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : (i === selectedOption ? 'bg-red-50 border-red-500 text-red-700' : 'opacity-50')) : 'bg-white hover:border-purple-400'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {showResult && (
                                <div className="animate-scale-in space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border"><p className="text-sm">{currentQuestion.explanation}</p><p className="text-xs font-bold text-slate-400 mt-2 uppercase">{currentQuestion.reference}</p></div>
                                    <button onClick={nextQuestion} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{currentIndex < sessionQuestions.length - 1 ? t.next : t.results} <ArrowRight size={20} /></button>
                                </div>
                            )}
                        </div>
                    )}
                    {gameState === 'complete' && (
                         <div className="text-center space-y-8 animate-scale-in py-8">
                             <Trophy className="text-amber-500 mx-auto w-24 h-24 mb-4" size={64} />
                             <h2 className="text-3xl font-bold">{t.correct}</h2>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border"><span className="text-xs font-bold text-slate-400 uppercase">{t.accuracy}</span><div className="text-2xl font-bold">{correctCount}/{sessionQuestions.length}</div></div>
                                 <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border"><span className="text-xs font-bold text-slate-400 uppercase">{t.time}</span><div className="text-2xl font-bold">{Math.floor((endTime - startTime)/1000)}s</div></div>
                             </div>
                             {earnedAchievement && <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3"><Award className="text-amber-500" size={24}/><div className="text-left"><p className="font-bold text-sm">Unlocked!</p><p className="font-bold">{earnedAchievement.title}</p></div></div>}
                             <div className="flex gap-3 pt-4"><button onClick={() => setGameState('menu')} className="flex-1 py-3 bg-slate-200 rounded-xl font-bold">Menu</button><button onClick={() => startQuiz(difficulty)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold">Again</button></div>
                         </div>
                    )}
            </main>
        </div>
    );
};

export default QuizMode;