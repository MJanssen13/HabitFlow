import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { fetchAllHistory } from '../services/dataService';
import { DailyLog } from '../types';

const HistoryChart: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DailyLog[]>([]);

  useEffect(() => {
    fetchAllHistory().then(setData);
  }, [refreshTrigger]);

  if (data.length === 0) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400">
            Nenhum dado registrado ainda.
        </div>
    );
  }

  // Format date for X-Axis (e.g., "12/10")
  const chartData = data.slice(-7).map(log => ({ // Last 7 entries
    name: log.date.split('-').slice(1).reverse().join('/'),
    weight: log.weight,
    totalCalories: (log.runCalories || 0) + (log.gymCalories || 0),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weight Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-6">Evolução do Peso</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-6">Queima de Calorias</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                 cursor={{fill: '#f1f5f9'}}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="totalCalories" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoryChart;