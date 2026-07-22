import React, { useEffect, useState } from 'react';
import { fetchAllHistory } from '../services/dataService';
import { downloadCsv } from '../services/exportCsv';
import { DailyLog } from '../types';
import { Calendar, Search, CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Download } from 'lucide-react';

const HistoryView: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [data, setData] = useState<DailyLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchAllHistory().then((logs) => setData(logs));
  }, [refreshTrigger]);

  const filteredAndSortedData = data
    .filter(
      (log) =>
        log.date.includes(searchTerm) ||
        (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => (sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  const getDietSummary = (meals: DailyLog['meals']) => {
    const healthy = Object.values(meals).filter((m) => m === 'on_diet').length;
    const off = Object.values(meals).filter((m) => m === 'off_diet').length;
    return { healthy, off };
  };

  const toggleSort = () => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-faint bg-surface rounded-2xl border border-line p-8">
        <Calendar size={48} className="mb-4 opacity-20" />
        <p>Nenhum registro encontrado no histórico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-xl border border-line shadow-card gap-4">
        <h2 className="font-semibold text-content flex items-center gap-2">
          <Calendar size={20} className="text-muted" />
          Histórico Completo
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="text"
              placeholder="Buscar data (AAAA-MM-DD)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-elevated border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 text-content placeholder:text-faint"
            />
          </div>
          <button
            onClick={() => downloadCsv(filteredAndSortedData, `habitflow-${new Date().toISOString().split('T')[0]}.csv`)}
            title="Exportar CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm text-left text-muted relative">
            <thead className="text-xs text-faint uppercase bg-elevated sticky top-0 z-10">
              <tr>
                <th
                  className="px-6 py-4 font-medium cursor-pointer hover:bg-line/50 transition-colors select-none"
                  onClick={toggleSort}
                  title="Clique para ordenar"
                >
                  <div className="flex items-center gap-1 text-brand">
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
            <tbody className="divide-y divide-line">
              {filteredAndSortedData.map((row) => {
                const dietStats = getDietSummary(row.meals);
                const calories = (row.runCalories || 0) + (row.gymCalories || 0);
                return (
                  <tr key={row.date} className="hover:bg-elevated transition-colors">
                    <td className="px-6 py-4 font-medium text-content whitespace-nowrap">
                      {row.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      {row.weight ? <span className="font-semibold text-content">{row.weight} kg</span> : <span className="text-faint">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.waterMl >= 2500 ? 'bg-blue-500/15 text-blue-500' : 'bg-elevated text-muted'}`}>
                        {row.waterMl} ml
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {calories > 0 ? <span className="text-orange-500 font-medium">{calories} kcal</span> : <span className="text-faint">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {dietStats.healthy === 0 && dietStats.off === 0 ? (
                          <span className="text-faint">-</span>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-emerald-500" title="Refeições Saudáveis">
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
                        {row.didRun && <span className="px-2 py-1 rounded text-xs bg-orange-500/15 text-orange-500 border border-orange-500/20">Corrida</span>}
                        {row.didGym && <span className="px-2 py-1 rounded text-xs bg-purple-500/15 text-purple-500 border border-purple-500/20">Academia</span>}
                        {!row.didRun && !row.didGym && <span className="text-faint text-xs">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedData.length === 0 && (
            <div className="p-8 text-center text-faint">Nenhum resultado encontrado para sua busca.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
