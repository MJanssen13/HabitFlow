import React, { useState } from 'react';
import { Scale, Settings, Check } from 'lucide-react';
import { DailyLog } from '../types';
import { getHeight, setHeight as persistHeight, classifyBMI } from '../services/settings';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const toneClasses: Record<string, string> = {
  blue: 'text-blue-500',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
  red: 'text-red-500',
};

const WeightWidget: React.FC<Props> = ({ data, onChange }) => {
  const [height, setHeightState] = useState<number>(() => getHeight());
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempHeight, setTempHeight] = useState<string>(String(height));

  const bmi = data.weight ? data.weight / (height * height) : null;
  const bmiInfo = bmi ? classifyBMI(bmi) : null;

  const saveHeight = () => {
    const value = parseFloat(tempHeight);
    if (value && value > 0.5 && value < 2.6) {
      persistHeight(value);
      setHeightState(value);
      setIsEditingHeight(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Scale size={20} />
          </div>
          <h3 className="font-semibold text-content">Peso Atual</h3>
        </div>
        <button
          onClick={() => {
            setTempHeight(String(height));
            setIsEditingHeight((v) => !v);
          }}
          className="text-faint hover:text-muted transition-colors p-1 hover:bg-elevated rounded-md"
          title="Definir altura"
        >
          <Settings size={18} />
        </button>
      </div>

      {isEditingHeight ? (
        <div className="my-2 bg-elevated p-4 rounded-xl border border-line animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-semibold text-muted uppercase mb-2">Altura (metros)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={tempHeight}
              onChange={(e) => setTempHeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveHeight()}
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="Ex: 1.79"
            />
            <button
              onClick={saveHeight}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Check size={16} /> OK
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between mt-2">
          <div className="flex items-end gap-2">
            <input
              type="number"
              step="0.1"
              value={data.weight ?? ''}
              onChange={(e) => onChange({ weight: parseFloat(e.target.value) || null })}
              placeholder="--"
              className="text-4xl font-bold text-content w-24 bg-transparent border-b-2 border-line focus:border-brand focus:outline-none transition-colors"
            />
            <span className="text-muted font-medium mb-2">kg</span>
          </div>

          {bmi && bmiInfo && (
            <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
              <span className={`text-2xl font-bold ${toneClasses[bmiInfo.tone]}`}>{bmi.toFixed(1)}</span>
              <span className="text-[11px] text-faint font-medium">IMC · {bmiInfo.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeightWidget;
