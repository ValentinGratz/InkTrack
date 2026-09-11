import { useState, useEffect, useCallback } from 'react';
import { Plus, Droplet, Clock, History, Loader2 } from 'lucide-react';
import { supabase, type Cartridge } from '@/lib/supabase';
import InstallModal from '@/components/InstallModal';
import ReplaceModal from '@/components/ReplaceModal';
import CartridgeCard from '@/components/CartridgeCard';

type Tab = 'active' | 'history';

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
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
  const [today, setToday] = useState(getTodayISODate());

  const fetchCartridges = useCallback(async () => {
    const { data, error } = await supabase
      .from('cartridges')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement:', error);
      return;
    }
    setCartridges((data as Cartridge[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCartridges();
      setLoading(false);
    })();
  }, [fetchCartridges]);

  // Refresh "today" every minute so counters stay live
  useEffect(() => {
    const interval = setInterval(() => setToday(getTodayISODate()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const activeCartridges = cartridges.filter((c) => !c.end_date);
  const historyCartridges = cartridges.filter((c) => c.end_date);

  const handleInstall = async (color: string) => {
    const { error } = await supabase
      .from('cartridges')
      .insert({ color, start_date: getTodayISODate() });

    if (error) {
      console.error("Erreur lors de l'installation:", error);
      return;
    }

    setShowInstall(false);
    setTab('active');
    await fetchCartridges();
  };

  const handleReplace = async () => {
    if (!replaceTarget) return;

    const endDate = getTodayISODate();
    const duration = daysBetween(replaceTarget.start_date, endDate);

    const { error } = await supabase
      .from('cartridges')
      .update({ end_date: endDate, duration_days: duration })
      .eq('id', replaceTarget.id);

    if (error) {
      console.error('Erreur lors du remplacement:', error);
      return;
    }

    setReplaceTarget(null);
    await fetchCartridges();
  };

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
            <button
              onClick={() => setTab('active')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'active'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Clock size={16} />
              En cours
              {activeCartridges.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === 'active'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {activeCartridges.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <History size={16} />
              Historique
              {historyCartridges.length > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === 'history'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {historyCartridges.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 pt-5 pb-32">
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
                  onReplace={() => setReplaceTarget(c)}
                  isActive
                />
              ))}
            </div>
          )
        ) : historyCartridges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <History size={30} className="text-slate-300" />
            </div>
            <h2 className="text-base font-semibold text-slate-700 mb-1">
              Historique vide
            </h2>
            <p className="text-sm text-slate-400 max-w-xs">
              Les cartouches remplacées apparaîtront ici avec leur durée totale.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyCartridges.map((c) => (
              <CartridgeCard
                key={c.id}
                cartridge={c}
                daysElapsed={c.duration_days ?? 0}
                isActive={false}
              />
            ))}
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
    </div>
  );
}
