import React from 'react';
import { StickyNote } from 'lucide-react';
import { DailyLog } from '../types';

interface Props {
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const NotesWidget: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
          <StickyNote size={20} />
        </div>
        <h3 className="font-semibold text-content">Notas do dia</h3>
      </div>
      <textarea
        value={data.notes ?? ''}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Como foi seu dia? Anote observações, como se sentiu, o que comeu..."
        rows={3}
        className="w-full bg-elevated border border-line rounded-xl px-4 py-3 text-sm text-content placeholder:text-faint resize-y focus:outline-none focus:ring-2 focus:ring-brand/30 min-h-[80px]"
      />
    </div>
  );
};

export default NotesWidget;
