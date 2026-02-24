import React from 'react';
import { CheckCircle2, Lock, PlayCircle, BookOpen } from 'lucide-react';
import { ModuleStatus } from '../types';

export const Modules: React.FC = () => {
  const modules: ModuleStatus[] = [
    { id: 1, title: "Foundations of Mnemonics", description: "Introduction to visualization and association.", status: 'COMPLETED' },
    { id: 2, title: "The Link Method", description: "Creating narrative chains between unrelated items.", status: 'COMPLETED' },
    { id: 3, title: "The Number Rhyme System", description: "Peg words for numbers 1-10 (Sun, Shoe, Tree...).", status: 'IN_PROGRESS' },
    { id: 4, title: "The Major System: Basics", description: "Phonetic encoding for digits 0-9.", status: 'LOCKED' },
    { id: 5, title: "Memory Palaces (Loci)", description: "Spatial storage in known environments.", status: 'LOCKED' },
    { id: 6, title: "PAO System", description: "Person, Action, Object for 2-digit numbers.", status: 'LOCKED' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="text-emerald-400" size={24} />;
      case 'IN_PROGRESS': return <PlayCircle className="text-mnemo-primary animate-pulse" size={24} />;
      default: return <Lock className="text-mnemo-text-muted/20" size={24} />;
    }
  };

  return (
    <div className="space-y-12 animate-slideIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mnemo-primary/10 border border-mnemo-primary/20 text-mnemo-primary text-xs font-bold uppercase tracking-[0.2em]">
            <BookOpen size={14} />
            <span>Neural Path</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-mnemo-text-base tracking-tighter leading-none">
            Ta'lim <br />
            <span className="text-mnemo-primary">Modullari</span>
          </h1>
          <p className="text-mnemo-text-muted font-medium leading-relaxed max-w-lg">Xotira sa’natini tizimli o‘rganish orqali intellektual salohiyatingizni maksimal darajaga chiqaring.</p>
        </div>
        <div className="glass px-6 py-4 rounded-2xl border-white/5 shadow-xl">
          <div className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em] mb-1">Muvaffaqiyat</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-mnemo-text-base leading-none">15%</span>
            <div className="w-24 h-1.5 bg-white/5 rounded-full mb-1 flex-shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-mnemo-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: '15%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className={`group flex items-center p-8 glass rounded-[2rem] border-white/5 transition-all duration-300 relative overflow-hidden ${mod.status === 'LOCKED'
              ? 'opacity-40 grayscale pointer-events-none'
              : 'hover:border-mnemo-primary/30 hover:shadow-2xl cursor-pointer'
              }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-mnemo-primary/5 transition-colors blur-2xl" />

            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mr-8 font-mono font-black text-lg transition-all shadow-inner relative z-10 ${mod.status === 'LOCKED' ? 'text-mnemo-text-muted/10' : 'text-mnemo-primary group-hover:bg-mnemo-primary group-hover:text-mnemo-bg'}`}>
              {mod.id.toString().padStart(2, '0')}
            </div>

            <div className="flex-1 relative z-10">
              <h3 className={`text-xl font-bold tracking-tight ${mod.status === 'LOCKED' ? 'text-mnemo-text-muted/30' : 'text-mnemo-text-base group-hover:text-mnemo-primary transition-colors'}`}>
                {mod.title}
              </h3>
              <p className="text-mnemo-text-muted font-medium mt-1 leading-relaxed">{mod.description}</p>
            </div>

            <div className="ml-6 relative z-10">
              {getStatusIcon(mod.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};