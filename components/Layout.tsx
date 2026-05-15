import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Brain, LayoutGrid, Award, Settings, LogOut, Sun, Moon, Globe, LogIn, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../services/translations';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group ${isActive
        ? 'bg-mnemo-primary/20 text-mnemo-primary shadow-lg shadow-mnemo-primary/10 border border-mnemo-primary/20'
        : 'text-mnemo-text-muted hover:bg-white/5 hover:text-mnemo-text-base'
        }`}
    >
      <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-1.5 group-hover:stroke-2 transition-all'} />
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </Link>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, loginWithGoogle, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('mnemo_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mnemo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mnemo_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // "Deep Focus" mode: o'yin sahifalarida sidebar/headerni yashirish
  const isFocusMode =
    location.pathname.includes('/play') ||
    location.pathname.startsWith('/train/words') ||
    location.pathname.startsWith('/train/flashcards') ||
    location.pathname.startsWith('/train/faces') ||
    location.pathname.startsWith('/train/abstract');

  const navItems = [
    { to: '/', icon: LayoutGrid, label: t('controlCenter') },
    { to: '/monitoring', icon: Award, label: t('monitoring') },
    { to: '/statistics', icon: BarChart2, label: t('statistics') },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'qq', label: 'QQ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  if (isFocusMode) {
    return (
      <div className="min-h-screen bg-mnemo-bg text-mnemo-text-base flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-mnemo-primary hover:scale-110 transition-all shadow-xl"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="w-full max-w-5xl relative animate-slideIn">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mnemo-bg text-mnemo-text-base flex font-sans selection:bg-mnemo-primary/30 transition-colors duration-300">
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed z-30 border-r border-mnemo-border glass-light">
        <div className="p-10">
          <div className="flex items-center gap-3 text-mnemo-primary mb-1">
            <div className="p-2 bg-mnemo-primary/10 rounded-lg">
              <Brain size={32} strokeWidth={1.5} className="animate-pulse-slow" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-mnemo-text-base">MNEMO</span>
          </div>
          <p className="text-[10px] text-mnemo-primary/60 uppercase tracking-[0.25em] font-bold pl-1">
            NEURAL CORE 1.0
          </p>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon as React.ElementType}
              label={item.label}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-mnemo-border">
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full text-mnemo-text-muted hover:text-red-400 transition-all text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-3 px-4 py-3 w-full text-mnemo-primary hover:bg-mnemo-primary/10 rounded-xl transition-all text-sm font-bold"
            >
              <LogIn size={18} />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 min-h-screen relative">
        {/* Desktop Header Overlay */}
        <div className="hidden md:flex fixed top-10 right-10 items-center gap-4 z-40">
          {/* Language Switcher */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl glass-light border border-white/10 shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === lang.code
                  ? 'bg-mnemo-primary text-white shadow-lg'
                  : 'text-mnemo-text-muted hover:text-mnemo-text-base'
                  }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-mnemo-primary hover:scale-110 transition-all shadow-xl"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 glass py-1.5 pl-1.5 pr-4 rounded-2xl shadow-xl border-white/10">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-9 h-9 rounded-xl shadow-md border-2 border-mnemo-primary/20" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-mnemo-text-base leading-none uppercase tracking-tight">
                  {user.displayName?.split(' ')[0]}
                </span>
                <span className="text-[8px] font-bold text-mnemo-primary uppercase tracking-widest mt-0.5">Online</span>
              </div>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="px-6 h-12 bg-mnemo-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-mnemo-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Globe size={18} />
              <span>{t('login')}</span>
            </button>
          )}
        </div>

        <div className="max-w-[1400px] mx-auto p-6 md:p-14 mb-24 md:mb-0">
          {/* Mobile Header */}
          <header className="md:hidden flex flex-col gap-6 mb-10">
            <div className="flex justify-between items-center glass p-5 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mnemo-primary/10 rounded-xl flex items-center justify-center">
                  <Brain size={24} className="text-mnemo-primary" />
                </div>
                <span className="font-bold text-xl tracking-tight text-mnemo-text-base">MNEMO</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 glass-light rounded-xl flex items-center justify-center text-mnemo-primary"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {user ? (
                  <button onClick={logout} className="w-10 h-10 glass-light rounded-xl flex items-center justify-center text-red-500">
                    <LogOut size={18} />
                  </button>
                ) : (
                  <button onClick={loginWithGoogle} className="w-10 h-10 glass-light rounded-xl flex items-center justify-center text-mnemo-primary">
                    <LogIn size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all glass-light ${language === lang.code
                    ? 'bg-mnemo-primary text-white'
                    : 'text-mnemo-text-muted'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </header>

          <div className="animate-slideIn">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-2xl shadow-2xl flex items-center justify-around z-50 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 px-6 py-2 rounded-xl ${isActive ? 'text-mnemo-primary bg-mnemo-primary/10' : 'text-mnemo-text-muted'
                }`}
            >
              <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-1.5'} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
};