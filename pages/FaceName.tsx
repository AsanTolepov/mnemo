import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { GameState } from '../types';
import { UserSquare2, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { saveTrainingResult } from '../services/firebaseService';

interface Person {
  id: number;
  name: string;
  role: string;
  color: string;
  imageUrl?: string;   // yangi: internetdan kelgan rasm
}

const ROLES = [
  'Pilot',
  'Doctor',
  'Chef',
  'Designer',
  'Engineer',
  'Musician',
  'Photographer',
  'Teacher'
];

const COLORS = [
  '#f97316',
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#ec4899',
  '#f59e0b',
  '#06b6d4',
  '#10b981'
];

// Fallback pool (agar internetdan rasm kelmasa)
const PEOPLE_POOL: Person[] = [
  { id: 1, name: 'Liam', role: 'Pilot', color: '#f97316' },
  { id: 2, name: 'Emma', role: 'Doctor', color: '#3b82f6' },
  { id: 3, name: 'Noah', role: 'Chef', color: '#22c55e' },
  { id: 4, name: 'Olivia', role: 'Designer', color: '#a855f7' },
  { id: 5, name: 'Ethan', role: 'Engineer', color: '#ec4899' },
  { id: 6, name: 'Ava', role: 'Musician', color: '#f59e0b' },
  { id: 7, name: 'Mason', role: 'Photographer', color: '#06b6d4' },
  { id: 8, name: 'Sophia', role: 'Teacher', color: '#10b981' }
];

const MEMORIZE_SECONDS = 25;
const PERSON_COUNT = 4;

// Fallback – rangli doira avatarlar
const pickRandomPeopleFromPool = (): Person[] => {
  const shuffled = [...PEOPLE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, PERSON_COUNT);
};

// Internetdan tasodifiy odamlar olish
const fetchRandomPeople = async (): Promise<Person[]> => {
  const url = `https://randomuser.me/api/?results=${PERSON_COUNT}&inc=name,picture&nat=us,gb,ca,au`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch people');
  const data = await res.json();

  const results = data.results as Array<{
    name: { first: string };
    picture: { large: string };
  }>;

  return results.map((r, index) => ({
    id: index + 1,
    name: r.name.first, // faqat ismi
    role: ROLES[index % ROLES.length],
    color: COLORS[index % COLORS.length],
    imageUrl: r.picture.large
  }));
};

export const FaceName: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [state, setState] = useState<GameState>(GameState.PREPARE);
  const [people, setPeople] = useState<Person[]>([]);
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_SECONDS);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Boshlang‘ich yuzlarni yuklash
  useEffect(() => {
    loadPeople();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const onlinePeople = await fetchRandomPeople();
      setPeople(onlinePeople);
    } catch (e) {
      // agar internet yoki API ishlamasa – fallback
      setPeople(pickRandomPeopleFromPool());
    } finally {
      setLoading(false);
    }
  };

  const restartRound = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await loadPeople();
    setAnswers({});
    setTimeLeft(MEMORIZE_SECONDS);
    setScore(null);
    setState(GameState.PREPARE);
  };

  const startMemorize = () => {
    if (!people.length) return;
    setState(GameState.MEMORIZE);
    setTimeLeft(MEMORIZE_SECONDS);

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
    setState(GameState.RECALL);
  };

  const submit = () => {
    let correct = 0;
    people.forEach((p) => {
      const ans = (answers[p.id] || '').trim().toLowerCase();
      if (ans && ans === p.name.toLowerCase()) correct++;
    });

    const calculatedScore = Math.round((correct / people.length) * 100);
    setScore(calculatedScore);

    if (user) {
      saveTrainingResult(user.uid, 'faceName', correct, people.length)
        .catch(err => console.error("Error saving FaceName session:", err));
    }

    setState(GameState.RESULTS);
  };

  const handleChange = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const initialOf = (name: string) => name.charAt(0).toUpperCase();

  // Avatar: internetdan kelgan rasm bo‘lsa – img, bo‘lmasa eski rangli doira
  const PersonAvatar: React.FC<{ p: Person }> = ({ p }) => {
    if (p.imageUrl) {
      return (
        <img
          src={p.imageUrl}
          alt={p.name}
          className="w-16 h-16 rounded-full object-cover shadow"
        />
      );
    }
    return (
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow"
        style={{ backgroundColor: p.color }}
      >
        {initialOf(p.name)}
      </div>
    );
  };

  // UI

  if (state === GameState.PREPARE) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-slideIn">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft size={16} className="mr-1" /> {t('back')}
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-50 text-mnemo-primary">
            <UserSquare2 size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('faceNameTitle')}</h1>
            <p className="text-gray-500">
              {t('faceNameDesc')}
            </p>
          </div>
        </div>

        <div className="bg-mnemo-text-base/5 p-6 rounded-2xl border border-mnemo-text-base/10 shadow-sm space-y-3">
          <p className="text-mnemo-text-base/60">
            {t('faceNameRule')}
          </p>
          <p className="text-mnemo-text-muted text-sm">
            {t('faceNameHint')}
          </p>
        </div>

        <Button onClick={startMemorize} size="lg" disabled={loading || !people.length}>
          {loading ? t('loadingFaces') : t('startPractice')}
        </Button>
      </div>
    );
  }

  if (state === GameState.MEMORIZE) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t('memorizeFaces')}</h2>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={18} />
            <span
              className={`font-mono text-3xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-900'
                }`}
            >
              {timeLeft}{t('seconds')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {people.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center space-y-2"
            >
              <PersonAvatar p={p} />
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400">
                {t('personLabel')} {String.fromCharCode(65 + idx)}
              </div>
              <div className="text-lg font-semibold text-gray-900">{p.name}</div>
              <div className="text-sm text-gray-500">{p.role}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="secondary" onClick={startRecall}>
            {t('ready')}
          </Button>
        </div>
      </div>
    );
  }

  if (state === GameState.RECALL) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center">{t('recallNames')}</h2>
        <p className="text-center text-gray-500">
          {t('recallNamesHint')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {people.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center space-y-3"
            >
              <PersonAvatar p={p} />
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400">
                {t('personLabel')} {String.fromCharCode(65 + idx)}
              </div>
              <div className="text-sm text-gray-500 mb-1">{p.role}</div>
              <input
                type="text"
                value={answers[p.id] || ''}
                onChange={(e) => handleChange(p.id, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mnemo-primary/40"
                placeholder={`${t('enterName')}...`}
              />
            </div>
          ))}
        </div>

        <Button onClick={submit} fullWidth size="lg">
          {t('submitResult')}
        </Button>
      </div>
    );
  }

  // RESULTS
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slideIn">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
          <UserSquare2 className="w-10 h-10 text-mnemo-primary" />
        </div>
        <h2 className="text-3xl font-bold text-mnemo-text-base">{t('resultsTitle')}</h2>
        <div className="text-6xl font-bold text-mnemo-primary">{score}%</div>
        <p className="text-mnemo-text-muted">{t('accuracyIndicator')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {people.map((p, idx) => {
          const ans = (answers[p.id] || '').trim();
          const isCorrect = ans.toLowerCase() === p.name.toLowerCase();
          return (
            <div
              key={p.id}
              className={`glass rounded-2xl border p-5 shadow-sm flex flex-col items-center text-center space-y-2 ${isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
            >
              <PersonAvatar p={p} />
              <div className="text-xs uppercase tracking-[0.25em] text-gray-400">
                {t('personLabel')} {String.fromCharCode(65 + idx)}
              </div>
              <div className="text-sm text-gray-500">{p.role}</div>
              <div className="text-sm mt-2">
                <span className="font-semibold text-mnemo-text-base">{t('correct')}:</span>{' '}
                <span className="font-mono">{p.name}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-mnemo-text-base">{t('yourResponse')}:</span>{' '}
                <span
                  className={`font-mono ${isCorrect ? 'text-green-600' : ans ? 'text-red-500' : 'text-mnemo-text-muted/40'
                    }`}
                >
                  {ans || `(${t('noDataYet').toLowerCase()})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-2">
        <Button variant="secondary" onClick={() => navigate('/')} className="glass-light border-mnemo-text-base/10 text-mnemo-text-base font-bold">
          {t('controlCenter')}
        </Button>
        <Button icon={<RotateCcw />} onClick={restartRound} fullWidth>
          {t('playAgain')}
        </Button>
      </div>
    </div>
  );
};