import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, Clock, Hash, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { NumberConfig } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const GameConfig: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<NumberConfig>({
    digitCount: 10,
    groupSize: 2,
    durationSeconds: 15
  });

  const { t } = useLanguage();

  const handleStart = () => {
    navigate('/train/numbers/play', { state: config });
  };

  const ConfigSection = ({ title, icon: Icon, children }: any) => (
    <div className="glass p-8 rounded-[2rem] border-mnemo-border hover:border-mnemo-primary/30 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-mnemo-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-mnemo-primary/10 transition-colors blur-xl" />
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="p-3 bg-mnemo-primary/5 rounded-xl text-mnemo-primary group-hover:bg-mnemo-primary group-hover:text-white transition-all shadow-inner">
          <Icon size={20} strokeWidth={2} />
        </div>
        <h3 className="font-bold text-mnemo-text-base tracking-tight uppercase text-xs tracking-[0.2em]">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-slideIn">
      {/* Orqaga tugmasi */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-mnemo-text-muted hover:text-mnemo-primary transition-colors group"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> {t('back')}
      </button>

      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-mnemo-text-base tracking-tighter leading-none">
          {t('numberMatrix')} <br />
          <span className="text-mnemo-primary">{t('settings')}</span>
        </h1>
        <p className="text-mnemo-text-muted font-medium leading-relaxed max-w-lg">
          {t('selectAbilities')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <ConfigSection title={t('digitCountLabel')} icon={Hash}>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-widest">MIN: 4</span>
              <div className="text-center">
                <span className="text-5xl font-black text-mnemo-text-base tabular-nums">
                  {config.digitCount}
                </span>
                <div className="text-[10px] font-bold text-mnemo-primary uppercase tracking-widest mt-1">{t('digitCountLabel').toLowerCase()}</div>
              </div>
              <span className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-widest">MAX: 50</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              step="2"
              value={config.digitCount}
              onChange={(e) =>
                setConfig({ ...config, digitCount: parseInt(e.target.value, 10) })
              }
              className="w-full h-1.5 bg-mnemo-text-base/5 rounded-full appearance-none cursor-pointer accent-mnemo-primary border border-mnemo-border"
            />
          </div>
        </ConfigSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ConfigSection title={t('groupingLabel')} icon={Grid3X3}>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => setConfig({ ...config, groupSize: size })}
                  className={`py-5 rounded-2xl border-2 transition-all font-mono font-black text-xs uppercase tracking-widest
                      ${config.groupSize === size
                      ? 'border-mnemo-primary bg-mnemo-primary/20 text-mnemo-primary shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                      : 'border-mnemo-border bg-mnemo-text-base/5 text-mnemo-text-muted hover:border-mnemo-primary/20'
                    }`}
                >
                  {size === 2 ? 'XX' : size === 3 ? 'XXX' : 'XXXX'}
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={`${t('durationLabel')} / ${t('speed')}`} icon={Clock}>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() =>
                  setConfig({
                    ...config,
                    durationSeconds: Math.max(5, config.durationSeconds - 5)
                  })
                }
                className="w-14 h-14 rounded-2xl border-2 border-mnemo-border glass shadow-xl flex items-center justify-center text-mnemo-primary hover:border-mnemo-primary transition-all font-black text-2xl"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-4xl font-black font-mono text-mnemo-text-base tabular-nums">
                  {config.durationSeconds}
                </span>
                <div className="text-[10px] font-bold text-mnemo-primary uppercase tracking-widest mt-1">{t('seconds')}</div>
              </div>
              <button
                onClick={() =>
                  setConfig({
                    ...config,
                    durationSeconds: config.durationSeconds + 5
                  })
                }
                className="w-14 h-14 rounded-2xl border-2 border-mnemo-border glass shadow-xl flex items-center justify-center text-mnemo-primary hover:border-mnemo-primary transition-all font-black text-2xl"
              >
                +
              </button>
            </div>
          </ConfigSection>
        </div>
      </div>

      <div className="pt-8">
        <Button onClick={handleStart} className="w-full h-20 bg-mnemo-primary hover:bg-mnemo-secondary text-white font-black text-xl rounded-2xl shadow-2xl flex items-center justify-center gap-4 group">
          <span>{t('startPractice').toUpperCase()}</span>
          <ChevronRight
            size={24}
            className="group-hover:translate-x-2 transition-transform"
          />
        </Button>
      </div>
    </div>
  );
};