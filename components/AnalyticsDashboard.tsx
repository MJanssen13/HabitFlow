import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, ComposedChart, Line 
} from 'recharts';
import { fetchAllHistory } from '../services/dataService';
import { DailyLog } from '../types';
import { TrendingUp, Droplets, Utensils, Flame, Calendar } from 'lucide-react';

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
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>Comece a registrar seu dia para ver as análises.</p>
        </div>
    );
  }

  // Statistics Calculation
  const last30Days = data.slice(-30);
  const avgWeight = last30Days.reduce((acc, curr) => acc + (curr.weight || 0), 0) / (last30Days.filter(d => d.weight).length || 1);
  const totalCalories = last30Days.reduce((acc, curr) => acc + (curr.runCalories || 0) + (curr.gymCalories || 0), 0);
  const waterAvg = last30Days.reduce((acc, curr) => acc + curr.waterMl, 0) / last30Days.length;
  
  // Format Data for Charts
  const chartData = last30Days.map(log => {
    const dietScore = Object.values(log.meals).filter(Boolean).length;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-500 mb-2">
                <TrendingUp size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Peso Médio</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
                {avgWeight ? avgWeight.toFixed(1) : '--'} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Flame size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Calorias (30d)</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
                {totalCalories} <span className="text-sm font-normal text-slate-400">kcal</span>
            </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Droplets size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Água Média</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
                {Math.round(waterAvg)} <span className="text-sm font-normal text-slate-400">ml</span>
            </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <Utensils size={18} />
                <span className="text-xs font-semibold uppercase tracking-wider">Registros</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
                {data.length} <span className="text-sm font-normal text-slate-400">dias</span>
            </span>
        </div>
      </div>

      {/* Grid for Split Charts */}
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
                        
                        {/* Left Axis: Weight */}
                        <YAxis yAxisId="left" orientation="left" domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#6366f1', fontSize: 12}} />
                        
                        {/* Right Axis: IMC */}
                        <YAxis yAxisId="right" orientation="right" domain={['dataMin - 0.5', 'dataMax + 0.5']} axisLine={false} tickLine={false} tick={{fill: '#8b5cf6', fontSize: 12}} />
                        
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" />
                        
                        <Area yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} fill="url(#colorWeight)" />
                        <Line yAxisId="right" type="monotone" dataKey="imc" name="IMC" stroke="#8b5cf6" strokeWidth={2} dot={{r: 3}} />
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

      {/* Diet Consistency Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-6">Consistência na Dieta (Refeições/Dia)</h3>
        <div className="h-56">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="dietScore" name="Refeições na Dieta" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;