
import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, RotateCw, Trophy, ArrowLeft, Timer, CheckCircle2 } from 'lucide-react';
import { QuizQuestion } from '../types';
import { useTranslation } from 'react-i18next';
import { STATIC_QUIZ_DATA } from '../data/staticQuizData';
import ShepherdLogo from './ShepherdLogo';

const QuizMode: React.FC<{ language: string, onMenuClick: () => void }> = ({ language, onMenuClick }) => {
    const { t, i18n } = useTranslation();
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    
    const getLangKey = () => {
        const code = i18n.language.split('-')[0];
        if (code === 'de') return 'German';
        if (code === 'ro') return 'Romanian';
        return 'English';
    };

    const questions = (STATIC_QUIZ_DATA[getLangKey()] || STATIC_QUIZ_DATA['English'])[difficulty];
    const currentQ = questions[currentIndex];

    const startQuiz = (diff: 'Easy' | 'Medium' | 'Hard') => {
        setDifficulty(diff); setGameState('playing'); setCurrentIndex(0); setCorrectCount(0); setShowResult(false); setSelectedOption(null);
    };

    const handleAnswer = (idx: number) => {
        if (showResult) return;
        setSelectedOption(idx);
        setShowResult(true);
        if (idx === currentQ.correctIndex) setCorrectCount(c => c + 1);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
            <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 p-4 shadow-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-3"><button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ArrowLeft size={24} /></button><h1 className="text-xl font-bold font-serif-text text-slate-800 dark:text-slate-100">{t('quiz.title')}</h1></div>
            </header>
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                {gameState === 'menu' && (
                    <div className="w-full max-w-sm space-y-8 text-center animate-scale-in">
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg"><Brain size={48} className="text-purple-600" /></div>
                        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('quiz.start')}</h2><p className="text-slate-400 text-sm">{t('quiz.difficulty')}</p></div>
                        <div className="grid gap-3">
                            {(['Easy', 'Medium', 'Hard'] as const).map((d: any) => (
                                <button key={d} onClick={() => startQuiz(d)} className="p-5 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl text-left font-bold hover:border-purple-500 dark:hover:border-purple-500 transition-all flex justify-between items-center group"><span>{t(`quiz.${d.toLowerCase()}`)}</span><ArrowRight size={20} className="text-slate-300 group-hover:text-purple-500" /></button>
                            ))}
                        </div>
                    </div>
                )}
                {gameState === 'playing' && currentQ && (
                    <div className="w-full max-w-lg space-y-6 animate-slide-up pb-10">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border dark:border-slate-700">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">{t('quiz.question')} {currentIndex + 1} / {questions.length}</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{currentQ.question}</h3>
                        </div>
                        <div className="grid gap-3">
                            {currentQ.options.map((opt: string, idx: number) => {
                                let style = "bg-white dark:bg-slate-800 border-2 dark:border-slate-700 text-slate-700 dark:text-slate-200";
                                if (showResult) {
                                    if (idx === currentQ.correctIndex) style = "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20";
                                    else if (idx === selectedOption) style = "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20";
                                    else style = "opacity-50 border-slate-200 dark:border-slate-700";
                                }
                                return <button key={idx} onClick={() => handleAnswer(idx)} className={`p-4 rounded-2xl text-left font-medium transition-all ${style}`}>{opt}</button>;
                            })}
                        </div>
                        {showResult && (
                            <div className="animate-scale-in space-y-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-inner">
                                    <p className="font-bold text-slate-900 dark:text-white mb-2">{selectedOption === currentQ.correctIndex ? t('quiz.correct') : t('quiz.incorrect')}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{currentQ.explanation}</p>
                                    <p className="text-[10px] font-black text-indigo-500 mt-4 uppercase tracking-widest">{currentQ.reference}</p>
                                </div>
                                <button onClick={() => currentIndex < questions.length-1 ? (setCurrentIndex(currentIndex+1), setShowResult(false), setSelectedOption(null)) : setGameState('complete')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">{currentIndex < questions.length - 1 ? t('quiz.next') : t('quiz.results')} <ArrowRight size={20}/></button>
                            </div>
                        )}
                    </div>
                )}
                {gameState === 'complete' && (
                    <div className="w-full max-sm text-center space-y-8 animate-scale-in">
                        <Trophy size={80} className="mx-auto text-amber-500 drop-shadow-lg" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('quiz.correct')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quiz.score')}</span><div className="text-3xl font-bold text-emerald-600">{correctCount}/{questions.length}</div></div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quiz.accuracy')}</span><div className="text-3xl font-bold text-purple-600">{Math.round((correctCount/questions.length)*100)}%</div></div>
                        </div>
                        <div className="flex gap-3"><button onClick={() => setGameState('menu')} className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 rounded-2xl font-bold">{t('quiz.home')}</button><button onClick={() => startQuiz(difficulty)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><RotateCw size={18}/> {t('quiz.playAgain')}</button></div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuizMode;
