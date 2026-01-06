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
    return {
        name: log.date.split('-').slice(1).reverse().join('/'),
        weight: log.weight,
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

      {/* Main Combined Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-6">Peso vs. Calorias</h3>
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
                    <YAxis yAxisId="left" orientation="left" domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                    <Bar yAxisId="right" dataKey="calories" name="Calorias" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.3} />
                    <Area yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} fill="url(#colorWeight)" />
                </ComposedChart>
            </ResponsiveContainer>
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

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Histórico Detalhado</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-4 font-medium">Data</th>
                        <th className="px-6 py-4 font-medium">Peso</th>
                        <th className="px-6 py-4 font-medium">Água</th>
                        <th className="px-6 py-4 font-medium">Calorias</th>
                        <th className="px-6 py-4 font-medium">Dieta</th>
                        <th className="px-6 py-4 font-medium">Exercícios</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Reverse to show newest first for table */}
                    {[...data].reverse().map((row) => (
                        <tr key={row.date} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">
                                {row.date.split('-').reverse().join('/')}
                            </td>
                            <td className="px-6 py-4">
                                {row.weight ? `${row.weight} kg` : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.waterMl >= 2500 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {row.waterMl} ml
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {(row.runCalories || 0) + (row.gymCalories || 0)} kcal
                            </td>
                            <td className="px-6 py-4">
                                {Object.values(row.meals).filter(Boolean).length}/6
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {row.didRun && <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">Corrida</span>}
                                    {row.didGym && <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">Academia</span>}
                                    {!row.didRun && !row.didGym && <span className="text-slate-400">-</span>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;