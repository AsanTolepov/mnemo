import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, Type, Layers, UserSquare2, Image as ImageIcon, TrendingUp, Zap, ArrowRight, Award } from 'lucide-react';
import { ExerciseType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const exercises = [
    {
      id: ExerciseType.NUMBER_MATRIX,
      title: t('numberMatrix'),
      desc: "Raqamlarni tez kodlash va jadval bo‘yicha fazoviy xotirani rivojlantiring.",
      icon: Grid3X3,
      path: '/train/numbers/config'
    },
    {
      id: ExerciseType.WORD_CHAINS,
      title: t('wordChains'),
      desc: "Turli tushunchalarni hikoya shaklidagi zanjirlar orqali bog‘lang.",
      icon: Type,
      path: '/train/words'
    },
    {
      id: ExerciseType.FLASHCARDS,
      title: t('playingCards'),
      desc: "52 ta o'yin kartasini va ularga bog'langan maxsus so'zlarni yodlang.",
      icon: Layers,
      path: '/train/flashcards'
    },
    {
      id: ExerciseType.FACE_NAME,
      title: t('faceName'),
      desc: "Ijtimoiy intellekt va yuz xususiyatlarini eslab qolishni rivojlantiring.",
      icon: UserSquare2,
      path: '/train/faces'
    },
    {
      id: ExerciseType.ABSTRACT_IMAGES,
      title: t('abstractImages'),
      desc: "So‘zsiz ma’lumotlardagi naqsh va qonuniyatlarni aniqlashni rivojlantiring.",
      icon: ImageIcon,
      path: '/train/abstract'
    }
  ];

  return (
    <div className="space-y-16 animate-slideIn">
      {/* Header Section */}
      <header className="mb-14">
        <h1 className="text-4xl md:text-6xl font-black text-mnemo-text-base tracking-tighter leading-none mb-4">
          {t('trainingModules')}
        </h1>
        <p className="text-mnemo-text-muted font-medium leading-relaxed max-w-lg">
          {t('selectAbilities')}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: t('currentStreak'), value: t('statDiscipline'), icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: t('averageAccuracy'), value: t('statProgress'), icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: t('speed'), value: t('statTimeLimit'), icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' }
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl flex items-center gap-6 hover:scale-[1.02] transition-transform duration-300">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="text-3xl font-black text-mnemo-text-base tracking-tight">{stat.value}</div>
              <div className="text-sm font-semibold text-mnemo-text-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Modules */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-black text-mnemo-text-base tracking-tight">{t('trainingModules')}</h2>
            <p className="text-mnemo-text-muted text-sm font-medium">{t('selectAbilities')}</p>
          </div>
          <button className="text-mnemo-primary font-bold text-xs uppercase tracking-[0.2em] border-b-2 border-mnemo-primary/20 hover:border-mnemo-primary transition-all pb-1">
            {t('allExercises')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => navigate(ex.path)}
              className="group text-left glass p-10 rounded-[2.5rem] hover:border-mnemo-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-start gap-8"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-mnemo-primary/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700 blur-2xl" />

              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-mnemo-primary group-hover:bg-mnemo-primary group-hover:text-mnemo-bg group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-500">
                <ex.icon size={32} strokeWidth={1.5} />
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-mnemo-text-base group-hover:text-mnemo-primary transition-colors">
                  {ex.title}
                </h3>
                <p className="text-mnemo-text-muted font-medium leading-relaxed group-hover:text-mnemo-text-base transition-colors">
                  {ex.desc}
                </p>
              </div>

              <div className="mt-auto pt-4 flex items-center gap-2 text-mnemo-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <span className="text-xs font-bold uppercase tracking-widest">{t('startPractice')}</span>
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};