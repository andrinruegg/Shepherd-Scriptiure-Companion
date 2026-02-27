
import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, RotateCw, Trophy, ArrowLeft, Heart, XCircle, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';
import { QuizQuestion, PathNode, QuizSessionType } from '../types';
import { useTranslation } from 'react-i18next';
import { STATIC_QUIZ_DATA } from '../data/staticQuizData';

// --- CONFIGURATION ---
// TODO: Replace this URL with your Supabase Storage URL
// Example: 'https://[YOUR-PROJECT].supabase.co/storage/v1/object/public/assets/level-up.mp3'
const WIN_SOUND_URL = 'https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/success-fanfare-trumpets-6185.mp3';
const ERROR_SOUND_URL = 'https://www.soundjay.com/misc/sounds/fail-buzzer-01.mp3';
const CLICK_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
// ---------------------

interface QuizModeProps {
    language: string;
    onMenuClick: () => void;
    contextNode?: PathNode; // If playing from Learning Path
    onComplete?: (success: boolean) => void;
    sessionType: QuizSessionType;
    onMistake?: () => void; // Triggered on wrong answer
}

const QuizMode: React.FC<QuizModeProps> = ({ language, onMenuClick, contextNode, onComplete, sessionType, onMistake }) => {
    const { t, i18n } = useTranslation();
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete' | 'failed'>('menu');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Exam Mode: Local Hearts tracking (Starts at 5, deduct on error)
    const [localHearts, setLocalHearts] = useState(5);

    // Audio Refs for short SFX
    const dingRef = React.useRef<HTMLAudioElement | null>(null);
    const errorRef = React.useRef<HTMLAudioElement | null>(null);
    const winRef = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize Audio objects
        dingRef.current = new Audio(CLICK_SOUND_URL);
        errorRef.current = new Audio(ERROR_SOUND_URL);
        winRef.current = new Audio(WIN_SOUND_URL);

        // Preload
        dingRef.current.load();
        errorRef.current.load();
        winRef.current.load();

        // If contextNode provided, auto-start. 
        if (contextNode) {
            setGameState('playing');
            // Exam is always harder questions if available
            setDifficulty(sessionType === 'exam' ? 'Medium' : 'Easy');
            setLocalHearts(5); // Reset hearts for exam
        }
    }, [contextNode, sessionType]);

    const getLangKey = () => {
        const code = i18n.language.split('-')[0];
        if (code === 'de') return 'German';
        if (code === 'ro') return 'Romanian';
        return 'English';
    };

    // Get 1 question for debugging (was 10).
    const allQuestions = (STATIC_QUIZ_DATA[getLangKey()] || STATIC_QUIZ_DATA['English'])[difficulty];
    const questions = allQuestions.slice(0, 1);
    const currentQ = questions[currentIndex];

    const startQuiz = (diff: 'Easy' | 'Medium' | 'Hard') => {
        setDifficulty(diff);
        setGameState('playing');
        setCurrentIndex(0);
        setCorrectCount(0);
        setShowResult(false);
        setSelectedOption(null);
        setLocalHearts(5);
    };

    const handleAnswer = (idx: number) => {
        if (showResult) return;

        setSelectedOption(idx);
        setShowResult(true);

        if (idx === currentQ.correctIndex) {
            setCorrectCount(c => c + 1);
            if (dingRef.current) {
                dingRef.current.currentTime = 0;
                dingRef.current.play().catch(e => console.warn("Audio play failed", e));
            }
        } else {
            // Wrong Answer
            if (errorRef.current) {
                errorRef.current.volume = 0.5;
                errorRef.current.currentTime = 0;
                errorRef.current.play().catch(e => console.warn("Audio play failed", e));
            }

            // EXAM MODE LOGIC: Lose a heart
            if (sessionType === 'exam') {
                const newHearts = localHearts - 1;
                setLocalHearts(newHearts);

                if (newHearts <= 0) {
                    setTimeout(() => {
                        setGameState('failed');
                        if (onComplete) onComplete(false);
                    }, 1000);
                }
            }

            if (onMistake) onMistake();
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowResult(false);
            setSelectedOption(null);
        } else {
            // End of Quiz Logic
            const scorePercent = (correctCount / questions.length) * 100;

            // Practice requires 65% to pass a level (since length is 1, need 100% basically, or 0%)
            // Exam requires just surviving with hearts > 0.

            const passed = sessionType === 'exam' ? true : scorePercent >= 65;

            if (passed) {
                setGameState('complete');
                if (winRef.current) {
                    winRef.current.volume = 0.6;
                    winRef.current.currentTime = 0;
                    winRef.current.play().catch(e => console.warn("Win Audio play failed", e));
                }
                if (onComplete) onComplete(true);
            } else {
                setGameState('failed');
                if (onComplete) onComplete(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
            <header className="bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 p-4 shadow-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold font-serif-text text-slate-800 dark:text-slate-100 leading-none">
                            {contextNode ? t(`game.nodes.${contextNode.id}`) : t('quiz.title')}
                        </h1>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {sessionType === 'exam' ? t('game.finalExam') : `${t('game.practice')} ${currentIndex + 1}/${questions.length}`}
                        </span>
                    </div>
                </div>

                {/* Visuals for Exam Mode Hearts */}
                {gameState === 'playing' && sessionType === 'exam' && (
                    <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-full border border-rose-100 dark:border-rose-900 animate-pulse">
                        <Heart size={14} className="fill-current" />
                        <span className="text-xs font-black">{localHearts}</span>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                {gameState === 'menu' && (
                    <div className="w-full max-w-sm space-y-8 text-center animate-scale-in">
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg"><Brain size={48} className="text-purple-600" /></div>
                        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('quiz.start')}</h2><p className="text-slate-400 text-sm">{t('quiz.difficulty')}</p></div>
                        <div className="grid gap-3">
                            {(['Easy', 'Medium', 'Hard'] as const).map((d: any) => (
                                <button
                                    key={d}
                                    onClick={() => startQuiz(d)}
                                    className="p-5 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl text-left font-bold hover:border-purple-500 dark:hover:border-purple-500 transition-all flex justify-between items-center group"
                                >
                                    <span>{t(`quiz.${d.toLowerCase()}`)}</span>
                                    <ArrowRight size={20} className="text-slate-300 group-hover:text-purple-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gameState === 'playing' && currentQ && (
                    <div className="w-full max-w-lg space-y-6 animate-slide-up pb-10">
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${sessionType === 'exam' ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border dark:border-slate-700 relative">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{currentQ.question}</h3>
                        </div>

                        <div className="grid gap-3">
                            {currentQ.options.map((opt: string, idx: number) => {
                                let style = "bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700";
                                let icon = null;

                                if (showResult) {
                                    if (idx === currentQ.correctIndex) {
                                        style = "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-600";
                                        icon = <CheckCircle2 size={20} className="text-emerald-600" />;
                                    }
                                    else if (idx === selectedOption) {
                                        style = "bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-600";
                                        icon = <XCircle size={20} className="text-rose-600" />;
                                    }
                                    else style = "opacity-50 border-transparent bg-slate-100 dark:bg-slate-800/50";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={showResult}
                                        className={`p-4 rounded-2xl text-left font-bold transition-all flex justify-between items-center ${style}`}
                                    >
                                        {opt}
                                        {icon}
                                    </button>
                                );
                            })}
                        </div>

                        {showResult && (
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 animate-slide-up z-50">
                                <div className="max-w-lg mx-auto space-y-4">
                                    <div className={`flex items-start gap-3 p-4 rounded-xl ${selectedOption === currentQ.correctIndex ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200'}`}>
                                        <div className="flex-1">
                                            <p className="font-bold mb-1">{selectedOption === currentQ.correctIndex ? t('quiz.correct') : t('quiz.incorrect')}</p>
                                            <p className="text-sm opacity-90">{currentQ.explanation}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg text-white ${selectedOption === currentQ.correctIndex ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                                    >
                                        {currentIndex < questions.length - 1 ? t('quiz.next') : t('quiz.results')} <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {gameState === 'complete' && (
                    <div className="w-full max-sm text-center space-y-8 animate-scale-in">
                        <Trophy size={80} className="mx-auto text-amber-500 drop-shadow-lg animate-bounce" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('game.quizComplete')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quiz.score')}</span>
                                <div className="text-3xl font-bold text-emerald-600">{correctCount}/{questions.length}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sessionType === 'exam' ? t('game.xpEarned') : "Bonus"}</span>
                                <div className={`text-3xl font-bold ${sessionType === 'exam' ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {sessionType === 'exam' ? "+50" : "+15 XP"}
                                </div>
                            </div>
                        </div>
                        <button onClick={onMenuClick} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">
                            {t('common.done')}
                        </button>
                    </div>
                )}

                {gameState === 'failed' && (
                    <div className="w-full max-sm text-center space-y-8 animate-scale-in">
                        <ShieldAlert size={80} className="mx-auto text-rose-500 drop-shadow-lg animate-pulse" />
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('game.lessonFailed')}</h2>
                            <p className="text-slate-500">
                                {sessionType === 'exam' ? t('game.outOfHeartsDesc') : t('game.percentNeeded')}
                            </p>
                        </div>
                        <button onClick={onMenuClick} className="w-full py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold">
                            {t('common.return')}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuizMode;
