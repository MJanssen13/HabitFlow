import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, ComposedChart, Line 
} from 'recharts';
import { fetchAllHistory } from '../services/dataService';
import { DailyLog } from '../types';
import { TrendingUp, TrendingDown, Droplets, Utensils, Flame, Calendar as CalendarIcon, Target, Minus, ChevronLeft, ChevronRight, Dumbbell, Footprints, Check, Activity } from 'lucide-react';

// --- Sub-componentes para o Calendário ---

interface MiniRingProps {
    percentage: number;
    color: string;
    showCheckOnComplete?: boolean;
    size?: number;
    strokeWidth?: number;
}

const MiniRingChart: React.FC<MiniRingProps> = ({ 
    percentage, 
    color, 
    showCheckOnComplete, 
    size = 40, 
    strokeWidth = 5 
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    const isComplete = percentage >= 100;
  
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {showCheckOnComplete && isComplete ? (
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                <Check size={size * 0.4} strokeWidth={4} />
            </div>
        ) : (
             <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-600" style={{ fontSize: size * 0.25 }}>
                {Math.round(percentage)}%
             </div>
        )}
      </div>
    );
};

const CalendarWidget: React.FC<{ logs: DailyLog[] }> = ({ logs }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [waterGoal, setWaterGoal] = useState(3000);

    useEffect(() => {
        const saved = localStorage.getItem('habitflow_water_goal');
        if (saved) setWaterGoal(parseInt(saved, 10));
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Create grid array
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="bg-white p-3 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                    <CalendarIcon size={18} className="text-slate-500 md:w-5 md:h-5"/>
                    Calendário
                </h3>
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft size={18}/></button>
                    <span className="font-medium text-slate-700 min-w-[90px] md:min-w-[120px] text-center text-sm md:text-base">{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronRight size={18}/></button>
                </div>
            </div>

            <div className="w-full">
                {/* Cabeçalho dias da semana */}
                <div className="grid grid-cols-7 gap-px mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] md:text-xs font-semibold text-slate-400 uppercase py-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid do Calendário */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                    {days.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="bg-white min-h-[70px] md:min-h-[120px]" />;
                        
                        // Find log for this day
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const log = logs.find(l => l.date === dateStr);

                        // Calculations
                        let waterPct = 0;
                        let dietPct = 0;
                        
                        if (log) {
                            waterPct = (log.waterMl / waterGoal) * 100;
                            let healthy = 0;
                            let total = 0;
                            Object.values(log.meals).forEach(status => {
                                if (status === 'on_diet') { healthy++; total++; }
                                else if (status === 'off_diet') { total++; }
                            });
                            dietPct = total > 0 ? (healthy / total) * 100 : 0;
                        }

                        return (
                            <div key={dateStr} className="bg-white min-h-[70px] md:min-h-[120px] p-0.5 md:p-2 flex flex-col hover:bg-slate-50 transition-colors group relative">
                                <span className={`text-[10px] md:text-sm font-medium mb-0.5 ml-1 ${log ? 'text-slate-700' : 'text-slate-300'}`}>{day}</span>
                                
                                {log && (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-1">
                                        
                                        {/* Versão Mobile (Micro) */}
                                        <div className="grid grid-cols-2 gap-0.5 w-full place-items-center md:hidden">
                                            <MiniRingChart percentage={waterPct} color="#3b82f6" size={20} strokeWidth={3} />
                                            <MiniRingChart percentage={dietPct} color="#10b981" size={20} strokeWidth={3} />
                                            
                                            <div className="flex items-center justify-center h-5 w-5">
                                                {log.didRun && (
                                                    <div className="text-orange-500">
                                                        <Footprints size={12} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-center h-5 w-5">
                                                {log.didGym && (
                                                    <div className="text-purple-600">
                                                        <Dumbbell size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Versão Desktop (Normal) */}
                                        <div className="hidden md:grid grid-cols-2 gap-2">
                                            <div className="flex items-center justify-center" title={`Água: ${log.waterMl}ml (${Math.round(waterPct)}%)`}>
                                                <MiniRingChart percentage={waterPct} color="#3b82f6" showCheckOnComplete={true} size={40} strokeWidth={5} />
                                            </div>
                                            <div className="flex items-center justify-center" title={`Adesão à dieta: ${Math.round(dietPct)}%`}>
                                                <MiniRingChart percentage={dietPct} color="#10b981" showCheckOnComplete={false} size={40} strokeWidth={5} />
                                            </div>
                                            <div className="flex items-center justify-center">
                                                {log.didRun ? (
                                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center border border-orange-200" title="Corrida realizada">
                                                        <Footprints size={18} />
                                                    </div>
                                                ) : <div className="w-10 h-10" />}
                                            </div>
                                            <div className="flex items-center justify-center">
                                                {log.didGym ? (
                                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center border border-purple-200" title="Academia realizada">
                                                        <Dumbbell size={18} />
                                                    </div>
                                                ) : <div className="w-10 h-10" />}
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Legenda Atualizada */}
            <div className="flex flex-wrap gap-2 md:gap-4 mt-4 text-[10px] md:text-xs text-slate-500 justify-center">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-blue-500"></div>
                    <span>Água</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-emerald-500"></div>
                    <span>Dieta</span>
                </div>
                <div className="flex items-center gap-1">
                    <Footprints size={10} className="text-orange-600 md:hidden" />
                    <div className="hidden md:block bg-orange-100 text-orange-600 p-0.5 rounded">
                        <Footprints size={12} />
                    </div>
                    <span>Corrida</span>
                </div>
                <div className="flex items-center gap-1">
                    <Dumbbell size={10} className="text-purple-600 md:hidden" />
                    <div className="hidden md:block bg-purple-100 text-purple-600 p-0.5 rounded">
                        <Dumbbell size={12} />
                    </div>
                    <span>Academia</span>
                </div>
            </div>
        </div>
    );
}

// --- Componente Principal ---

const AnalyticsDashboard: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DailyLog[]>([]);
  const HEIGHT = 1.79; // Mesma altura usada no WeightWidget

  useEffect(() => {
    fetchAllHistory().then((logs) => {
        // Sort by date ascending
        setData(logs.sort((a, b) => a.date.localeCompare(b.date)));
    });
  }, [refreshTrigger]);

  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
            <CalendarIcon size={48} className="mb-4 opacity-20" />
            <p>Comece a registrar seu dia para ver as análises.</p>
        </div>
    );
  }

  // Statistics Calculation
  const last30Days = data.slice(-30);
  const avgWeight = last30Days.reduce((acc, curr) => acc + (curr.weight || 0), 0) / (last30Days.filter(d => d.weight).length || 1);
  const totalCalories = last30Days.reduce((acc, curr) => acc + (curr.runCalories || 0) + (curr.gymCalories || 0), 0);
  const waterAvg = last30Days.reduce((acc, curr) => acc + curr.waterMl, 0) / last30Days.length;
  
  // Cálculo de Variação de Peso
  const weightRecords = data.filter(d => d.weight !== null && d.weight > 0);
  let weightDiff = 0;
  let weightDiffPct = 0;
  let hasVariation = false;

  if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0].weight!;
      const lastWeight = weightRecords[weightRecords.length - 1].weight!;
      weightDiff = lastWeight - firstWeight;
      weightDiffPct = (weightDiff / firstWeight) * 100;
      hasVariation = true;
  }

  const renderWeightVariation = () => {
    if (!hasVariation) return <span className="text-xs text-slate-400 mt-1 block">Sem variação registrada</span>;
    
    const isGain = weightDiff > 0;
    const isLoss = weightDiff < 0;
    const ColorIcon = isGain ? TrendingUp : (isLoss ? TrendingDown : Minus);
    const colorClass = isGain ? 'text-red-500' : (isLoss ? 'text-emerald-500' : 'text-slate-400');
    const bgClass = isGain ? 'bg-red-50' : (isLoss ? 'bg-emerald-50' : 'bg-slate-50');
    
    return (
        <div className={`flex items-center gap-1 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-md w-fit ${colorClass} ${bgClass}`} title="Variação total do histórico">
            <ColorIcon size={12} />
            <span>
                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg ({Math.abs(weightDiffPct).toFixed(1)}%)
            </span>
        </div>
    );
  };
  
  // Adesão à Dieta
  let totalHealthyMeals = 0;
  let totalRealizedMeals = 0;

  last30Days.forEach(log => {
      Object.values(log.meals).forEach(status => {
          if (status === 'on_diet') {
              totalHealthyMeals++;
              totalRealizedMeals++;
          } else if (status === 'off_diet') {
              totalRealizedMeals++;
          }
      });
  });

  const dietAdherence = totalRealizedMeals > 0 
      ? Math.round((totalHealthyMeals / totalRealizedMeals) * 100) 
      : 0;

  // NOVO CÁLCULO: Frequência de Exercícios
  const activeDaysCount = data.filter(d => d.didRun || d.didGym).length;
  const activePercentage = data.length > 0 ? Math.round((activeDaysCount / data.length) * 100) : 0;

  // Format Data for Charts
  const chartData = last30Days.map(log => {
    const dietScore = Object.values(log.meals).filter(m => m === 'on_diet').length;
    const imc = log.weight ? log.weight / (HEIGHT * HEIGHT) : null;
    
    return {
        name: log.date.split('-').slice(1).reverse().join('/'),
        weight: log.weight,
        imc: imc ? parseFloat(imc.toFixed(2)) : null,
        water: log.waterMl,
        calories: (log.runCalories || 0) + (log.gymCalories || 0),
        dietScore: dietScore
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-indigo-500 mb-2">
                    <TrendingUp size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Peso Médio</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {avgWeight ? avgWeight.toFixed(1) : '--'} <span className="text-sm font-normal text-slate-400">kg</span>
                </span>
            </div>
            {renderWeightVariation()}
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Flame size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Calorias (30d)</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {totalCalories} <span className="text-sm font-normal text-slate-400">kcal</span>
                </span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Droplets size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Água Média</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {Math.round(waterAvg)} <span className="text-sm font-normal text-slate-400">ml</span>
                </span>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Target size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Adesão Dieta</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {dietAdherence}% <span className="text-sm font-normal text-slate-400">foco</span>
                </span>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <CalendarIcon size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Registros</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {data.length} <span className="text-sm font-normal text-slate-400">dias</span>
                </span>
            </div>
        </div>

        {/* Novo Card: Frequência Ativa */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 text-fuchsia-500 mb-2">
                    <Activity size={18} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Dias Ativos</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">
                    {activeDaysCount} <span className="text-sm font-normal text-slate-400">dias</span>
                </span>
            </div>
             <div className="mt-1">
                 <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full" title="Porcentagem de dias com exercício no histórico">
                    {activePercentage}% dos dias
                 </span>
            </div>
        </div>
      </div>

      {/* Grid Charts: Weight & Calories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight & IMC Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Evolução de Peso e IMC</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis yAxisId="left" orientation="left" domain={['dataMin - 2', 'dataMax + 10']} axisLine={false} tickLine={false} tick={{fill: '#6366f1', fontSize: 12}} />
                        <YAxis yAxisId="right" orientation="right" domain={['dataMin - 4', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fill: '#ec4899', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" />
                        <Area yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} fill="url(#colorWeight)" />
                        <Line yAxisId="right" type="monotone" dataKey="imc" name="IMC" stroke="#ec4899" strokeWidth={2} dot={{r: 3}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Calories Burned Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Calorias Queimadas (Exercícios)</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" />
                        <Bar dataKey="calories" name="Kcal Queimadas" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Calendar Widget (Posicionado abaixo dos gráficos de peso/calorias) */}
      <CalendarWidget logs={data} />

      {/* Diet Consistency Chart (Agora em largura total abaixo do calendário) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Consistência na Dieta (Refeições Saudáveis)</h3>
            <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="dietScore" name="Refeições Adequadas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;