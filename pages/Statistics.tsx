import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, BarChart2 } from 'lucide-react';
import { getTrainingResults, TrainingResult } from '../services/firebaseService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const Statistics: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [sessions, setSessions] = useState<TrainingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'1day' | '1week' | '1month'>('1week');

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

    const filteredData = useMemo(() => {
        const now = new Date();
        const past = new Date();

        if (period === '1day') {
            past.setDate(now.getDate() - 1);
        } else if (period === '1week') {
            past.setDate(now.getDate() - 7);
        } else if (period === '1month') {
            past.setMonth(now.getMonth() - 1);
        }

        const filtered = sessions.filter(session => {
            if (!session.date?.seconds) return false;
            const sessionDate = new Date(session.date.seconds * 1000);
            return sessionDate >= past && sessionDate <= now;
        });

        // Sort chronologically
        const sorted = filtered.sort((a, b) => a.date.seconds - b.date.seconds);

        // Map individual sessions to show up/down trends clearly
        return sorted.map((session, index) => {
            const dateObj = new Date(session.date.seconds * 1000);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            
            const accuracy = session.total ? Math.round((session.score / session.total) * 100) : 0;
            return {
                name: period === '1day' ? timeStr : `${dateStr} ${timeStr}`,
                accuracy,
                fullDate: dateObj.toLocaleString(),
                type: session.type
            };
        });

    }, [sessions, period]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-slideIn">
                <div className="p-6 bg-orange-100 rounded-full text-orange-500">
                    <AlertCircle size={64} />
                </div>
                <h2 className="text-3xl font-bold text-mnemo-text-base text-center">
                    {t('notLoggedIn')}
                </h2>
                <p className="text-mnemo-text-muted text-center max-w-md">
                    {t('performExerciseHint')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-slideIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-mnemo-text-base tracking-tighter">
                        {t('statistics')}
                    </h1>
                    <p className="text-mnemo-text-muted font-medium">{t('statsMonitoring')}</p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl glass border border-white/10 shadow-lg">
                    {[
                        { id: '1day', label: t('period1Day') },
                        { id: '1week', label: t('period1Week') },
                        { id: '1month', label: t('period1Month') }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                period === p.id
                                    ? 'bg-mnemo-primary text-white shadow-md'
                                    : 'text-mnemo-text-muted hover:text-mnemo-text-base'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-12 h-12 border-4 border-mnemo-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredData.length === 0 ? (
                <div className="glass p-12 rounded-[2.5rem] text-center space-y-4">
                    <BarChart2 size={48} className="mx-auto text-mnemo-text-muted/30" />
                    <p className="text-mnemo-text-muted font-bold uppercase tracking-widest">{t('noDataYet')}</p>
                </div>
            ) : (
                <div className="glass p-6 md:p-10 rounded-[2.5rem] shadow-xl space-y-8">
                    <h2 className="text-2xl font-bold text-mnemo-text-base mb-6">
                        {t('accuracy')} (%)
                    </h2>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>   {/* Green for 100% */}
                                        <stop offset="50%" stopColor="#eab308" stopOpacity={0.5}/>  {/* Yellow for 50% */}
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/> {/* Red for 0% */}
                                    </linearGradient>
                                    <linearGradient id="strokeAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" />
                                        <stop offset="50%" stopColor="#eab308" />
                                        <stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} tickMargin={10} />
                                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickMargin={10} />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="glass-light p-4 rounded-xl border border-white/10 shadow-2xl bg-black/80 backdrop-blur-md">
                                                    <p className="text-mnemo-text-muted text-xs mb-1">{data.fullDate}</p>
                                                    <p className="text-mnemo-text-base font-bold text-lg mb-2 capitalize">
                                                        {t(data.type) || data.type}
                                                    </p>
                                                    <p className="text-mnemo-primary font-black text-xl">
                                                        {data.accuracy}% {t('accuracy')}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="url(#strokeAccuracy)" strokeWidth={4} fillOpacity={1} fill="url(#colorAccuracy)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
