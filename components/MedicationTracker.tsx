import React, { useState } from 'react';
import { Pill, Bell, BellOff, BellRing, Settings, Plus, Trash2, Check, Clock } from 'lucide-react';
import { DailyLog } from '../types';
import { Medication, createMedication } from '../services/medications';
import {
  NotificationPermissionState,
  getPermission,
  requestPermission,
} from '../services/notifications';

interface Props {
  medications: Medication[];
  onMedicationsChange: (next: Medication[]) => void;
  data: DailyLog;
  onChange: (updates: Partial<DailyLog>) => void;
}

const MedicationTracker: React.FC<Props> = ({ medications, onMedicationsChange, data, onChange }) => {
  const [managing, setManaging] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [perm, setPerm] = useState<NotificationPermissionState>(() => getPermission());

  const taken = data.medsTaken ?? [];
  const enabled = medications.filter((m) => m.enabled).sort((a, b) => a.time.localeCompare(b.time));

  const toggleTaken = (id: string) => {
    const next = taken.includes(id) ? taken.filter((t) => t !== id) : [...taken, id];
    onChange({ medsTaken: next });
  };

  const addMed = () => {
    if (!newName.trim()) return;
    onMedicationsChange([...medications, createMedication(newName, newTime)]);
    setNewName('');
    setNewTime('08:00');
  };

  const removeMed = (id: string) => {
    onMedicationsChange(medications.filter((m) => m.id !== id));
    if (taken.includes(id)) onChange({ medsTaken: taken.filter((t) => t !== id) });
  };

  const toggleEnabled = (id: string) => {
    onMedicationsChange(medications.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const askPermission = async () => {
    const result = await requestPermission();
    setPerm(result);
  };

  const takenCount = enabled.filter((m) => taken.includes(m.id)).length;

  const renderPermissionButton = () => {
    if (perm === 'unsupported') return null;
    if (perm === 'granted')
      return (
        <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium px-2 py-1" title="Lembretes ativados">
          <BellRing size={16} /> <span className="hidden sm:inline">Lembretes on</span>
        </span>
      );
    if (perm === 'denied')
      return (
        <span className="flex items-center gap-1 text-faint text-xs font-medium px-2 py-1" title="Notificações bloqueadas no navegador. Reative nas configurações do site.">
          <BellOff size={16} /> <span className="hidden sm:inline">Bloqueado</span>
        </span>
      );
    return (
      <button
        onClick={askPermission}
        className="flex items-center gap-1 text-brand text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-soft hover:opacity-90 transition-opacity"
        title="Receber lembretes no horário de cada medicamento"
      >
        <Bell size={14} /> Ativar lembretes
      </button>
    );
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-card border border-line h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
            <Pill size={20} />
          </div>
          <h3 className="font-semibold text-content">Medicamentos</h3>
          {enabled.length > 0 && (
            <span className="text-xs font-medium text-muted bg-elevated px-2 py-0.5 rounded-md">
              {takenCount}/{enabled.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {renderPermissionButton()}
          <button
            onClick={() => setManaging((v) => !v)}
            className={`p-1.5 rounded-md transition-colors ${managing ? 'text-brand bg-brand-soft' : 'text-faint hover:text-muted hover:bg-elevated'}`}
            title="Gerenciar medicamentos"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {managing ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Formulário de adição */}
          <div className="bg-elevated p-3 rounded-xl border border-line">
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Novo medicamento</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMed()}
                placeholder="Nome (ex: Losartana)"
                className="flex-1 bg-surface border border-line rounded-lg px-3 py-2 text-sm text-content placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-surface border border-line rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <button
                onClick={addMed}
                className="flex items-center justify-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* Lista gerenciável */}
          {medications.length === 0 ? (
            <p className="text-sm text-faint text-center py-2">Nenhum medicamento cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {medications
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 pl-3 rounded-lg border border-line bg-elevated">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock size={14} className="text-faint shrink-0" />
                      <span className="text-xs font-mono text-muted">{m.time}</span>
                      <span className={`text-sm font-medium truncate ${m.enabled ? 'text-content' : 'text-faint line-through'}`}>{m.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleEnabled(m.id)}
                        className="text-xs font-medium px-2 py-1 rounded-md text-muted hover:bg-surface"
                        title={m.enabled ? 'Desativar' : 'Ativar'}
                      >
                        {m.enabled ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => removeMed(m.id)}
                        className="p-1.5 text-faint hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : enabled.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-2">
          <Pill size={32} className="text-faint opacity-40" />
          <p className="text-sm text-muted">Nenhum medicamento cadastrado.</p>
          <button
            onClick={() => setManaging(true)}
            className="mt-1 flex items-center gap-1 text-sm font-semibold text-rose-500 hover:opacity-80"
          >
            <Plus size={16} /> Adicionar medicamento
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {enabled.map((m) => {
            const isTaken = taken.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleTaken(m.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  isTaken
                    ? 'bg-rose-500/10 border-rose-500/25'
                    : 'bg-elevated border-line hover:border-rose-500/25'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isTaken ? 'bg-rose-500 border-rose-500 text-white' : 'border-line'
                    }`}
                  >
                    {isTaken && <Check size={16} strokeWidth={3} />}
                  </div>
                  <span className={`font-medium truncate ${isTaken ? 'text-content' : 'text-content'}`}>{m.name}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-muted shrink-0">
                  <Clock size={13} /> {m.time}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationTracker;
