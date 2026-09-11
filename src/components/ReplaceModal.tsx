import { X, AlertCircle } from 'lucide-react';

type ReplaceModalProps = {
  color: string;
  daysElapsed: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ReplaceModal({
  color,
  daysElapsed,
  onClose,
  onConfirm,
}: ReplaceModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Remplacer la cartouche
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl mb-5">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              Vous allez terminer le suivi de la cartouche{' '}
              <span className="font-semibold">{color}</span>. Elle sera déplacée
              dans l'historique avec une durée de{' '}
              <span className="font-semibold">{daysElapsed} jours</span>.
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
