import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Eye, EyeOff, RotateCcw, ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Brain, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { NumberConfig, GameState } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { saveTrainingResult } from '../services/firebaseService';

export const NumberArena: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Default config if not provided via navigation state
  const config: NumberConfig = location.state || {
    digitCount: 10,
    groupSize: 2,
    durationSeconds: 15
  };

  const [gameState, setGameState] = useState<GameState>(GameState.PREPARE);
  const [numbers, setNumbers] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(config.durationSeconds);
  const [score, setScore] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate numbers on mount
  useEffect(() => {
    generateSequence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateSequence = () => {
    let seq = '';
    for (let i = 0; i < config.digitCount; i++) {
      seq += Math.floor(Math.random() * 10).toString();
    }
    setNumbers(seq);
    setUserInput('');
    setTimeLeft(config.durationSeconds);
    setGameState(GameState.PREPARE);
  };

  const startGame = () => {
    setGameState(GameState.MEMORIZE);

    // Start Timer
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
    // Focus input after a brief delay to allow render
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitResults = () => {
    setGameState(GameState.RESULTS);
    // Calculate Score (Simple Exact Match % for now, could be Levenshtein distance)
    let matches = 0;
    for (let i = 0; i < numbers.length; i++) {
      if (userInput[i] === numbers[i]) matches++;
    }
    const calculatedScore = Math.round((matches / numbers.length) * 100);
    setScore(calculatedScore);

    // Save Results to Firestore
    if (user) {
      saveTrainingResult(user.uid, 'numberMatrix', matches, numbers.length)
        .catch(err => console.error("Error saving session:", err));
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Helper to chunk string for display
  const getChunkedDisplay = (str: string) => {
    const chunks = [];
    for (let i = 0; i < str.length; i += config.groupSize) {
      chunks.push(str.slice(i, i + config.groupSize));
    }
    return chunks;
  };

  // --- RENDERERS ---

  if (gameState === GameState.PREPARE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 text-center animate-slideIn px-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mnemo-primary/10 border border-mnemo-primary/20 text-mnemo-primary text-xs font-bold uppercase tracking-[0.2em]">
            <Brain size={14} />
            <span>{t('neuralArena')}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-mnemo-text-base tracking-tighter">{t('deepFocus')}</h2>
          <p className="text-mnemo-text-muted text-lg font-medium max-w-md mx-auto">
            {t('selectAbilities')}
          </p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] w-full max-w-lg space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-mnemo-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex justify-between items-center py-4 border-b border-white/5 relative z-10">
            <span className="text-mnemo-text-muted font-bold uppercase tracking-widest text-xs">{t('digitCountLabel')}</span>
            <span className="font-mono font-black text-3xl text-mnemo-text-base">{config.digitCount}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-white/5 relative z-10">
            <span className="text-mnemo-text-muted font-bold uppercase tracking-widest text-xs">{t('groupingLabel')}</span>
            <span className="font-mono font-black text-3xl text-mnemo-text-base">{config.groupSize}</span>
          </div>
          <div className="flex justify-between items-center py-4 relative z-10">
            <span className="text-mnemo-text-muted font-bold uppercase tracking-widest text-xs">{t('durationLabel')}</span>
            <span className="font-mono font-black text-3xl text-mnemo-primary">{config.durationSeconds}{t('seconds')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-md">
          <Button variant="secondary" onClick={() => navigate(-1)} className="glass-light border-white/10 text-mnemo-text-base font-bold h-16 flex-1">{t('back')}</Button>
          <Button onClick={startGame} className="bg-mnemo-primary hover:bg-mnemo-secondary text-white font-black text-lg h-16 flex-[2] shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all">
            {t('startPractice').toUpperCase()}
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.MEMORIZE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] relative px-4 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mnemo-primary/5 rounded-full blur-[120px] animate-pulse-slow" />

        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 md:p-12 z-20">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-mnemo-primary uppercase tracking-[0.3em]">{t('phaseMemorization')}</div>
            <div className="h-1 w-12 bg-mnemo-primary rounded-full" />
          </div>
          <div className={`font-mono text-5xl md:text-7xl font-black tabular-nums transition-colors duration-300 ${timeLeft <= 5 ? 'text-mnemo-primary animate-pulse' : 'text-mnemo-text-base'}`}>
            {timeLeft}<span className="text-2xl text-mnemo-text-muted ml-1">{t('seconds')}</span>
          </div>
        </div>

        {/* The Grid */}
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-6 md:gap-y-8 animate-slideIn relative z-10 max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {getChunkedDisplay(numbers).map((chunk, idx) => (
            <span key={idx} className={`font-mono font-black text-mnemo-text-base tracking-tighter hover:text-mnemo-primary transition-colors cursor-default drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${config.digitCount > 200 ? 'text-3xl md:text-5xl' : config.digitCount > 50 ? 'text-5xl md:text-7xl' : 'text-7xl md:text-9xl'}`}>
              {chunk}
            </span>
          ))}
        </div>

        <div className="absolute bottom-12 z-20">
          <button onClick={startRecall} className="px-8 py-3 glass-light rounded-full text-mnemo-text-muted hover:text-white hover:border-mnemo-primary/30 transition-all text-xs font-bold uppercase tracking-[0.3em]">
            {t('ready').toUpperCase()}
          </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.RECALL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-4xl mx-auto space-y-12 px-4 animate-slideIn">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-mnemo-primary mx-auto shadow-2xl">
            <RotateCcw size={40} />
          </div>
          <div className="text-[10px] font-black text-mnemo-primary uppercase tracking-[0.3em]">{t('phaseRecall')}</div>
          <div className="h-1 w-12 bg-mnemo-primary rounded-full" />
        </div>

        <div className="w-full relative group">
          {config.digitCount > 40 ? (
            <textarea
              ref={inputRef as any}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
              className={`w-full bg-transparent border-4 border-white/10 rounded-2xl focus:border-mnemo-primary outline-none font-mono py-6 px-6 text-mnemo-text-base placeholder-mnemo-text-base/10 transition-all duration-500 tracking-[0.1em] resize-none ${config.digitCount > 200 ? 'text-3xl h-64' : 'text-4xl h-48'} custom-scrollbar`}
              placeholder={Array(Math.min(config.digitCount, 100)).fill('•').join('') + (config.digitCount > 100 ? '...' : '')}
              maxLength={config.digitCount}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && userInput.length === config.digitCount) {
                  e.preventDefault();
                  submitResults();
                }
              }}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-transparent border-b-4 border-white/10 focus:border-mnemo-primary outline-none text-center font-mono text-6xl md:text-8xl py-10 text-mnemo-text-base placeholder-mnemo-text-base/10 transition-all duration-500 tracking-[0.1em]"
              placeholder={Array(config.digitCount).fill('•').join('')}
              autoComplete="off"
              maxLength={config.digitCount}
              onKeyDown={(e) => e.key === 'Enter' && userInput.length === config.digitCount && submitResults()}
            />
          )}
          <div className="absolute bottom-0 left-0 h-1 bg-mnemo-primary transition-all duration-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            style={{ width: `${(userInput.length / config.digitCount) * 100}%` }} />
        </div>

        <div className="flex flex-col items-center gap-8 w-full">
          <p className="text-mnemo-text-muted text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span>{userInput.length}</span>
            <span className="opacity-30">/</span>
            <span>{config.digitCount} {t('digitCountLabel')}</span>
          </p>

          <Button onClick={submitResults} disabled={userInput.length < 1} className="w-full max-w-md h-16 bg-mnemo-primary hover:bg-mnemo-secondary text-white font-black text-lg rounded-2xl shadow-2xl disabled:opacity-50 transition-all">
            {t('submitResult').toUpperCase()}
          </Button>
        </div>
      </div>
    );
  }

  return ( // RESULTS STATE
    <div className="w-full max-w-4xl mx-auto space-y-10 animate-slideIn px-4 pb-12">
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-[2rem] glass shadow-2xl mb-4 ${score >= 80 ? 'text-green-400' : 'text-mnemo-primary'}`}>
          {score === 100 ? (
            <CheckCircle2 size={56} strokeWidth={1.5} className="animate-bounce" />
          ) : score >= 50 ? (
            <Lightbulb size={56} strokeWidth={1.5} />
          ) : (
            <AlertCircle size={56} strokeWidth={1.5} />
          )}
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-mnemo-text-base tracking-tighter">{t('resultsTitle')}</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-7xl md:text-9xl font-black text-mnemo-primary drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">{score}%</div>
          <div className="text-left">
            <div className="text-xl font-bold text-mnemo-text-base uppercase tracking-widest">{t('accuracy')}</div>
            <div className="text-mnemo-text-muted text-sm font-semibold">{t('accuracyIndicator')}</div>
            <div className="text-[10px] font-black text-mnemo-primary uppercase tracking-[0.2em] mt-2">
              {t('speed')}: {config.durationSeconds}{t('seconds')} / {config.digitCount} {t('digitCountLabel')}
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-10 rounded-[2.5rem] shadow-2xl border-white/5 space-y-10">
        <div className="space-y-8">
          <h3 className="text-xs uppercase tracking-[0.3em] text-mnemo-primary font-black flex items-center gap-3">
            <span className="w-8 h-[2px] bg-mnemo-primary" />
            {t('comparisonAnalysis')}
          </h3>
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em] block">{t('originalSequence')}:</span>
              <div className={`font-mono tracking-tight text-white/90 break-all leading-none ${config.digitCount > 200 ? 'text-xl md:text-3xl' : config.digitCount > 50 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                {getChunkedDisplay(numbers).join(' ')}
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em] block">{t('yourResponse')}:</span>
              <div className={`font-mono tracking-tight break-all leading-none ${config.digitCount > 200 ? 'text-xl md:text-3xl' : config.digitCount > 50 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
                {userInput.split('').map((char, i) => (
                  <span key={i} className={char === numbers[i] ? 'text-green-400' : 'text-red-500 line-through decoration-4'}>
                    {char}
                  </span>
                ))}
                {Array(Math.max(0, config.digitCount - userInput.length)).fill(0).map((_, i) => (
                  <span key={i} className="text-white/5">_</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
        <Button variant="secondary" onClick={() => navigate('/')} className="h-16 glass-light border-white/10 text-mnemo-text-base font-bold rounded-2xl">{t('controlCenter')}</Button>
        <Button onClick={generateSequence} className="h-16 bg-mnemo-primary hover:bg-mnemo-secondary text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3">
          <RotateCcw size={20} />
          <span>{t('playAgain').toUpperCase()}</span>
        </Button>
      </div>
    </div>
  );
};