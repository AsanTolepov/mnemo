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

const PREDEFINED_PEOPLE = [
  // 10 Men
  { id: 1, imageUrl: 'https://randomuser.me/api/portraits/men/11.jpg', role: 'Pilot', color: '#f97316', names: { uz: 'Aziz', qq: 'Azamat', tr: 'Ahmet', ru: 'Ivan', en: 'James' } },
  { id: 2, imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg', role: 'Doctor', color: '#3b82f6', names: { uz: 'Sardor', qq: 'Nurlan', tr: 'Mehmet', ru: 'Alexey', en: 'John' } },
  { id: 3, imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg', role: 'Chef', color: '#22c55e', names: { uz: 'Timur', qq: 'Aybek', tr: 'Mustafa', ru: 'Dmitry', en: 'Robert' } },
  { id: 4, imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg', role: 'Designer', color: '#a855f7', names: { uz: 'Otabek', qq: 'Batir', tr: 'Emre', ru: 'Sergey', en: 'Michael' } },
  { id: 5, imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg', role: 'Engineer', color: '#ec4899', names: { uz: 'Jasur', qq: 'Jaras', tr: 'Burak', ru: 'Mikhail', en: 'William' } },
  { id: 6, imageUrl: 'https://randomuser.me/api/portraits/men/66.jpg', role: 'Musician', color: '#f59e0b', names: { uz: 'Rustam', qq: 'Bawirjan', tr: 'Can', ru: 'Pavel', en: 'David' } },
  { id: 7, imageUrl: 'https://randomuser.me/api/portraits/men/77.jpg', role: 'Photographer', color: '#06b6d4', names: { uz: 'Dilshod', qq: 'Dáwlet', tr: 'Cem', ru: 'Vladimir', en: 'Richard' } },
  { id: 8, imageUrl: 'https://randomuser.me/api/portraits/men/88.jpg', role: 'Teacher', color: '#10b981', names: { uz: 'Javohir', qq: 'Miyirbek', tr: 'Ali', ru: 'Igor', en: 'Joseph' } },
  { id: 9, imageUrl: 'https://randomuser.me/api/portraits/men/91.jpg', role: 'Scientist', color: '#6366f1', names: { uz: 'Ulugbek', qq: 'Sultan', tr: 'Deniz', ru: 'Oleg', en: 'Thomas' } },
  { id: 10, imageUrl: 'https://randomuser.me/api/portraits/men/94.jpg', role: 'Writer', color: '#14b8a6', names: { uz: 'Farhod', qq: 'Quwat', tr: 'Ozan', ru: 'Maxim', en: 'Charles' } },
  // 10 Women
  { id: 11, imageUrl: 'https://randomuser.me/api/portraits/women/11.jpg', role: 'Pilot', color: '#f97316', names: { uz: 'Malika', qq: 'Gulina', tr: 'Ayşe', ru: 'Anna', en: 'Mary' } },
  { id: 12, imageUrl: 'https://randomuser.me/api/portraits/women/22.jpg', role: 'Doctor', color: '#3b82f6', names: { uz: 'Shahnoza', qq: 'Ayjamal', tr: 'Fatma', ru: 'Maria', en: 'Patricia' } },
  { id: 13, imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg', role: 'Chef', color: '#22c55e', names: { uz: 'Nargiza', qq: 'Ziba', tr: 'Zeynep', ru: 'Elena', en: 'Jennifer' } },
  { id: 14, imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Designer', color: '#a855f7', names: { uz: 'Dildora', qq: 'Aygúl', tr: 'Elif', ru: 'Olga', en: 'Linda' } },
  { id: 15, imageUrl: 'https://randomuser.me/api/portraits/women/55.jpg', role: 'Engineer', color: '#ec4899', names: { uz: 'Madina', qq: 'Jazira', tr: 'Merve', ru: 'Natalia', en: 'Elizabeth' } },
  { id: 16, imageUrl: 'https://randomuser.me/api/portraits/women/66.jpg', role: 'Musician', color: '#f59e0b', names: { uz: 'Guli', qq: 'Gúlnara', tr: 'Ece', ru: 'Yulia', en: 'Barbara' } },
  { id: 17, imageUrl: 'https://randomuser.me/api/portraits/women/77.jpg', role: 'Photographer', color: '#06b6d4', names: { uz: 'Sevinch', qq: 'Nargis', tr: 'Banu', ru: 'Svetlana', en: 'Susan' } },
  { id: 18, imageUrl: 'https://randomuser.me/api/portraits/women/88.jpg', role: 'Teacher', color: '#10b981', names: { uz: 'Laylo', qq: 'Ziyada', tr: 'Cansu', ru: 'Irina', en: 'Jessica' } },
  { id: 19, imageUrl: 'https://randomuser.me/api/portraits/women/91.jpg', role: 'Scientist', color: '#6366f1', names: { uz: 'Zuhra', qq: 'Aysulu', tr: 'Derya', ru: 'Tatiana', en: 'Sarah' } },
  { id: 20, imageUrl: 'https://randomuser.me/api/portraits/women/94.jpg', role: 'Writer', color: '#14b8a6', names: { uz: 'Iroda', qq: 'Sáwle', tr: 'Pelin', ru: 'Ekaterina', en: 'Karen' } },
];

const pickRandomPeopleFromPool = (count: number, lang: string): Person[] => {
  const shuffled = [...PREDEFINED_PEOPLE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(p => {
      const localizedName = (p.names as any)[lang] || p.names.en;
      return {
          id: p.id,
          name: localizedName,
          role: p.role,
          color: p.color,
          imageUrl: p.imageUrl
      };
  });
};

export const FaceName: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [state, setState] = useState<GameState>(GameState.PREPARE);
  const [people, setPeople] = useState<Person[]>([]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [personCount, setPersonCount] = useState<number>(4);
  const [memorizeSeconds, setMemorizeSeconds] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadPeople = async (count: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setPeople(pickRandomPeopleFromPool(count, language));
    } finally {
      setLoading(false);
    }
  };

  const restartRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswers({});
    setTimeLeft(25);
    setScore(null);
    setState(GameState.PREPARE);
  };

  const startMemorize = async () => {
    const finalCount = Math.max(1, Math.min(personCount, 20));
    await loadPeople(finalCount);
    
    setState(GameState.MEMORIZE);
    setTimeLeft(memorizeSeconds);

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
  const PersonAvatar: React.FC<{ p: Person, large?: boolean }> = ({ p, large = false }) => {
    const sizeClasses = large ? "w-32 h-32 md:w-48 md:h-48 text-6xl" : "w-24 h-24 md:w-32 md:h-32 text-4xl";
    if (p.imageUrl) {
      return (
        <img
          src={p.imageUrl}
          alt={p.name}
          className={`${sizeClasses} rounded-full object-cover shadow-xl border-4 border-white`}
        />
      );
    }
    return (
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold shadow-xl border-4 border-white`}
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

        <div className="bg-mnemo-text-base/5 p-6 rounded-2xl border border-mnemo-text-base/10 shadow-sm space-y-6">
          <div>
            <p className="text-mnemo-text-base/60 mb-2">
              {t('faceNameRule')}
            </p>
            <p className="text-mnemo-text-muted text-sm">
              {t('faceNameHint')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Person Count */}
            <div className="flex flex-col items-center justify-center gap-3 bg-white/5 p-5 rounded-xl border border-white/10">
              <label className="text-xs font-bold uppercase tracking-widest text-mnemo-text-muted text-center">
                {t('personLabel')} sań (max 20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={personCount || ''}
                onChange={(e) => setPersonCount(parseInt(e.target.value, 10) || 0)}
                onBlur={(e) => {
                    let val = parseInt(e.target.value, 10) || 4;
                    if (val < 1) val = 1;
                    if (val > 20) val = 20;
                    setPersonCount(val);
                }}
                className="w-24 px-3 py-2 bg-transparent border-b-2 border-mnemo-border focus:border-mnemo-primary text-center font-bold text-3xl text-mnemo-text-base outline-none transition-colors"
              />
              <span className="text-xs text-mnemo-text-muted">{t('personLabel')}</span>
            </div>

            {/* Time Input */}
            <div className="flex flex-col items-center justify-center gap-3 bg-white/5 p-5 rounded-xl border border-white/10">
              <label className="text-xs font-bold uppercase tracking-widest text-mnemo-text-muted text-center">
                {t('durationLabel')}
              </label>
              <input
                type="number"
                min="5"
                max="600"
                value={memorizeSeconds || ''}
                onChange={(e) => setMemorizeSeconds(parseInt(e.target.value, 10) || 0)}
                onBlur={(e) => {
                    let val = parseInt(e.target.value, 10) || 30;
                    if (val < 5) val = 5;
                    if (val > 600) val = 600;
                    setMemorizeSeconds(val);
                }}
                className="w-24 px-3 py-2 bg-transparent border-b-2 border-mnemo-border focus:border-mnemo-primary text-center font-bold text-3xl text-mnemo-text-base outline-none transition-colors"
              />
              <span className="text-xs text-mnemo-text-muted">{t('seconds')}</span>
            </div>
          </div>
        </div>

        <Button onClick={startMemorize} size="lg" disabled={loading || !personCount}>
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
              className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-shadow"
            >
              <PersonAvatar p={p} large />
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
              className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-shadow"
            >
              <PersonAvatar p={p} large />
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