import React, { useEffect, useState } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line,
} from 'recharts';
import { fetchAllHistory } from '../services/dataService';
import { getHeight, getWaterGoal } from '../services/settings';
import { useIsDark } from '../hooks/useTheme';
import { DailyLog } from '../types';
import { TrendingUp, TrendingDown, Droplets, Flame, Calendar as CalendarIcon, Target, Minus, ChevronLeft, ChevronRight, Dumbbell, Footprints, Check, Activity } from 'lucide-react';

// --- Sub-componentes para o Calendário ---

interface MiniRingProps {
  percentage: number;
  color: string;
  showCheckOnComplete?: boolean;
  size?: number;
  strokeWidth?: number;
}

const MiniRingChart: React.FC<MiniRingProps> = ({ percentage, color, showCheckOnComplete, size = 40, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const isComplete = percentage >= 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(var(--c-line))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      {showCheckOnComplete && isComplete ? (
        <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
          <Check size={size * 0.4} strokeWidth={4} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-bold text-muted" style={{ fontSize: size * 0.25 }}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

const CalendarWidget: React.FC<{ logs: DailyLog[] }> = ({ logs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const waterGoal = getWaterGoal();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="bg-surface p-3 md:p-6 rounded-2xl border border-line shadow-card">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="font-semibold text-content flex items-center gap-2 text-sm md:text-base">
          <CalendarIcon size={18} className="text-muted md:w-5 md:h-5" />
          Calendário
        </h3>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-elevated rounded-full text-muted"><ChevronLeft size={18} /></button>
          <span className="font-medium text-content min-w-[90px] md:min-w-[120px] text-center text-sm md:text-base">{monthNames[month]} {year}</span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-elevated rounded-full text-muted"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-7 gap-px mb-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] md:text-xs font-semibold text-faint uppercase py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-line rounded-lg overflow-hidden border border-line">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-surface min-h-[85px] md:min-h-[120px]" />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const log = logs.find((l) => l.date === dateStr);

            let waterPct = 0;
            let dietPct = 0;

            if (log) {
              waterPct = (log.waterMl / waterGoal) * 100;
              let healthy = 0;
              let total = 0;
              Object.values(log.meals).forEach((status) => {
                if (status === 'on_diet') { healthy++; total++; }
                else if (status === 'off_diet') { total++; }
              });
              dietPct = total > 0 ? (healthy / total) * 100 : 0;
            }

            return (
              <div key={dateStr} className="bg-surface min-h-[85px] md:min-h-[120px] p-0.5 md:p-2 flex flex-col hover:bg-elevated transition-colors group relative">
                <span className={`text-[10px] md:text-sm font-medium mb-0.5 ml-1 ${log ? 'text-content' : 'text-faint'}`}>{day}</span>

                {log && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    {/* Versão Mobile (Micro) */}
                    <div className="flex flex-col items-center justify-center gap-1 w-full md:hidden">
                      <MiniRingChart percentage={waterPct} color="#3b82f6" size={28} strokeWidth={4} />
                      <MiniRingChart percentage={dietPct} color="#10b981" size={28} strokeWidth={4} />
                      <div className="flex items-center gap-1 mt-0.5 h-3">
                        {log.didRun && <Footprints size={12} className="text-orange-500" />}
                        {log.didGym && <Dumbbell size={12} className="text-purple-500" />}
                      </div>
                    </div>

                    {/* Versão Desktop */}
                    <div className="hidden md:grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-center" title={`Água: ${log.waterMl}ml (${Math.round(waterPct)}%)`}>
                        <MiniRingChart percentage={waterPct} color="#3b82f6" showCheckOnComplete size={40} strokeWidth={5} />
                      </div>
                      <div className="flex items-center justify-center" title={`Adesão à dieta: ${Math.round(dietPct)}%`}>
                        <MiniRingChart percentage={dietPct} color="#10b981" size={40} strokeWidth={5} />
                      </div>
                      <div className="flex items-center justify-center">
                        {log.didRun ? (
                          <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center border border-orange-500/20" title="Corrida realizada">
                            <Footprints size={18} />
                          </div>
                        ) : <div className="w-10 h-10" />}
                      </div>
                      <div className="flex items-center justify-center">
                        {log.didGym ? (
                          <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center border border-purple-500/20" title="Academia realizada">
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

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 md:gap-4 mt-4 text-[10px] md:text-xs text-muted justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-blue-500"></div>
          <span>Água</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-emerald-500"></div>
          <span>Dieta</span>
        </div>
        <div className="flex items-center gap-1">
          <Footprints size={12} className="text-orange-500" />
          <span>Corrida</span>
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell size={12} className="text-purple-500" />
          <span>Academia</span>
        </div>
      </div>
    </div>
  );
};

// --- Card de resumo ---
const StatCard: React.FC<{ icon: React.ReactNode; tint: string; label: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ icon, tint, label, children, footer }) => (
  <div className="bg-surface p-4 rounded-xl border border-line shadow-card flex flex-col justify-between">
    <div>
      <div className={`flex items-center gap-2 mb-2 ${tint}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold text-content">{children}</span>
    </div>
    {footer}
  </div>
);

// --- Componente Principal ---

const AnalyticsDashboard: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DailyLog[]>([]);
  const isDark = useIsDark();
  const HEIGHT = getHeight();

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const tickColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
    boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.15)',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

  useEffect(() => {
    fetchAllHistory().then((logs) => {
      setData(logs.sort((a, b) => a.date.localeCompare(b.date)));
    });
  }, [refreshTrigger]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-faint bg-surface rounded-2xl border border-line p-8">
        <CalendarIcon size={48} className="mb-4 opacity-20" />
        <p>Comece a registrar seu dia para ver as análises.</p>
      </div>
    );
  }

  const last30Days = data.slice(-30);
  const avgWeight = last30Days.reduce((acc, curr) => acc + (curr.weight || 0), 0) / (last30Days.filter((d) => d.weight).length || 1);
  const totalCalories = last30Days.reduce((acc, curr) => acc + (curr.runCalories || 0) + (curr.gymCalories || 0), 0);
  const waterAvg = last30Days.reduce((acc, curr) => acc + curr.waterMl, 0) / last30Days.length;

  const weightRecords = data.filter((d) => d.weight !== null && d.weight > 0);
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
    if (!hasVariation) return <span className="text-xs text-faint mt-1 block">Sem variação registrada</span>;

    const isGain = weightDiff > 0;
    const isLoss = weightDiff < 0;
    const ColorIcon = isGain ? TrendingUp : isLoss ? TrendingDown : Minus;
    const colorClass = isGain ? 'text-red-500' : isLoss ? 'text-emerald-500' : 'text-faint';
    const bgClass = isGain ? 'bg-red-500/10' : isLoss ? 'bg-emerald-500/10' : 'bg-elevated';

    return (
      <div className={`flex items-center gap-1 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-md w-fit ${colorClass} ${bgClass}`} title="Variação total do histórico">
        <ColorIcon size={12} />
        <span>{weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}kg ({Math.abs(weightDiffPct).toFixed(1)}%)</span>
      </div>
    );
  };

  let totalHealthyMeals = 0;
  let totalRealizedMeals = 0;
  last30Days.forEach((log) => {
    Object.values(log.meals).forEach((status) => {
      if (status === 'on_diet') { totalHealthyMeals++; totalRealizedMeals++; }
      else if (status === 'off_diet') { totalRealizedMeals++; }
    });
  });
  const dietAdherence = totalRealizedMeals > 0 ? Math.round((totalHealthyMeals / totalRealizedMeals) * 100) : 0;

  const activeDaysCount = data.filter((d) => d.didRun || d.didGym).length;
  const activePercentage = data.length > 0 ? Math.round((activeDaysCount / data.length) * 100) : 0;

  const chartData = last30Days.map((log) => {
    const dietScore = Object.values(log.meals).filter((m) => m === 'on_diet').length;
    const imc = log.weight ? log.weight / (HEIGHT * HEIGHT) : null;
    return {
      name: log.date.split('-').slice(1).reverse().join('/'),
      weight: log.weight,
      imc: imc ? parseFloat(imc.toFixed(2)) : null,
      water: log.waterMl,
      calories: (log.runCalories || 0) + (log.gymCalories || 0),
      dietScore,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={<TrendingUp size={18} />} tint="text-indigo-500" label="Peso Médio" footer={renderWeightVariation()}>
          {avgWeight ? avgWeight.toFixed(1) : '--'} <span className="text-sm font-normal text-faint">kg</span>
        </StatCard>
        <StatCard icon={<Flame size={18} />} tint="text-orange-500" label="Calorias (30d)">
          {totalCalories} <span className="text-sm font-normal text-faint">kcal</span>
        </StatCard>
        <StatCard icon={<Droplets size={18} />} tint="text-blue-500" label="Água Média">
          {Math.round(waterAvg)} <span className="text-sm font-normal text-faint">ml</span>
        </StatCard>
        <StatCard icon={<Target size={18} />} tint="text-emerald-500" label="Adesão Dieta">
          {dietAdherence}% <span className="text-sm font-normal text-faint">foco</span>
        </StatCard>
        <StatCard icon={<CalendarIcon size={18} />} tint="text-muted" label="Registros">
          {data.length} <span className="text-sm font-normal text-faint">dias</span>
        </StatCard>
        <StatCard
          icon={<Activity size={18} />}
          tint="text-fuchsia-500"
          label="Dias Ativos"
          footer={
            <div className="mt-1">
              <span className="text-xs font-medium text-muted bg-elevated px-2 py-1 rounded-full" title="Porcentagem de dias com exercício">
                {activePercentage}% dos dias
              </span>
            </div>
          }
        >
          {activeDaysCount} <span className="text-sm font-normal text-faint">dias</span>
        </StatCard>
      </div>

      {/* Grid Charts: Weight & Calories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-card">
          <h3 className="font-semibold text-content mb-6">Evolução de Peso e IMC</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" orientation="left" domain={['dataMin - 2', 'dataMax + 10']} axisLine={false} tickLine={false} tick={{ fill: '#6366f1', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={['dataMin - 4', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fill: '#ec4899', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" />
                <Area yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} fill="url(#colorWeight)" />
                <Line yAxisId="right" type="monotone" dataKey="imc" name="IMC" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-line shadow-card">
          <h3 className="font-semibold text-content mb-6">Calorias Queimadas (Exercícios)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                <Tooltip cursor={{ fill: gridStroke }} contentStyle={tooltipStyle} />
                <Legend iconType="circle" />
                <Bar dataKey="calories" name="Kcal Queimadas" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <CalendarWidget logs={data} />

      <div className="bg-surface p-6 rounded-2xl border border-line shadow-card">
        <h3 className="font-semibold text-content mb-6">Consistência na Dieta (Refeições Saudáveis)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={10} />
              <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
              <Tooltip cursor={{ fill: gridStroke }} contentStyle={tooltipStyle} />
              <Bar dataKey="dietScore" name="Refeições Adequadas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
