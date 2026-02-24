import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { GameState } from '../types';
import { Grid3X3, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { saveTrainingResult } from '../services/firebaseService';

type ShapeType = 'square' | 'circle' | 'diamond';

const DEFAULT_GRID_SIZE = 3;
const DEFAULT_MEMORIZE_SECONDS = 10;
const DEFAULT_SHAPE_COUNT = 4;

const generatePattern = (cellCount: number, activeCount: number): boolean[] => {
  const arr = Array(cellCount).fill(false);

  const maxShapes = Math.max(1, cellCount - 1);
  const safeActive = Math.min(Math.max(activeCount, 1), maxShapes);

  const indices = Array.from({ length: cellCount }, (_, i) => i).sort(
    () => Math.random() - 0.5
  );
  indices.slice(0, safeActive).forEach((i) => {
    arr[i] = true;
  });

  return arr;
};

export const AbstractImages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [state, setState] = useState<GameState>(GameState.PREPARE);

  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [shapeCount, setShapeCount] = useState<number>(DEFAULT_SHAPE_COUNT);
  const [memorizeSeconds, setMemorizeSeconds] =
    useState<number>(DEFAULT_MEMORIZE_SECONDS);
  const [shape, setShape] = useState<ShapeType>('square');

  const cellCount = gridSize * gridSize;
  const maxShapes = Math.max(1, cellCount - 1);

  const [pattern, setPattern] = useState<boolean[]>(
    () => generatePattern(cellCount, shapeCount)
  );
  const [selection, setSelection] = useState<boolean[]>(
    () => Array(cellCount).fill(false)
  );
  const [timeLeft, setTimeLeft] = useState(memorizeSeconds);
  const [score, setScore] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (shapeCount > maxShapes) {
      setShapeCount(maxShapes);
    } else if (shapeCount < 1) {
      setShapeCount(1);
    }
  }, [maxShapes, shapeCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const restartRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newPattern = generatePattern(cellCount, shapeCount);
    setPattern(newPattern);
    setSelection(Array(cellCount).fill(false));
    setTimeLeft(memorizeSeconds);
    setScore(null);
    setState(GameState.PREPARE);
  };

  const startMemorize = () => {
    const newPattern = generatePattern(cellCount, shapeCount);
    setPattern(newPattern);
    setSelection(Array(cellCount).fill(false));
    setScore(null);

    setState(GameState.MEMORIZE);
    setTimeLeft(memorizeSeconds);

    if (timerRef.current) clearInterval(timerRef.current);

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

  const toggleCell = (index: number) => {
    setSelection((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const submit = () => {
    let correctCells = 0;
    pattern.forEach((val, idx) => {
      if (val === selection[idx]) correctCells++;
    });

    const calculatedScore = Math.round((correctCells / cellCount) * 100);
    setScore(calculatedScore);

    if (user) {
      saveTrainingResult(user.uid, 'abstractImages', correctCells, cellCount)
        .catch(err => console.error("Error saving AbstractImages session:", err));
    }

    setState(GameState.RESULTS);
  };

  // FAOL katak dizayni – shakl turiga qarab
  const getCellClass = (isActive: boolean, interactive: boolean): string => {
    const base =
      'w-12 h-12 md:w-14 md:h-14 border flex items-center justify-center transition-all duration-150';

    if (!isActive) {
      return [
        base,
        'rounded-xl bg-gray-50 border-gray-200',
        interactive ? 'hover:bg-gray-100 cursor-pointer' : '',
      ].join(' ');
    }

    let shapeStyle = '';
    switch (shape) {
      case 'circle':
        shapeStyle = 'rounded-full';
        break;
      case 'diamond':
        // Biroz kichraygan romb
        shapeStyle = 'rounded-none transform rotate-45 scale-90';
        break;
      default:
        shapeStyle = 'rounded-lg';
    }

    return [
      base,
      shapeStyle,
      'bg-mnemo-primary border-mnemo-primary shadow-sm text-white',
      interactive ? 'cursor-pointer' : '',
    ].join(' ');
  };

  const renderGrid = (cells: boolean[], interactive = false) => (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
    >
      {cells.map((active, idx) => {
        const isActive = interactive ? selection[idx] : active;
        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && toggleCell(idx)}
            className={getCellClass(isActive, interactive)}
          />
        );
      })}
    </div>
  );

  // --- UI ---

  if (state === GameState.PREPARE) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-slideIn">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-mnemo-text-muted hover:text-mnemo-primary transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> {t('back')}
        </button>

        <header className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 rounded-2xl bg-mnemo-primary/10 text-mnemo-primary glass border-mnemo-primary/20 shadow-lg dark:bg-mnemo-primary/10">
            <Grid3X3 size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black text-mnemo-text-base tracking-tighter leading-none">
              {t('abstractImages')}
            </h1>
            <p className="text-mnemo-text-muted font-medium">
              {t('selectAbilities')}
            </p>
          </div>
        </header>

        <div className="glass p-8 rounded-[2rem] border-mnemo-text-base/10 space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-mnemo-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-mnemo-primary/10 transition-colors" />
          <p className="text-mnemo-text-base/80 leading-relaxed max-w-2xl relative z-10">
            {t('patternTitle')}
          </p>
          <div className="flex items-center gap-2 text-mnemo-primary/70 text-sm font-bold uppercase tracking-wider relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-mnemo-primary" />
            {t('patternTitle')}
          </div>
        </div>

        {/* Sozlamalar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Grid o‘lchami */}
          <div className="glass p-6 rounded-[2rem] border-mnemo-text-base/10 flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-mnemo-text-muted mb-6 uppercase tracking-[0.2em]">
              {t('gridSize')}
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-mnemo-text-muted">3×3</span>
                <span className="text-3xl font-black text-mnemo-text-base tabular-nums">
                  {gridSize}×{gridSize}
                </span>
                <span className="text-[10px] font-bold text-mnemo-text-muted">10×10</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                value={gridSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value, 10);
                  const newCellCount = size * size;
                  const newMaxShapes = Math.max(1, newCellCount - 1);
                  setGridSize(size);
                  setShapeCount((prev) =>
                    Math.min(Math.max(prev, 1), newMaxShapes)
                  );
                  setPattern(generatePattern(newCellCount, shapeCount));
                  setSelection(Array(newCellCount).fill(false));
                }}
                className="w-full h-1.5 bg-mnemo-text-base/10 rounded-full appearance-none cursor-pointer accent-mnemo-primary"
              />
              <p className="text-[10px] text-mnemo-text-muted leading-tight">
                Maksimal{' '}
                <span className="font-bold text-mnemo-primary">
                  {maxShapes} ta
                </span>{' '}
                {t('shapeCountLabel').toLowerCase()}.
              </p>
            </div>
          </div>

          {/* Shakillar soni */}
          <div className="glass p-6 rounded-[2rem] border-white/5">
            <h3 className="text-[10px] font-black text-mnemo-text-muted mb-6 uppercase tracking-[0.2em]">
              {t('shapeCountLabel')}
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-mnemo-text-muted">1 ta</span>
                <span className="text-3xl font-black text-mnemo-text-base tabular-nums">
                  {shapeCount} ta
                </span>
                <span className="text-[10px] font-bold text-mnemo-text-muted">{maxShapes} ta</span>
              </div>
              <input
                type="range"
                min={1}
                max={maxShapes}
                value={shapeCount}
                onChange={(e) =>
                  setShapeCount(
                    Math.min(
                      maxShapes,
                      Math.max(1, parseInt(e.target.value, 10) || 1)
                    )
                  )
                }
                className="w-full h-1.5 bg-mnemo-text-base/10 rounded-full appearance-none cursor-pointer accent-mnemo-primary"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-mnemo-text-muted uppercase">{t('manual')}:</span>
                <input
                  type="number"
                  min={1}
                  max={maxShapes}
                  value={shapeCount}
                  onChange={(e) =>
                    setShapeCount(() => {
                      const v = parseInt(e.target.value, 10);
                      if (Number.isNaN(v)) return 1;
                      return Math.min(maxShapes, Math.max(1, v));
                    })
                  }
                  className="w-16 bg-mnemo-text-base/5 border border-mnemo-text-base/10 rounded-lg text-center text-xs font-bold p-1 focus:border-mnemo-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Yodlash vaqti */}
          <div className="glass p-6 rounded-[2rem] border-white/5">
            <h3 className="text-[10px] font-black text-mnemo-text-muted mb-6 uppercase tracking-[0.2em]">
              {t('memorizeTime')}
            </h3>
            <div className="flex items-center justify-between gap-4 h-full pb-4">
              <button
                onClick={() =>
                  setMemorizeSeconds((s) => Math.max(5, s - 2))
                }
                className="w-10 h-10 rounded-xl border border-mnemo-text-base/10 bg-mnemo-text-base/5 flex items-center justify-center text-mnemo-text-base hover:border-mnemo-primary transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-3xl font-black text-mnemo-text-base tabular-nums">
                  {memorizeSeconds}
                </span>
                <div className="text-[10px] font-bold text-mnemo-text-muted uppercase mt-1">{t('seconds')}</div>
              </div>
              <button
                onClick={() =>
                  setMemorizeSeconds((s) => Math.min(90, s + 2))
                }
                className="w-10 h-10 rounded-xl border border-mnemo-text-base/10 bg-mnemo-text-base/5 flex items-center justify-center text-mnemo-text-base hover:border-mnemo-primary transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Shakl turi */}
          <div className="glass p-6 rounded-[2rem] border-mnemo-text-base/10 lg:col-span-1 md:col-span-2">
            <h3 className="text-[10px] font-black text-mnemo-text-muted mb-6 uppercase tracking-[0.2em]">
              {t('shapeType')}
            </h3>
            <div className="flex items-center gap-3">
              {([
                { id: 'square', label: t('square') },
                { id: 'circle', label: t('circle') },
                { id: 'diamond', label: t('diamond') },
              ] as { id: ShapeType; label: string }[]).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all group ${shape === s.id
                    ? 'border-mnemo-primary bg-mnemo-primary/10 text-mnemo-primary shadow-lg shadow-mnemo-primary/10'
                    : 'border-mnemo-text-base/5 bg-mnemo-text-base/5 text-mnemo-text-muted hover:border-mnemo-text-base/10'
                    }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {s.id === 'square' && (
                      <div className={`w-6 h-6 rounded-md transition-all ${shape === s.id ? 'bg-mnemo-primary' : 'bg-mnemo-text-muted opacity-50'}`} />
                    )}
                    {s.id === 'circle' && (
                      <div className={`w-6 h-6 rounded-full transition-all ${shape === s.id ? 'bg-mnemo-primary' : 'bg-mnemo-text-muted opacity-50'}`} />
                    )}
                    {s.id === 'diamond' && (
                      <div className={`w-5 h-5 rotate-45 transition-all ${shape === s.id ? 'bg-mnemo-primary' : 'bg-mnemo-text-muted opacity-50'}`} />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={startMemorize} className="w-full h-16 bg-mnemo-primary text-white font-black text-lg rounded-2xl shadow-xl hover:bg-mnemo-secondary transition-all group">
            <span className="mr-2">{t('startPractice').toUpperCase()}</span>
            <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    );
  }

  if (state === GameState.MEMORIZE) {
    return (
      <div className="max-w-xl mx-auto space-y-10 animate-slideIn">
        <div className="flex justify-between items-center glass p-6 rounded-2xl border-mnemo-text-base/10">
          <h2 className="text-xl font-bold text-mnemo-text-base">
            {t('memorizePattern')}
          </h2>
          <div className="flex items-center gap-3 text-mnemo-text-base">
            <Clock size={20} className="text-mnemo-primary" />
            <span
              className={`font-mono text-4xl font-black tabular-nums ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-mnemo-text-base'
                }`}
            >
              {timeLeft}{t('seconds')}
            </span>
          </div>
        </div>

        <div className="flex justify-center p-4 glass rounded-[2rem] border-mnemo-text-base/10 shadow-2xl">{renderGrid(pattern, false)}</div>

        <div className="flex justify-center">
          <Button variant="secondary" onClick={startRecall} className="px-10 py-4 rounded-2xl border-2 border-mnemo-primary/20 text-mnemo-primary font-bold hover:bg-mnemo-primary/10">
            {t('ready').toUpperCase()}
          </Button>
        </div>
      </div>
    );
  }

  if (state === GameState.RECALL) {
    return (
      <div className="max-w-xl mx-auto space-y-10 animate-slideIn">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-mnemo-text-base tracking-tighter">
            {t('recallPattern')}
          </h2>
          <p className="text-mnemo-text-muted font-medium">
            {t('recallPatternHint')}
          </p>
        </div>

        <div className="flex justify-center p-4 glass rounded-[2rem] border-mnemo-text-base/10 shadow-2xl">{renderGrid(selection, true)}</div>

        <Button onClick={submit} fullWidth size="lg" className="h-16 bg-mnemo-primary text-white font-black text-lg rounded-2xl shadow-xl">
          {t('submitResult').toUpperCase()}
        </Button>
      </div>
    );
  }

  // RESULTS
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-slideIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass border-mnemo-text-base/10 shadow-2xl mb-4 text-mnemo-primary">
          <Grid3X3 size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-mnemo-text-base tracking-tighter">{t('resultsTitle')}</h2>
        <div className="text-7xl font-black text-mnemo-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">{score}%</div>
        <p className="text-mnemo-text-muted font-medium">
          {t('accuracyIndicator')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-10 items-start">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-mnemo-text-muted px-2">
            {t('originalPattern')}
          </h3>
          <div className="glass p-6 rounded-[2rem] border-mnemo-text-base/10 scale-90 sm:scale-100 origin-top">
            {renderGrid(pattern, false)}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-mnemo-text-muted px-2">
            {t('yourResponse')}
          </h3>
          <div className="glass p-6 rounded-[2rem] border-mnemo-text-base/10 scale-90 sm:scale-100 origin-top">
            {renderGrid(selection, false)}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button variant="secondary" onClick={() => navigate('/')} className="flex-1 h-14 rounded-xl border-2 border-mnemo-text-base/10 text-mnemo-text-base font-bold dark:bg-white/5 hover:bg-mnemo-primary/10 transition-all">
          {t('controlCenter')}
        </Button>
        <Button icon={<RotateCcw />} onClick={restartRound} className="flex-[2] h-14 bg-mnemo-primary text-white font-black text-lg rounded-xl shadow-xl hover:bg-mnemo-secondary transition-all">
          {t('playAgain')}
        </Button>
      </div>
    </div>
  );
};