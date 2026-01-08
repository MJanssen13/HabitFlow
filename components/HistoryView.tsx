import React, { useEffect, useState } from 'react';
import { fetchAllHistory } from '../services/dataService';
import { DailyLog } from '../types';
import { Calendar, Search, CheckCircle2, AlertCircle, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const HistoryView: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DailyLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchAllHistory().then((logs) => {
        // Carrega os dados brutos, a ordenação será feita na renderização
        setData(logs);
    });
  }, [refreshTrigger]);

  const filteredAndSortedData = data
    .filter(log =>
        log.date.includes(searchTerm) ||
        (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.date.localeCompare(b.date);
        } else {
            return b.date.localeCompare(a.date);
        }
    });

  const getDietSummary = (meals: DailyLog['meals']) => {
      const healthy = Object.values(meals).filter(m => m === 'on_diet').length;
      const off = Object.values(meals).filter(m => m === 'off_diet').length;
      return { healthy, off };
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (data.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-slate-100 p-8">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>Nenhum registro encontrado no histórico.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-slate-500"/>
            Histórico Completo
        </h2>
        <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                placeholder="Buscar data (AAAA-MM-DD)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-600"
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-sm text-left text-slate-600 relative">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th 
                            className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                            onClick={toggleSort}
                            title="Clique para ordenar"
                        >
                            <div className="flex items-center gap-1 text-indigo-600">
                                Data
                                {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </div>
                        </th>
                        <th className="px-6 py-4 font-medium">Peso</th>
                        <th className="px-6 py-4 font-medium">Água</th>
                        <th className="px-6 py-4 font-medium">Calorias</th>
                        <th className="px-6 py-4 font-medium">Dieta</th>
                        <th className="px-6 py-4 font-medium">Atividades</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredAndSortedData.map((row) => {
                        const dietStats = getDietSummary(row.meals);
                        return (
                        <tr key={row.date} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                {row.date.split('-').reverse().join('/')}
                            </td>
                            <td className="px-6 py-4">
                                {row.weight ? <span className="font-semibold text-slate-700">{row.weight} kg</span> : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.waterMl >= 2500 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {row.waterMl} ml
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {(row.runCalories || 0) + (row.gymCalories || 0) > 0 ? (
                                    <span className="text-orange-600 font-medium">
                                        {(row.runCalories || 0) + (row.gymCalories || 0)} kcal
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {dietStats.healthy === 0 && dietStats.off === 0 ? (
                                        <span className="text-slate-300">-</span>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1 text-emerald-600" title="Refeições Saudáveis">
                                                <CheckCircle2 size={16} />
                                                <span className="font-medium">{dietStats.healthy}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-red-500" title="Refeições Inadequadas">
                                                <AlertCircle size={16} />
                                                <span className="font-medium">{dietStats.off}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2 flex-wrap">
                                    {row.didRun && <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700 border border-orange-200">Corrida</span>}
                                    {row.didGym && <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">Academia</span>}
                                    {!row.didRun && !row.didGym && <span className="text-slate-400 text-xs">-</span>}
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
            {filteredAndSortedData.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    Nenhum resultado encontrado para sua busca.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;