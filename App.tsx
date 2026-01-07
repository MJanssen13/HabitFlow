import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, LayoutDashboard, BarChart3, History as HistoryIcon, Trash2 } from 'lucide-react';
import { getTodayString, fetchDailyLog, saveDailyLog, clearDailyLog, getEmptyLog } from './services/dataService';
import { DailyLog } from './types';

// Components
import WaterTracker from './components/WaterTracker';
import DietTracker from './components/DietTracker';
import ExerciseTracker from './components/ExerciseTracker';
import WeightWidget from './components/WeightWidget';
import SleepTracker from './components/SleepTracker';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [date, setDate] = useState<string>(getTodayString());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'history'>('tracker');
  const [refreshDataTrigger, setRefreshDataTrigger] = useState(0);

  // Load data when date changes
  useEffect(() => {
    const loadData = async () => {
      setLog(null); // Reset UI while loading
      const data = await fetchDailyLog(date);
      setLog(data);
    };
    loadData();
  }, [date]);

  // Handler for saving
  const handleSave = async () => {
    if (!log) return;
    setIsSaving(true);
    await saveDailyLog(log);
    setIsSaving(false);
    setRefreshDataTrigger(prev => prev + 1);
  };

  // Handler for clearing
  const handleClear = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os registros deste dia? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    setIsSaving(true); // Usa o estado de saving para loading visual
    await clearDailyLog(date);
    setLog(getEmptyLog(date)); // Reseta a UI imediatamente
    setIsSaving(false);
    setRefreshDataTrigger(prev => prev + 1);
  };

  // Handler for updating local state
  const updateLog = (updates: Partial<DailyLog>) => {
    if (!log) return;
    setLog({ ...log, ...updates });
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split('T')[0]);
  };

  if (!log) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 sm:pb-10">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-lg">
              HF
            </div>
            <h1 className="font-bold text-lg hidden sm:block tracking-tight">HabitFlow</h1>
          </div>

          {/* Tab Navigation (Desktop) */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'tracker' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Diário
             </button>
             <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Análises
             </button>
             <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Histórico
             </button>
          </div>

          <div className="flex items-center gap-3">
              {/* Date Controls (Only visible on Tracker tab) */}
              {activeTab === 'tracker' && (
                <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 px-2">
                    <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-white hover:shadow-sm rounded-full transition-all">
                    <ChevronLeft size={18} className="text-slate-600" />
                    </button>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 min-w-[80px] justify-center uppercase tracking-wide">
                    {date.split('-').reverse().join('/')}
                    </div>
                    <button onClick={() => handleDateChange(1)} className="p-1 hover:bg-white hover:shadow-sm rounded-full transition-all">
                    <ChevronRight size={18} className="text-slate-600" />
                    </button>
                </div>
              )}

            {activeTab === 'tracker' && (
                <>
                    <button 
                        onClick={handleClear}
                        disabled={isSaving}
                        title="Limpar dados do dia"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {activeTab === 'tracker' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Tracker Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Dados Vitais */}
                    <div className="flex flex-col gap-6 md:col-span-1">
                        <WeightWidget data={log} onChange={updateLog} />
                        <SleepTracker data={log} onChange={updateLog} />
                    </div>

                    {/* Coluna 2: Água e Exercícios */}
                    <div className="md:col-span-1">
                        <WaterTracker data={log} onChange={updateLog} />
                    </div>
                    {/* Alterado de md:hidden para hidden, garantindo que só apareça em telas Large */}
                    <div className="hidden lg:block lg:col-span-1">
                        <ExerciseTracker data={log} onChange={updateLog} />
                    </div>

                    {/* Coluna 3 (Wide): Dieta e Exercícios Mobile */}
                    <div className="md:col-span-2 lg:col-span-2 h-full">
                        <DietTracker data={log} onChange={updateLog} />
                    </div>
                    {/* Exercício aparece aqui em telas médias (MD) para balancear o grid */}
                    <div className="md:col-span-2 lg:hidden">
                        <ExerciseTracker data={log} onChange={updateLog} />
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'analytics' && (
            <AnalyticsDashboard refreshTrigger={refreshDataTrigger} />
        )}

        {activeTab === 'history' && (
            <HistoryView refreshTrigger={refreshDataTrigger} />
        )}

      </main>

      {/* Mobile Tab Navigation (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:hidden z-30">
        <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={() => setActiveTab('tracker')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${activeTab === 'tracker' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
            >
                <LayoutDashboard size={20} />
                <span className="text-xs font-medium mt-1">Diário</span>
            </button>
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${activeTab === 'analytics' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
            >
                <BarChart3 size={20} />
                <span className="text-xs font-medium mt-1">Análises</span>
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${activeTab === 'history' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
            >
                <HistoryIcon size={20} />
                <span className="text-xs font-medium mt-1">Histórico</span>
            </button>
        </div>
      </div>

    </div>
  );
};

export default App;