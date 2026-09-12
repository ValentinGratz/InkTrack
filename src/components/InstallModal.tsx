import { useState } from 'react';
import { X, Droplet, Calendar, Euro, Tag } from 'lucide-react';

type InstallModalProps = {
  onClose: () => void;
  onInstall: (data: {
    color: string;
    start_date: string;
    end_date: string | null;
    duration_days: number | null;
    price: number | null;
    brand: string | null;
  }) => void;
};

const PRESETS = ['Noir', 'Couleur', 'Cyan', 'Magenta', 'Jaune'];

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysBetween(start: string, end: string): number {
  return Math.max(0, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

export default function InstallModal({ onClose, onInstall }: InstallModalProps) {
  const [color, setColor] = useState('');
  const [startDate, setStartDate] = useState(getTodayISO());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isManualHistory, setIsManualHistory] = useState(false);
  const [endDate, setEndDate] = useState(getTodayISO());
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.trim()) return;

    const priceNum = price.trim() ? parseFloat(price.replace(',', '.')) : null;
    const brandVal = brand.trim() || null;

    if (isManualHistory) {
      onInstall({
        color: color.trim(),
        start_date: startDate,
        end_date: endDate,
        duration_days: daysBetween(startDate, endDate),
        price: priceNum,
        brand: brandVal,
      });
    } else {
      onInstall({
        color: color.trim(),
        start_date: startDate,
        end_date: null,
        duration_days: null,
        price: priceNum,
        brand: brandVal,
      });
    }
  };

  const invalidDates = isManualHistory && new Date(endDate) < new Date(startDate);

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
            {isManualHistory ? 'Ajouter à l\'historique' : 'Nouvelle cartouche'}
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
              placeholder="Ou saisissez un nom personnalisé"
              autoFocus
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          {/* Brand / Model */}
          <div className="relative mb-5">
            <Tag
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Marque / Modèle (ex: HP 305, Officielle)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          {/* Price */}
          <div className="relative mb-5">
            <Euro
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix d'achat (€) — optionnel"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>

          {/* Manual history toggle */}
          <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isManualHistory}
              onChange={(e) => setIsManualHistory(e.target.checked)}
              className="w-4 h-4 rounded accent-slate-900"
            />
            <span className="text-sm text-slate-600">
              Cartouche déjà remplacée (ajouter à l'historique)
            </span>
          </label>

          {/* Start date */}
          {isManualHistory ? (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Date d'installation
              </label>
              <input
                type="date"
                value={startDate}
                max={getTodayISO()}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
              />
            </div>
          ) : (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Calendar size={18} className="text-slate-400" />
                  Installée le {formatDate(startDate)}
                </span>
                <span className="text-xs text-slate-400 underline">
                  {showDatePicker ? 'Masquer' : 'Modifier la date'}
                </span>
              </button>

              {showDatePicker && (
                <div className="mt-2 p-4 bg-slate-50 rounded-2xl animate-[fadeIn_0.2s_ease-out]">
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    Date d'installation
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={getTodayISO()}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Choisissez une date passée si vous aviez déjà commencé le
                    suivi ailleurs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* End date for manual history */}
          {isManualHistory && (
            <div className="mb-2">
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Date de remplacement
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={getTodayISO()}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
              />
              {invalidDates && (
                <p className="text-xs text-rose-500 mt-1">
                  La date de fin ne peut pas être antérieure à la date de début.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!color.trim() || invalidDates}
            className="w-full mt-5 py-3.5 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-slate-800 transition-colors"
          >
            {isManualHistory ? 'Ajouter à l\'historique' : 'Installer la cartouche'}
          </button>
        </form>
      </div>
    </div>
  );
}
