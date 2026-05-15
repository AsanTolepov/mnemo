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

const getSortedDeck = (lang: any): Card[] => {
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
  return deck;
};

const generateCards = (count: number, lang: any): Card[] => {
  const deck = getSortedDeck(lang);
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
  const [selectedSequence, setSelectedSequence] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);

  const current = cards[currentIndex];

  const startStudy = () => {
    const n = Math.min(Math.max(desiredCount || 1, 1), 52);
    const generated = generateCards(n, language);
    setCards(generated);
    setAllCards(getSortedDeck(language));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedSequence([]);
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

  const restartAll = () => {
    setStage('config');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedSequence([]);
  };

  const submitTest = () => {
    let correct = 0;
    cards.forEach((card, idx) => {
        if (selectedSequence[idx]?.id === card.id) {
            correct++;
        }
    });
    saveStats(correct, cards.length);
    setStage('result');
  };

  const handleSelectCard = (card: Card) => {
    if (selectedSequence.length < cards.length) {
        setSelectedSequence([...selectedSequence, card]);
    }
  };

  const handleRemoveCard = (index: number) => {
    const newSeq = [...selectedSequence];
    newSeq.splice(index, 1);
    setSelectedSequence(newSeq);
  };

  const isCorrect = (index: number) => {
    return selectedSequence[index]?.id === cards[index].id;
  };

  const totalCorrect = cards.filter((c, i) => selectedSequence[i]?.id === c.id).length;
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

      {stage === 'test' && (
        <div className="space-y-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-mnemo-text-base">{t('testStage')}</h2>
            <span className="text-sm text-mnemo-text-muted">
              {selectedSequence.length} / {cards.length}
            </span>
          </div>

          <p className="text-center text-sm text-mnemo-text-muted">
            Estelikti tekseriw ushın kartalardı izbe-izlikte tańlań. Alıw ushın orınlanǵan kartaǵa basıń.
          </p>

          {/* Empty slots for selected cards */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {cards.map((_, i) => {
              const selCard = selectedSequence[i];
              if (selCard) {
                return (
                  <div
                    key={i}
                    onClick={() => handleRemoveCard(i)}
                    className="w-16 h-24 rounded-lg shadow-md bg-white border-2 border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    style={{ color: (selCard.suit === '♥' || selCard.suit === '♦') ? '#ef4444' : '#1f2937' }}
                  >
                    <div className="text-sm font-bold leading-none">{selCard.rank}</div>
                    <div className="text-2xl font-bold">{selCard.suit}</div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={i}
                    className="w-16 h-24 rounded-lg bg-black/5 border-2 border-dashed border-mnemo-border flex items-center justify-center"
                  >
                    <span className="text-mnemo-text-muted/30 text-xs font-bold">{i + 1}</span>
                  </div>
                );
              }
            })}
          </div>

          {/* 52 Cards Selection Grid */}
          <div className="bg-mnemo-card rounded-2xl border border-mnemo-border shadow-sm p-4 glass">
            <div className="grid grid-cols-7 md:grid-cols-13 gap-1 md:gap-2 justify-items-center">
              {allCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  disabled={selectedSequence.length >= cards.length}
                  className="w-10 h-14 md:w-12 md:h-16 rounded shadow-sm bg-white border border-gray-200 flex flex-col items-center justify-center hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: (card.suit === '♥' || card.suit === '♦') ? '#ef4444' : '#1f2937' }}
                >
                  <div className="text-[10px] md:text-xs font-bold leading-none">{card.rank}</div>
                  <div className="text-sm md:text-lg">{card.suit}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button onClick={submitTest} disabled={selectedSequence.length < cards.length}>
              {t('seeResult')}
            </Button>
          </div>
        </div>
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
              {cards.map((card, i) => {
                const correct = isCorrect(i);
                const userCard = selectedSequence[i];
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl border border-mnemo-border hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                         <span className="text-xs text-mnemo-text-muted font-bold mb-1">Tuwrı</span>
                         <div
                           className="w-12 h-16 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center font-bold text-xs shadow-sm"
                           style={{ color: (card.suit === '♥' || card.suit === '♦') ? '#ef4444' : '#1f2937' }}
                         >
                           <div>{card.rank}</div>
                           <div>{card.suit}</div>
                         </div>
                      </div>
                      <div className="flex flex-col items-center">
                         <span className="text-xs text-mnemo-text-muted font-bold mb-1">Sizdiń juwap</span>
                         {userCard ? (
                             <div
                               className={`w-12 h-16 rounded-xl bg-white border-2 flex flex-col items-center justify-center font-bold text-xs shadow-sm ${correct ? 'border-green-500' : 'border-red-500'}`}
                               style={{ color: (userCard.suit === '♥' || userCard.suit === '♦') ? '#ef4444' : '#1f2937' }}
                             >
                               <div>{userCard.rank}</div>
                               <div>{userCard.suit}</div>
                             </div>
                         ) : (
                             <div className="w-12 h-16 rounded-xl bg-black/5 border-2 border-dashed border-red-500 flex flex-col items-center justify-center font-bold text-xs text-red-500">
                               -
                             </div>
                         )}
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-mnemo-text-base font-bold">
                          {card.word}
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