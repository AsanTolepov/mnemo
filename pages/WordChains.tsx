import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { GameState } from '../types';
import { Type, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { saveTrainingResult } from '../services/firebaseService';

const WORD_POOL = [
  'river', 'glass', 'planet', 'garden', 'mirror', 'castle', 'rocket', 'shadow', 'forest', 'silver',
  'lion', 'bridge', 'window', 'storm', 'desert', 'ocean', 'cloud', 'dragon', 'mountain', 'lamp',
  'book', 'camera', 'piano', 'flower', 'circle', 'tiger', 'snow', 'island', 'candle', 'helmet',
  'door', 'memory', 'station', 'apple', 'network', 'robot', 'ticket', 'coffee', 'puzzle', 'engine',
  'tower', 'garden', 'needle', 'pocket', 'circle', 'museum', 'thunder', 'sand', 'energy', 'planet'
];

export const WordChains: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(GameState.PREPARE);
  const [wordCount, setWordCount] = useState<number>(6);
  const [durationSeconds, setDurationSeconds] = useState<number>(30);

  const [words, setWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [score, setScore] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // ilk sessiya tayyorlash
    prepareRound();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const randomWords = (): string[] => {
    const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, wordCount);
  };

  const prepareRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWords(randomWords());
    setUserInput('');
    setSubmittedWords([]);
    setScore(null);
    setTimeLeft(durationSeconds);
    setGameState(GameState.PREPARE);
  };

  const startMemorize = () => {
    setGameState(GameState.MEMORIZE);
    setTimeLeft(durationSeconds);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          startRecall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(GameState.RECALL);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitResults = () => {
    const parsed = userInput
      .split(/[\s,]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    setSubmittedWords(parsed);

    let correct = 0;
    words.forEach((w, idx) => {
      if (parsed[idx] && parsed[idx] === w.toLowerCase()) correct++;
    });

    const s = Math.round((correct / words.length) * 100);
    setScore(s);

    if (user) {
      saveTrainingResult(user.uid, 'wordChains', correct, words.length)
        .catch(err => console.error("Error saving WordChains session:", err));
    }

    setGameState(GameState.RESULTS);
  };

  // --- UI ---

  if (gameState === GameState.PREPARE) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-slideIn">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-mnemo-text-muted hover:text-mnemo-primary transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> {t('back')}
        </button>

        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-mnemo-primary/10 text-mnemo-primary glass border-mnemo-primary/20 shadow-lg dark:bg-mnemo-primary/10">
            <Type size={32} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-mnemo-text-base tracking-tighter leading-none">
              {t('wordChains')}
            </h1>
            <p className="text-mnemo-text-muted font-medium mt-1">
              {t('selectAbilities')}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[2rem] border-mnemo-text-base/10 space-y-6">
            <h3 className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em]">
              {t('seqLength')}
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-mnemo-text-muted">3 {t('wordCountLabel')}</span>
                <span className="text-3xl font-black text-mnemo-text-base tabular-nums">{wordCount} {t('wordCountLabel')}</span>
                <span className="text-[10px] font-bold text-mnemo-text-muted">12 {t('wordCountLabel')}</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-mnemo-text-base/10 rounded-full appearance-none cursor-pointer accent-mnemo-primary"
              />
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem] border-mnemo-text-base/10 space-y-6">
            <h3 className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em]">
              {t('memorizeTime')}
            </h3>
            <div className="flex items-center justify-between gap-4 h-full pb-2">
              <button
                onClick={() => setDurationSeconds((s) => Math.max(10, s - 5))}
                className="w-12 h-12 rounded-xl border border-mnemo-text-base/10 bg-mnemo-text-base/5 flex items-center justify-center text-mnemo-text-base hover:border-mnemo-primary transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-3xl font-black text-mnemo-text-base tabular-nums">
                  {durationSeconds}
                </span>
                <div className="text-[10px] font-bold text-mnemo-text-muted uppercase mt-1">{t('seconds')}</div>
              </div>
              <button
                onClick={() => setDurationSeconds((s) => Math.min(90, s + 5))}
                className="w-12 h-12 rounded-xl border border-mnemo-text-base/10 bg-mnemo-text-base/5 flex items-center justify-center text-mnemo-text-base hover:border-mnemo-primary transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/')} className="h-16 flex-1 rounded-2xl glass-light border-mnemo-text-base/10 text-mnemo-text-base font-bold">
            {t('controlCenter')}
          </Button>
          <Button
            onClick={() => {
              prepareRound();
              startMemorize();
            }}
            className="h-16 flex-[2] bg-mnemo-primary text-white font-black text-lg rounded-2xl shadow-xl"
          >
            {t('startPractice').toUpperCase()}
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.MEMORIZE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 relative px-4">
        <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-mnemo-text-muted text-xs font-black uppercase tracking-[0.25em]">
            <Type size={18} /> {t('chainMethod')}
          </div>
          <div className="flex items-center gap-3 text-mnemo-text-base">
            <Clock size={20} className="text-mnemo-primary" />
            <span
              className={`font-mono text-4xl font-black tabular-nums transition-colors ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-mnemo-text-base'
                }`}
            >
              {timeLeft}{t('seconds')}
            </span>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-mnemo-text-base tracking-tighter text-center">
          {t('memorizeOrder')}
        </h2>

        <div className="flex flex-wrap justify-center gap-5 max-w-4xl">
          {words.map((w, i) => (
            <div
              key={i}
              className="px-8 py-4 rounded-3xl glass border-white/5 text-xl md:text-2xl font-black text-mnemo-text-base shadow-xl hover:scale-105 transition-transform cursor-default"
            >
              <span className="text-mnemo-primary mr-3 text-lg opacity-50">{i + 1}.</span> {w}
            </div>
          ))}
        </div>

        <div className="pt-8">
          <Button variant="secondary" onClick={startRecall} className="px-12 h-14 rounded-2xl border-2 border-mnemo-primary/20 text-mnemo-primary font-bold hover:bg-mnemo-primary/10">
            {t('ready').toUpperCase()}
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.RECALL) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-slideIn">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-mnemo-primary mx-auto shadow-2xl">
            <RotateCcw size={40} />
          </div>
          <h2 className="text-4xl font-black text-mnemo-text-base tracking-tighter">{t('recallMethod')}</h2>
          <p className="text-mnemo-text-muted font-medium">
            {t('recallHint')}
          </p>
        </div>

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={4}
          className="w-full glass border-white/10 rounded-3xl p-8 text-2xl font-black text-mnemo-text-base shadow-2xl focus:outline-none focus:ring-2 focus:ring-mnemo-primary/40 placeholder-mnemo-text-base/10 transition-all text-center"
          placeholder={`${t('enterWord')}...`}
          onKeyDown={(e) => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && submitResults()}
        />

        <div className="flex justify-between text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em] px-4">
          <span>{t('wordCount')}: {words.length}</span>
          <span>Ctrl+Enter – {t('submitResult')}</span>
        </div>

        <Button onClick={submitResults} disabled={userInput.length < 1} className="w-full h-16 bg-mnemo-primary text-white font-black text-lg rounded-2xl shadow-xl">
          {t('submitResult').toUpperCase()}
        </Button>
      </div>
    );
  }

  // RESULTS
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-slideIn px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass border-white/10 shadow-2xl mb-4 text-mnemo-primary">
          <Type size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-mnemo-text-base tracking-tighter">{t('resultsTitle')}</h2>
        <div className="text-8xl font-black text-mnemo-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">{score}%</div>
        <p className="text-mnemo-text-muted font-medium">{t('accuracyIndicator')}</p>
      </div>

      <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl space-y-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-mnemo-primary flex items-center gap-3">
          <span className="w-8 h-[2px] bg-mnemo-primary" />
          {t('comparisonAnalysis')}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {words.map((w, idx) => {
            const user = submittedWords[idx] || '';
            const isCorrect = user && user.toLowerCase() === w.toLowerCase();
            return (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-white/5 py-4 px-2"
              >
                <div className="flex items-center gap-5">
                  <span className="text-mnemo-text-muted text-xs font-black w-6">{idx + 1}.</span>
                  <span className="text-xl font-black text-mnemo-text-base">{w}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-mono font-bold text-lg ${isCorrect ? 'text-green-400' : user ? 'text-red-500 line-through decoration-2' : 'text-mnemo-text-muted/20'
                      }`}
                  >
                    {user || `(${t('noDataYet').toLowerCase()})`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button variant="secondary" onClick={() => navigate('/')} className="flex-1 h-14 rounded-xl border-2 border-white/10 text-mnemo-text-base font-bold hover:bg-mnemo-primary/10 transition-all">
          {t('controlCenter')}
        </Button>
        <Button icon={<RotateCcw />} onClick={prepareRound} className="flex-[2] h-14 bg-mnemo-primary text-white font-black text-lg rounded-xl shadow-xl hover:bg-mnemo-secondary transition-all">
          {t('playAgain')}
        </Button>
      </div>
    </div>
  );
};