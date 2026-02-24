import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TrendingUp, Award, Clock, AlertCircle, Calendar } from 'lucide-react';
import { getTrainingResults, TrainingResult } from '../services/firebaseService';

export const Monitoring: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [sessions, setSessions] = useState<TrainingResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            try {
                const data = await getTrainingResults(user.uid);
                setSessions(data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-slideIn">
                <div className="p-6 bg-orange-100 rounded-full text-orange-500">
                    <AlertCircle size={64} />
                </div>
                <h2 className="text-3xl font-bold text-mnemo-text-base text-center">
                    {t('loginRequired')}
                </h2>
                <p className="text-mnemo-text-muted text-center max-w-md">
                    {t('performExerciseHint')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-slideIn">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-mnemo-text-base tracking-tighter">
                    {t('monitoring')}
                </h1>
                <p className="text-mnemo-text-muted font-medium">{t('statsMonitoring')}</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-12 h-12 border-4 border-mnemo-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center space-y-4">
                    <TrendingUp size={48} className="mx-auto text-mnemo-text-muted/30" />
                    <p className="text-mnemo-text-muted font-bold uppercase tracking-widest">{t('noDataYet')}</p>
                    <p className="text-sm text-mnemo-text-muted">{t('performExerciseHint')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="glass p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-mnemo-primary/20 transition-all group">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-mnemo-primary/5 rounded-2xl flex items-center justify-center text-mnemo-primary group-hover:scale-110 transition-transform">
                                    <Award size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-mnemo-text-base capitalize">
                                        {t(session.type) || session.type}
                                    </h3>
                                    <div className="flex items-center gap-4 text-mnemo-text-muted text-xs font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-mnemo-primary" />
                                            <span>
                                                {session.date?.seconds
                                                    ? new Date(session.date.seconds * 1000).toLocaleDateString()
                                                    : t('loading') || '...'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                                            <Clock size={12} className="text-mnemo-primary" />
                                            <span>
                                                {session.date?.seconds
                                                    ? new Date(session.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : '...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full md:w-auto md:gap-12 pl-12 md:pl-0">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-mnemo-primary tracking-tight">
                                        {Math.round((session.score / (session.total || 1)) * 100)}%
                                    </div>
                                    <div className="text-[10px] font-black text-mnemo-text-muted uppercase tracking-[0.2em]">
                                        {t('accuracy')}
                                    </div>
                                </div>
                                <div className="text-right border-l border-white/5 pl-8 hidden sm:block">
                                    <div className="text-xl font-black text-mnemo-text-base">
                                        {session.score} <span className="text-mnemo-text-muted">/ {session.total}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-mnemo-text-muted/40 uppercase tracking-widest">
                                        Ball
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
