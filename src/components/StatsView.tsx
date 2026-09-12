import { BarChart3, Droplet, TrendingUp, Euro, Calendar } from 'lucide-react';
import type { Cartridge } from '@/lib/supabase';

type StatsViewProps = {
  cartridges: Cartridge[];
};

function getColorHex(color: string): string {
  const lower = color.toLowerCase();
  if (lower.includes('noir') || lower.includes('black')) return '#0f172a';
  if (lower.includes('cyan')) return '#06b6d4';
  if (lower.includes('magenta') || lower.includes('rouge')) return '#f43f5e';
  if (lower.includes('jaune') || lower.includes('yellow')) return '#fbbf24';
  return '#8b5cf6';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StatsView({ cartridges }: StatsViewProps) {
  const history = cartridges.filter((c) => c.end_date && c.duration_days != null);

  // Group by color
  const colorGroups = new Map<string, Cartridge[]>();
  for (const c of history) {
    const key = c.color;
    if (!colorGroups.has(key)) colorGroups.set(key, []);
    colorGroups.get(key)!.push(c);
  }

  // Per-color stats
  const colorStats = Array.from(colorGroups.entries()).map(([color, items]) => {
    const durations = items.map((c) => c.duration_days ?? 0);
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const max = Math.max(...durations);
    const min = Math.min(...durations);
    const prices = items.filter((c) => c.price != null).map((c) => c.price!);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    const avgCostPerDay = avgPrice != null && avg > 0 ? avgPrice / avg : null;
    return { color, count: items.length, avg, max, min, avgPrice, avgCostPerDay, items };
  });

  // Overall stats
  const allDurations = history.map((c) => c.duration_days ?? 0);
  const overallAvg =
    allDurations.length > 0
      ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
      : 0;
  const overallMax = allDurations.length > 0 ? Math.max(...allDurations) : 0;
  const overallMin = allDurations.length > 0 ? Math.min(...allDurations) : 0;
  const totalPrice = history
    .filter((c) => c.price != null)
    .reduce((sum, c) => sum + (c.price ?? 0), 0);

  // Chart data: individual cartridges grouped by color
  const maxBarValue = Math.max(...allDurations, 1);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
          <BarChart3 size={30} className="text-slate-300" />
        </div>
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Pas encore de statistiques
        </h2>
        <p className="text-sm text-slate-400 max-w-xs">
          Remplacez au moins une cartouche pour voir des statistiques et des
          comparaisons de durée de vie.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <TrendingUp size={14} />
            Durée moyenne
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {overallAvg}
            <span className="text-sm font-normal text-slate-400 ml-1">jours</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar size={14} />
            Record de longévité
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {overallMax}
            <span className="text-sm font-normal text-slate-400 ml-1">jours</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Droplet size={14} />
            Cartouches suivies
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {history.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Euro size={14} />
            Coût total
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalPrice > 0
              ? totalPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
              : '—'}
          </div>
        </div>
      </div>

      {/* Bar chart: individual cartridges grouped by color */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Durée de vie par cartouche
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Regroupé par couleur — survolez une barre pour les détails
        </p>

        <div className="space-y-5">
          {colorStats.map((stat) => (
            <div key={stat.color}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getColorHex(stat.color) }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {stat.color}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({stat.count} {stat.count <= 1 ? 'cartouche' : 'cartouches'}, moy. {stat.avg} j)
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-1.5 h-32">
                {stat.items.map((c) => {
                  const height = ((c.duration_days ?? 0) / maxBarValue) * 100;
                  return (
                    <div
                      key={c.id}
                      className="group/bar relative flex-1 min-w-0 flex flex-col items-center justify-end"
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{c.duration_days} jours</div>
                          <div className="text-slate-300 text-[10px]">
                            {formatDate(c.start_date)}
                          </div>
                          {c.price != null && (
                            <div className="text-slate-300 text-[10px]">
                              {c.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${height}%`,
                          backgroundColor: getColorHex(c.color),
                          minHeight: '4px',
                        }}
                      />
                      <div className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">
                        {formatDate(c.start_date).split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-color comparison table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Comparaison par couleur
        </h3>
        <div className="space-y-3">
          {colorStats.map((stat) => (
            <div
              key={stat.color}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: getColorHex(stat.color) }}
                >
                  <Droplet size={16} className="text-white" fill="white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {stat.color}
                  </div>
                  <div className="text-xs text-slate-400">
                    {stat.min}–{stat.max} jours
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {stat.avg} j
                </div>
                {stat.avgCostPerDay != null && (
                  <div className="text-xs text-slate-400">
                    {stat.avgCostPerDay.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/jour
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
