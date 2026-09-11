import { Droplet, RefreshCw, Calendar } from 'lucide-react';
import type { Cartridge } from '@/lib/supabase';

type CartridgeCardProps = {
  cartridge: Cartridge;
  daysElapsed: number;
  onReplace?: () => void;
  isActive: boolean;
};

function getColorStyle(color: string): { bg: string; text: string; ring: string } {
  const lower = color.toLowerCase();
  if (lower.includes('noir') || lower.includes('black')) {
    return { bg: 'bg-slate-900', text: 'text-slate-900', ring: 'ring-slate-900' };
  }
  if (lower.includes('cyan')) {
    return { bg: 'bg-cyan-500', text: 'text-cyan-600', ring: 'ring-cyan-500' };
  }
  if (lower.includes('magenta') || lower.includes('rouge')) {
    return { bg: 'bg-rose-500', text: 'text-rose-600', ring: 'ring-rose-500' };
  }
  if (lower.includes('jaune') || lower.includes('yellow')) {
    return { bg: 'bg-amber-400', text: 'text-amber-500', ring: 'ring-amber-400' };
  }
  // "Couleur" or custom — use a multi-color gradient
  return { bg: 'bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-400', text: 'text-slate-700', ring: 'ring-slate-400' };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function CartridgeCard({
  cartridge,
  daysElapsed,
  onReplace,
  isActive,
}: CartridgeCardProps) {
  const colorStyle = getColorStyle(cartridge.color);

  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-stretch">
        {/* Color indicator bar */}
        <div className={`w-2.5 ${colorStyle.bg} shrink-0`} />

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl ${colorStyle.bg} flex items-center justify-center shadow-sm`}
              >
                <Droplet size={20} className="text-white" fill="white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base leading-tight">
                  {cartridge.color}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Calendar size={12} />
                  <span>
                    {isActive
                      ? `Depuis le ${formatDate(cartridge.start_date)}`
                      : `${formatDate(cartridge.start_date)} → ${cartridge.end_date ? formatDate(cartridge.end_date) : ''}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isActive ? (
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-slate-900 tabular-nums leading-none">
                  {daysElapsed}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {daysElapsed <= 1 ? 'jour' : 'jours'} écoulés
                </div>
              </div>
              <button
                onClick={onReplace}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-all active:scale-95"
              >
                <RefreshCw size={15} />
                Remplacer
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                A duré{' '}
                <span className="font-bold text-slate-900 text-lg">
                  {cartridge.duration_days ?? daysElapsed}
                </span>{' '}
                {(cartridge.duration_days ?? daysElapsed) <= 1 ? 'jour' : 'jours'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className={`w-2 h-2 rounded-full ${colorStyle.bg}`} />
                <span>Terminée</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
