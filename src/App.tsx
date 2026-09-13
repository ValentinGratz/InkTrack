import { useState, useEffect, useMemo } from 'react';
import { Plus, Droplet, Clock, History, Loader2, BarChart3 } from 'lucide-react';
import {
  type Cartridge,
  loadCartridges,
  insertCartridge,
  updateCartridge,
  deleteCartridge,
  replaceAllCartridges,
} from '@/lib/storage';
import InstallModal from '@/components/InstallModal';
import ReplaceModal from '@/components/ReplaceModal';
import EditModal from '@/components/EditModal';
import DeleteModal from '@/components/DeleteModal';
import CartridgeCard from '@/components/CartridgeCard';
import StatsView from '@/components/StatsView';
import DataBackup from '@/components/DataBackup';

type Tab = 'active' | 'history' | 'stats';

function daysBetween(start: string, end: string): number {
  const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function getTodayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export default function App() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');
  const [showInstall, setShowInstall] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Cartridge | null>(null);
  const [editTarget, setEditTarget] = useState<Cartridge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cartridge | null>(null);
  const [today, setToday] = useState(getTodayISODate());

  const refresh = () => {
    setCartridges(loadCartridges());
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setToday(getTodayISODate()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const activeCartridges = cartridges.filter((c) => !c.end_date);
  const historyCartridges = cartridges.filter((c) => c.end_date);

  const avgLifespanByColor = useMemo(() => {
    const map = new Map<string, number>();
    const groups = new Map<string, number[]>();
    for (const c of historyCartridges) {
      if (c.duration_days == null) continue;
      if (!groups.has(c.color)) groups.set(c.color, []);
      groups.get(c.color)!.push(c.duration_days);
    }
    for (const [color, durations] of groups) {
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      map.set(color, avg);
    }
    return map;
  }, [historyCartridges]);

  const getAvgLifespan = (color: string): number | null => {
    return avgLifespanByColor.get(color) ?? null;
  };

  const handleInstall = (data: {
    color: string;
    start_date: string;
    end_date: string | null;
    duration_days: number | null;
    price: number | null;
    brand: string | null;
  }) => {
    insertCartridge(data);
    setShowInstall(false);
    setTab(data.end_date ? 'history' : 'active');
    refresh();
  };

  const handleReplace = () => {
    if (!replaceTarget) return;
    const endDate = getTodayISODate();
    const duration = daysBetween(replaceTarget.start_date, endDate);
    updateCartridge(replaceTarget.id, { end_date: endDate, duration_days: duration });
    setReplaceTarget(null);
    refresh();
  };

  const handleEdit = (updates: {
    color: string;
    start_date: string;
    end_date: string | null;
    duration_days: number | null;
    price: number | null;
    brand: string | null;
  }) => {
    if (!editTarget) return;
    updateCartridge(editTarget.id, updates);
    setEditTarget(null);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCartridge(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  };

  const handleImport = (data: Cartridge[]) => {
    replaceAllCartridges(data);
    refresh();
  };

  const tabs: { id: Tab; label: string; icon: typeof Clock; count?: number }[] = [
    { id: 'active', label: 'En cours', icon: Clock, count: activeCartridges.length },
    { id: 'history', label: 'Historique', icon: History, count: historyCartridges.length },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
              <Droplet size={22} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">EncreTrack</h1>
              <p className="text-xs text-slate-400">
                Suivi de vos cartouches d'encre
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-5">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    tab === t.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{t.label}</span>
                  {t.count != null && t.count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        tab === t.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 pt-5 pb-44">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Chargement…</p>
          </div>
        ) : tab === 'active' ? (
          activeCartridges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                <Droplet size={30} className="text-slate-300" />
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-1">
                Aucune cartouche active
              </h2>
              <p className="text-sm text-slate-400 max-w-xs">
                Installez une première cartouche pour commencer à suivre sa
                durée de vie.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCartridges.map((c) => (
                <CartridgeCard
                  key={c.id}
                  cartridge={c}
                  daysElapsed={daysBetween(c.start_date, today)}
                  avgLifespan={getAvgLifespan(c.color)}
                  onReplace={() => setReplaceTarget(c)}
                  onEdit={() => setEditTarget(c)}
                  onDelete={() => setDeleteTarget(c)}
                  isActive
                />
              ))}
            </div>
          )
        ) : tab === 'history' ? (
          historyCartridges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                <History size={30} className="text-slate-300" />
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-1">
                Historique vide
              </h2>
              <p className="text-sm text-slate-400 max-w-xs">
                Les cartouches remplacées apparaîtront ici avec leur durée
                totale.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyCartridges.map((c) => (
                <CartridgeCard
                  key={c.id}
                  cartridge={c}
                  daysElapsed={c.duration_days ?? 0}
                  avgLifespan={null}
                  onEdit={() => setEditTarget(c)}
                  onDelete={() => setDeleteTarget(c)}
                  isActive={false}
                />
              ))}
            </div>
          )
        ) : (
          <StatsView cartridges={cartridges} />
        )}

        {/* Data backup section */}
        {!loading && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Sauvegarde des données
            </h3>
            <DataBackup cartridges={cartridges} onImport={handleImport} />
          </div>
        )}
      </main>

      {/* Floating action button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto px-5 pb-6">
          <button
            onClick={() => setShowInstall(true)}
            className="pointer-events-auto w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            <Plus size={20} />
            Installer une nouvelle cartouche
          </button>
        </div>
      </div>

      {/* Modals */}
      {showInstall && (
        <InstallModal
          onClose={() => setShowInstall(false)}
          onInstall={handleInstall}
        />
      )}
      {replaceTarget && (
        <ReplaceModal
          color={replaceTarget.color}
          daysElapsed={daysBetween(replaceTarget.start_date, today)}
          onClose={() => setReplaceTarget(null)}
          onConfirm={handleReplace}
        />
      )}
      {editTarget && (
        <EditModal
          cartridge={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          color={deleteTarget.color}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
