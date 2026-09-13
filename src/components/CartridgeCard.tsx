import { useState, useRef, useEffect } from 'react';
import { Droplet, RefreshCw, Calendar, MoreVertical, Pencil, Trash2, Tag, TrendingUp } from 'lucide-react';
import type { Cartridge } from '@/lib/storage';

type CartridgeCardProps = {
  cartridge: Cartridge;
  daysElapsed: number;
  avgLifespan: number | null;
  onReplace?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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
  return { bg: 'bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-400', text: 'text-slate-700', ring: 'ring-slate-400' };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatEstimatedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  year: 'numeric',
  });
}

function formatPrice(price: number | null): string {
  if (price == null) return '';
  return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatCostPerDay(price: number | null, days: number): string | null {
  if (price == null || days === 0) return null;
  const cost = price / days;
  return cost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €/jour';
}

export default function CartridgeCard({
  cartridge,
  daysElapsed,
  avgLifespan,
  onReplace,
  onEdit,
  onDelete,
  isActive,
}: CartridgeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const colorStyle = getColorStyle(cartridge.color);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const duration = cartridge.duration_days ?? daysElapsed;
  const costPerDay = formatCostPerDay(cartridge.price, duration);

  // Prediction logic for active cartridges
  let progressPercent = 0;
  let estimatedEndDate: string | null = null;
  let isOverdue = false;

  if (isActive && avgLifespan && avgLifespan > 0) {
    progressPercent = Math.min(100, Math.round((daysElapsed / avgLifespan) * 100));
    const estDate = new Date(cartridge.start_date + 'T00:00:00');
    estDate.setDate(estDate.getDate() + avgLifespan);
    estimatedEndDate = estDate.toISOString().split('T')[0];
    isOverdue = daysElapsed > avgLifespan;
  }

  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-stretch">
        <div className={`w-2.5 ${colorStyle.bg} shrink-0`} />

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
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

            {/* Actions menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 -mr-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-20 animate-[fadeIn_0.15s_ease-out]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil size={15} />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={15} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Brand + Price badges */}
          {(cartridge.brand || cartridge.price != null) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {cartridge.brand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-500">
                  <Tag size={11} />
                  {cartridge.brand}
                </span>
              )}
              {cartridge.price != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-xs text-slate-500">
                  {formatPrice(cartridge.price)}
                </span>
              )}
            </div>
          )}

          {isActive ? (
            <>
              <div className="flex items-end justify-between mb-3">
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

              {/* Prediction + progress bar */}
              {estimatedEndDate && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <TrendingUp size={13} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
                    {isOverdue ? (
                      <span className="text-rose-500 font-medium">
                        Dépassée de {daysElapsed - (avgLifespan ?? 0)} jours (est. {avgLifespan} j)
                      </span>
                    ) : (
                      <span>
                        Remplacement estimé : autour du {formatEstimatedDate(estimatedEndDate)}
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverdue ? 'bg-rose-500' : progressPercent > 75 ? 'bg-amber-400' : colorStyle.bg
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Jour {daysElapsed}</span>
                    <span>Moy. {avgLifespan} j</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                A duré{' '}
                <span className="font-bold text-slate-900 text-lg">
                  {duration}
                </span>{' '}
                {duration <= 1 ? 'jour' : 'jours'}
              </div>
              <div className="flex items-center gap-3">
                {costPerDay && (
                  <span className="text-xs text-slate-400 font-medium">
                    {costPerDay}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${colorStyle.bg}`} />
                  <span>Terminée</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
