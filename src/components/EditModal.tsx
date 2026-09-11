import { useState } from 'react';
import { X, Droplet, Calendar } from 'lucide-react';
import type { Cartridge } from '@/lib/supabase';

type EditModalProps = {
  cartridge: Cartridge;
  onClose: () => void;
  onSave: (updates: {
    color: string;
    start_date: string;
    end_date: string | null;
  }) => void;
};

const PRESETS = ['Noir', 'Couleur', 'Cyan', 'Magenta', 'Jaune'];

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function EditModal({
  cartridge,
  onClose,
  onSave,
}: EditModalProps) {
  const [color, setColor] = useState(cartridge.color);
  const [startDate, setStartDate] = useState(cartridge.start_date);
  const isHistory = !!cartridge.end_date;
  const [endDate, setEndDate] = useState(cartridge.end_date ?? getTodayISO());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.trim()) return;

    onSave({
      color: color.trim(),
      start_date: startDate,
      end_date: isHistory ? endDate : null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Modifier la cartouche
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Couleur / Modèle
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  color === preset
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="relative mb-5">
            <Droplet
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Nom personnalisé"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-slate-400" />
              Date d'installation
            </span>
          </label>
          <input
            type="date"
            value={startDate}
            max={getTodayISO()}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all mb-5"
          />

          {isHistory && (
            <>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-slate-400" />
                  Date de remplacement
                </span>
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={getTodayISO()}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all mb-1"
              />
              {new Date(endDate) < new Date(startDate) && (
                <p className="text-xs text-rose-500 mt-1">
                  La date de fin ne peut pas être antérieure à la date de début.
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={
              !color.trim() ||
              (isHistory && new Date(endDate) < new Date(startDate))
            }
            className="w-full mt-5 py-3.5 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-slate-800 transition-colors"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
