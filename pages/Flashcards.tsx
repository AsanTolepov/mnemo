import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { cardMnemonicWords } from '../services/translations';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Card {
  id: string;
  rank: string;
  suit: string;
  word: string;
}

type Stage = 'config' | 'study' | 'test' | 'result';

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♥', '♦', '♣', '♠'];

const generateCards = (count: number, lang: any): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      const key = `${rank}${suit}`;
      deck.push({
        id: key,
        rank,
        suit,
        word: cardMnemonicWords[key]?.[lang] || `Word ${key}`,
      });
    });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.slice(0, count);
};

export const Flashcards: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [stage, setStage] = useState<Stage>('config');
  const [desiredCount, setDesiredCount] = useState<number>(52);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Test bosqichi uchun foydalanuvchi javoblari
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = cards[currentIndex];

  const startStudy = () => {
    const n = Math.min(Math.max(desiredCount || 1, 1), 52);
    const generated = generateCards(n, language);
    setCards(generated);
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers({});
    setStage('study');
  };

  const goNextStudy = () => {
    if (currentIndex === cards.length - 1) {
      setStage('test');
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const goPrevStudy = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const saveStats = async (correct: number, total: number) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        type: 'playingCards',
        score: correct,
        total: total,
        date: new Date()
      });
    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  const goNextTest = () => {
    if (currentIndex === cards.length - 1) {
      const correct = cards.filter(card => {
        const a = (answers[card.id] || '').trim().toLowerCase();
        const w = card.word.trim().toLowerCase();
        return a !== '' && a === w;
      }).length;
      saveStats(correct, cards.length);
      setStage('result');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const restartAll = () => {
    setStage('config');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setAnswers({});
  };

  const isCorrect = (card: Card) => {
    const a = (answers[card.id] || '').trim().toLowerCase();
    const w = card.word.trim().toLowerCase();
    return a !== '' && (a === w || w.includes(a) && a.length > 2);
  };

  const totalCorrect = cards.filter(isCorrect).length;
  const progressPercent =
    cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slideIn">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm text-mnemo-text-muted hover:text-mnemo-text-base transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> {t('back')}
      </button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-mnemo-text-base">{t('playingCards')}</h1>
        <p className="text-mnemo-text-muted">
          52 ta o'yin kartasini va ularga bog'langan so'zlarni yodlang.
        </p>
      </div>

      {stage === 'config' && (
        <div className="bg-mnemo-card rounded-2xl border border-mnemo-border shadow-sm p-8 space-y-6 glass">
          <h2 className="text-xl font-semibold text-mnemo-text-base">{t('selectCount')}</h2>

          <div className="flex items-center gap-4">
            <label className="text-sm text-mnemo-text-muted">Kartalar soni:</label>
            <input
              type="number"
              min={1}
              max={52}
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              className="w-28 px-3 py-2 bg-white/5 border border-mnemo-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-mnemo-primary text-mnemo-text-base"
            />
            <span className="text-sm text-mnemo-text-muted">{t('max52')}</span>
          </div>

          <Button onClick={startStudy} fullWidth>
            {t('startPractice')}
          </Button>
        </div>
      )}

      {stage === 'study' && current && (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-mnemo-text-base">{t('studyStage')}</h2>
            <span className="text-sm text-mnemo-text-muted">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="flex justify-center">
            <div
              className="w-64 h-96 cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped((v) => !v)}
            >
              <div
                className="relative w-full h-full rounded-2xl shadow-lg transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border-4 border-gray-100"
                  style={{ backfaceVisibility: 'hidden', color: (current.suit === '♥' || current.suit === '♦') ? '#ef4444' : '#1f2937' }}
                >
                  <div className="absolute top-4 left-4 text-2xl font-bold flex flex-col items-center leading-none">
                    <span>{current.rank}</span>
                    <span>{current.suit}</span>
                  </div>
                  <div className="text-8xl font-bold">{current.suit}</div>
                  <div className="absolute bottom-4 right-4 text-2xl font-bold flex flex-col items-center leading-none rotate-180">
                    <span>{current.rank}</span>
                    <span>{current.suit}</span>
                  </div>
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center text-3xl font-bold px-4 text-center bg-mnemo-primary text-white rounded-2xl shadow-inner border-8 border-white/20"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {current.word}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-mnemo-text-muted">
            {t('flipHint')}
          </p>

          <div className="flex items-center gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={goPrevStudy}
              disabled={currentIndex === 0}
            >
              {t('prev')}
            </Button>
            <Button onClick={goNextStudy}>
              {currentIndex === cards.length - 1 ? t('startTest') : t('next')}
            </Button>
          </div>

          <div className="w-full bg-mnemo-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-mnemo-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}

      {stage === 'test' && current && (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-mnemo-text-base">{t('testStage')}</h2>
            <span className="text-sm text-mnemo-text-muted">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="flex justify-center">
            <div
              className="w-64 h-96 rounded-2xl shadow-lg bg-white border-4 border-gray-100 flex flex-col items-center justify-center relative"
              style={{ color: (current.suit === '♥' || current.suit === '♦') ? '#ef4444' : '#1f2937' }}
            >
              <div className="absolute top-4 left-4 text-2xl font-bold flex flex-col items-center leading-none">
                <span>{current.rank}</span>
                <span>{current.suit}</span>
              </div>
              <div className="text-8xl font-bold">{current.suit}</div>
              <div className="absolute bottom-4 right-4 text-2xl font-bold flex flex-col items-center leading-none rotate-180">
                <span>{current.rank}</span>
                <span>{current.suit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-sm mx-auto w-full">
            <label className="text-sm text-mnemo-text-muted block text-center uppercase tracking-widest font-bold">
              {t('writeWord')}
            </label>
            <input
              type="text"
              value={answers[current.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-mnemo-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-mnemo-primary text-center font-bold text-lg text-mnemo-text-base shadow-inner"
              placeholder={t('enterWord')}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && goNextTest()}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button onClick={goNextTest}>
              {currentIndex === cards.length - 1 ? t('seeResult') : t('next')}
            </Button>
          </div>

          <div className="w-full bg-mnemo-border h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-mnemo-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}

      {stage === 'result' && (
        <>
          <div className="bg-mnemo-card rounded-3xl border border-mnemo-border shadow-sm p-10 space-y-6 glass text-center">
            <div className="flex flex-col items-center gap-4">
              {totalCorrect === cards.length ? (
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 size={48} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-mnemo-primary">
                  <Award size={48} />
                </div>
              )}
              <h2 className="text-3xl font-black text-mnemo-text-base">{t('results')}</h2>
            </div>

            <p className="text-mnemo-text-muted text-lg">
              Siz {cards.length} ta kartadan{' '}
              <span className="font-bold text-mnemo-primary">
                {totalCorrect}
              </span>{' '}
              tasini to‘g‘ri esladingiz.
            </p>

            <div className="text-6xl font-black text-mnemo-primary tracking-tighter">
              {cards.length ? Math.round((totalCorrect / cards.length) * 100) : 0}%
            </div>
          </div>

          <div className="bg-mnemo-card rounded-3xl border border-mnemo-border shadow-sm p-8 glass">
            <h3 className="text-xl font-bold text-mnemo-text-base mb-6">
              Tahlil
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cards.map((card) => {
                const correct = isCorrect(card);
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-mnemo-border hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-16 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center font-bold text-xs shadow-sm"
                        style={{ color: (card.suit === '♥' || card.suit === '♦') ? '#ef4444' : '#1f2937' }}
                      >
                        <div>{card.rank}</div>
                        <div>{card.suit}</div>
                      </div>
                      <div>
                        <div className="text-mnemo-text-base font-bold">
                          {t('writeWord')}: {card.word}
                        </div>
                        <div className="text-mnemo-text-muted text-sm">
                          {user ? user.displayName : 'Guest'}:{' '}
                          <span className={correct ? 'text-green-500 font-bold' : 'text-red-400 font-bold'}>
                            {answers[card.id] ? answers[card.id] : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {correct ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" onClick={() => navigate('/')} fullWidth>
              Control Center
            </Button>
            <Button icon={<RotateCcw size={18} />} onClick={restartAll} fullWidth>
              {t('restart')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};