import { useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Cartridge } from '@/lib/supabase';

type DataBackupProps = {
  cartridges: Cartridge[];
  onImport: (data: Cartridge[]) => Promise<void>;
};

export default function DataBackup({ cartridges, onImport }: DataBackupProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleExport = () => {
    const exportData = {
      app: 'EncreTrack',
      version: 1,
      exported_at: new Date().toISOString(),
      cartridges: cartridges.map((c) => ({
        id: c.id,
        color: c.color,
        start_date: c.start_date,
        end_date: c.end_date,
        duration_days: c.duration_days,
        price: c.price,
        brand: c.brand,
        created_at: c.created_at,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encretrack-sauvegarde-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus('success');
    setStatusMsg(`${cartridges.length} cartouche(s) exportée(s)`);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.cartridges || !Array.isArray(data.cartridges)) {
        setStatus('error');
        setStatusMsg('Fichier invalide : format de données incorrect');
        setTimeout(() => setStatus('idle'), 4000);
        return;
      }

      await onImport(data.cartridges as Cartridge[]);
      setStatus('success');
      setStatusMsg(`${data.cartridges.length} cartouche(s) importée(s)`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setStatusMsg('Erreur lors de la lecture du fichier');
      setTimeout(() => setStatus('idle'), 4000);
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          <Download size={17} />
          Exporter
        </button>
        <button
          onClick={handleImportClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          <Upload size={17} />
          Importer
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 size={16} />
          {statusMsg}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm animate-[fadeIn_0.2s_ease-out]">
          <AlertCircle size={16} />
          {statusMsg}
        </div>
      )}
    </div>
  );
}
