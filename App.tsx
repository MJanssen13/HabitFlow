import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, BarChart3, History as HistoryIcon, Trash2, Check, Loader2, Cloud, Moon, Sun } from 'lucide-react';
import { getTodayString, fetchDailyLog, saveDailyLog, clearDailyLog, getEmptyLog } from './services/dataService';
import { useTheme } from './hooks/useTheme';
import { DailyLog } from './types';

// Components (aba Diário — carregados imediatamente)
import WaterTracker from './components/WaterTracker';
import DietTracker from './components/DietTracker';
import ExerciseTracker from './components/ExerciseTracker';
import WeightWidget from './components/WeightWidget';
import DailySummary from './components/DailySummary';
import StreaksWidget from './components/StreaksWidget';
import NotesWidget from './components/NotesWidget';

// Abas pesadas (Recharts/tabelas) — carregadas sob demanda para reduzir o bundle inicial
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const HistoryView = lazy(() => import('./components/HistoryView'));

const TabFallback = () => (
  <div className="flex items-center justify-center h-64 text-faint">
    <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
  </div>
);

type Tab = 'tracker' | 'analytics' | 'history';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'tracker', label: 'Diário', icon: <LayoutDashboard size={20} /> },
  { id: 'analytics', label: 'Análises', icon: <BarChart3 size={20} /> },
  { id: 'history', label: 'Histórico', icon: <HistoryIcon size={20} /> },
];

const App: React.FC = () => {
  const [date, setDate] = useState<string>(getTodayString());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [activeTab, setActiveTab] = useState<Tab>('tracker');
  const [refreshDataTrigger, setRefreshDataTrigger] = useState(0);
  const { theme, toggleTheme } = useTheme();

  // Ref para controlar o timeout do autosave
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isToday = date === getTodayString();

  // Load data when date changes
  useEffect(() => {
    const loadData = async () => {
      setLog(null); // Reset UI while loading
      setSaveStatus('saved'); // Reseta status ao trocar de dia
      const data = await fetchDailyLog(date);
      setLog(data);
    };
    loadData();
  }, [date]);

  // Handler for clearing
  const handleClear = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os registros deste dia? Esta ação não pode ser desfeita.')) {
      return;
    }

    // Cancela qualquer salvamento pendente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    await clearDailyLog(date);
    setLog(getEmptyLog(date)); // Reseta a UI imediatamente
    setSaveStatus('saved');
    setRefreshDataTrigger((prev) => prev + 1);
  };

  // Handler for updating local state with AUTOSAVE
  const updateLog = (updates: Partial<DailyLog>) => {
    if (!log) return;

    // 1. Atualiza UI imediatamente para responsividade
    const newLog = { ...log, ...updates };
    setLog(newLog);

    // 2. Lógica de Autosave (Debounce)
    setSaveStatus('saving');

    // Limpa timer anterior se usuário continuar digitando/clicando
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Define novo timer para salvar após 1 segundo de inatividade
    saveTimeoutRef.current = setTimeout(async () => {
      await saveDailyLog(newLog);
      setSaveStatus('saved');
      setRefreshDataTrigger((prev) => prev + 1);
    }, 1000);
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split('T')[0]);
  };

  const formatDateLabel = (d: string) => {
    if (d === getTodayString()) return 'Hoje';
    return d.split('-').reverse().join('/');
  };

  return (
    <div className="min-h-screen bg-base text-content pb-24 sm:pb-10 transition-colors">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-line sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-extrabold shadow-lift">
              HF
            </div>
            <h1 className="font-bold text-lg hidden sm:block tracking-tight">HabitFlow</h1>
          </div>

          {/* Tab Navigation (Desktop) */}
          <div className="hidden sm:flex bg-elevated p-1 rounded-xl border border-line">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-surface text-brand shadow-card'
                    : 'text-muted hover:text-content'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Controls (Only visible on Tracker tab) */}
            {activeTab === 'tracker' && (
              <div className="flex items-center gap-1 bg-elevated border border-line rounded-full p-1 px-1.5">
                <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-surface hover:shadow-card rounded-full transition-all">
                  <ChevronLeft size={18} className="text-muted" />
                </button>
                <div className="text-xs font-semibold text-content min-w-[64px] text-center">
                  {formatDateLabel(date)}
                </div>
                <button
                  onClick={() => handleDateChange(1)}
                  disabled={isToday}
                  className="p-1 hover:bg-surface hover:shadow-card rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
                >
                  <ChevronRight size={18} className="text-muted" />
                </button>
              </div>
            )}

            {activeTab === 'tracker' && log && (
              <>
                {/* Status Indicator */}
                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    saveStatus === 'saving' ? 'bg-brand-soft text-brand' : 'bg-elevated text-muted'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="hidden sm:inline">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} className="text-emerald-500" />
                      <span className="hidden sm:inline">Salvo</span>
                      <Check size={14} className="sm:hidden text-emerald-500" />
                    </>
                  )}
                </div>

                <button
                  onClick={handleClear}
                  title="Limpar dados do dia"
                  className="p-2 text-faint hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              className="p-2 text-muted hover:text-content hover:bg-elevated rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'tracker' && (
          !log ? (
            <div className="flex items-center justify-center h-64 text-faint">
              <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DailySummary data={log} />

              <StreaksWidget refreshTrigger={refreshDataTrigger} />

              {/* Tracker Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-6 md:col-span-1">
                  <WeightWidget data={log} onChange={updateLog} />
                </div>

                <div className="md:col-span-1">
                  <WaterTracker data={log} onChange={updateLog} />
                </div>

                <div className="hidden lg:block lg:col-span-1">
                  <ExerciseTracker data={log} onChange={updateLog} />
                </div>

                <div className="md:col-span-2 lg:col-span-2 h-full">
                  <DietTracker data={log} onChange={updateLog} />
                </div>

                <div className="md:col-span-2 lg:hidden">
                  <ExerciseTracker data={log} onChange={updateLog} />
                </div>
              </div>

              <NotesWidget data={log} onChange={updateLog} />
            </div>
          )
        )}

        {activeTab === 'analytics' && (
          <Suspense fallback={<TabFallback />}>
            <AnalyticsDashboard refreshTrigger={refreshDataTrigger} />
          </Suspense>
        )}

        {activeTab === 'history' && (
          <Suspense fallback={<TabFallback />}>
            <HistoryView refreshTrigger={refreshDataTrigger} />
          </Suspense>
        )}
      </main>

      {/* Mobile Tab Navigation (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-line p-2 sm:hidden z-30">
        <div className="grid grid-cols-3 gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === tab.id ? 'text-brand bg-brand-soft' : 'text-faint'
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
