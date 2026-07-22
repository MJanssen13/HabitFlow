import React from 'react';
import { Utensils, Check } from 'lucide-react';
import { DailyLog, MealLog, MEAL_LABELS, MealStatus } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const DietTracker: React.FC<Props> = ({ data, onChange }) => {
  const setMealStatus = (key: keyof MealLog, status: MealStatus) => {
    const currentStatus = data.meals[key];
    // Se clicar no mesmo botão, volta para 'skipped'
    const newStatus = currentStatus === status ? 'skipped' : status;
    const newMeals = { ...data.meals, [key]: newStatus };
    onChange({ meals: newMeals });
  };

  const healthyCount = Object.values(data.meals).filter((s) => s === 'on_diet').length;
  const offDietCount = Object.values(data.meals).filter((s) => s === 'off_diet').length;

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Utensils size={20} />
          </div>
          <h3 className="font-semibold text-content">Dieta</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            {healthyCount} Saudáveis
          </span>
          {offDietCount > 0 && (
            <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
              {offDietCount} Inadequadas
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {(Object.keys(MEAL_LABELS) as Array<keyof MealLog>).map((key) => {
          const status = data.meals[key];
          return (
            <div key={key} className="flex items-center justify-between p-2 rounded-xl border border-line bg-elevated">
              <span className="text-sm font-medium text-content pl-2">{MEAL_LABELS[key]}</span>

              <div className="flex gap-1">
                {/* Botão Refeição Inadequada */}
                <button
                  onClick={() => setMealStatus(key, 'off_diet')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    status === 'off_diet'
                      ? 'bg-red-500/15 text-red-500 border-red-500/30 shadow-sm'
                      : 'bg-surface text-faint border-line hover:border-red-500/30 hover:text-red-400'
                  }`}
                  title="Refeição Inadequada"
                >
                  <Utensils size={14} className={status === 'off_diet' ? 'fill-current' : ''} />
                  Inadequada
                </button>

                {/* Botão Refeição Adequada */}
                <button
                  onClick={() => setMealStatus(key, 'on_diet')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    status === 'on_diet'
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shadow-sm'
                      : 'bg-surface text-faint border-line hover:border-emerald-500/30 hover:text-emerald-400'
                  }`}
                  title="Refeição Adequada"
                >
                  <Check size={14} strokeWidth={3} />
                  Adequada
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DietTracker;
