import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Save, LayoutDashboard, BarChart3, Sparkles, X } from 'lucide-react';
import { getTodayString, fetchDailyLog, saveDailyLog } from './services/dataService';
import { generateHealthInsight } from './services/geminiService';
import { DailyLog } from './types';

// Components
import WaterTracker from './components/WaterTracker';
import DietTracker from './components/DietTracker';
import ExerciseTracker from './components/ExerciseTracker';
import WeightWidget from './components/WeightWidget';
import AnalyticsDashboard from './components/AnalyticsDashboard';

const App: React.FC = () => {
  const [date, setDate] = useState<string>(getTodayString());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');
  const [refreshDataTrigger, setRefreshDataTrigger] = useState(0);

  // AI Insight State
  const [showInsight, setShowInsight] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

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

  // Handler for AI Insight
  const handleGenerateInsight = async () => {
    if (!log) return;
    setLoadingInsight(true);
    setShowInsight(true);
    setInsightText('');
    
    // Save current state before generating insight to ensure AI gets latest data
    await saveDailyLog(log);
    
    const text = await generateHealthInsight(log);
    setInsightText(text);
    setLoadingInsight(false);
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

            {/* AI Coach Button (Mobile & Desktop) */}
            {activeTab === 'tracker' && (
                <button
                    onClick={handleGenerateInsight}
                    className="p-2 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    title="Pedir feedback do Coach IA"
                >
                    <Sparkles size={18} />
                    <span className="hidden sm:inline text-sm font-medium">Coach IA</span>
                </button>
            )}

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 ${activeTab !== 'tracker' ? 'hidden' : ''}`}
            >
                <Save size={18} />
                <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {activeTab === 'tracker' ? (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Tracker Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Row 1 */}
                    <div className="md:col-span-1">
                        <WeightWidget data={log} onChange={updateLog} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-2">
                        <WaterTracker data={log} onChange={updateLog} />
                    </div>
                    
                    {/* Row 2 */}
                    <div className="md:col-span-1 lg:col-span-2 h-full">
                        <DietTracker data={log} onChange={updateLog} />
                    </div>
                    <div className="md:col-span-1">
                        <ExerciseTracker data={log} onChange={updateLog} />
                    </div>
                </div>
            </div>
        ) : (
            <AnalyticsDashboard refreshTrigger={refreshDataTrigger} />
        )}

      </main>

      {/* AI Insight Modal */}
      {showInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} />
                        <h3 className="font-semibold">Coach HabitFlow</h3>
                    </div>
                    <button onClick={() => setShowInsight(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {loadingInsight ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500 animate-pulse">Analisando seu dia...</p>
                        </div>
                    ) : (
                        <div className="prose prose-slate prose-sm">
                            <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
                                {insightText}
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setShowInsight(false)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Mobile Tab Navigation (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:hidden z-30">
        <div className="grid grid-cols-2 gap-2">
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
        </div>
      </div>

    </div>
  );
};

export default App;