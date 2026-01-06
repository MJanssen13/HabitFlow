import React from 'react';
import { Scale } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const WeightWidget: React.FC<Props> = ({ data, onChange }) => {
  const HEIGHT = 1.79;
  
  const calculateIMC = () => {
    if (!data.weight) return null;
    const imc = data.weight / (HEIGHT * HEIGHT);
    // Exibe com 2 casas decimais conforme solicitado
    return imc.toFixed(2);
  };

  const imc = calculateIMC();

  // Helper para cor do texto baseado no IMC
  const getImcColor = (val: string | null) => {
    if (!val) return 'text-slate-400';
    const num = parseFloat(val);
    if (num < 18.5) return 'text-blue-500'; // Abaixo
    if (num < 25) return 'text-emerald-500'; // Normal
    if (num < 30) return 'text-orange-500'; // Sobrepeso
    return 'text-red-500'; // Obesidade
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Scale size={20} />
        </div>
        <h3 className="font-semibold text-slate-800">Peso Atual</h3>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-end gap-2">
            <input 
                type="number" 
                step="0.1"
                value={data.weight || ''}
                onChange={(e) => onChange({ weight: parseFloat(e.target.value) || null })}
                placeholder="--"
                className="text-4xl font-bold text-slate-800 w-24 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <span className="text-slate-500 font-medium mb-2">kg</span>
        </div>

        {imc && (
            <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
                <span className={`text-2xl font-bold ${getImcColor(imc)}`}>{imc}</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">IMC (1.79m)</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default WeightWidget;