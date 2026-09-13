export type Cartridge = {
  id: string;
  color: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  price: number | null;
  brand: string | null;
  created_at: string;
};

const STORAGE_KEY = 'encretrack_cartridges';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function loadCartridges(): Cartridge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.sort((a: Cartridge, b: Cartridge) =>
      b.start_date.localeCompare(a.start_date)
    );
  } catch {
    return [];
  }
}

export function saveCartridges(cartridges: Cartridge[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartridges));
}

export function insertCartridge(data: Omit<Cartridge, 'id' | 'created_at'>): Cartridge {
  const cartridges = loadCartridges();
  const newCartridge: Cartridge = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  cartridges.push(newCartridge);
  saveCartridges(cartridges);
  return newCartridge;
}

export function updateCartridge(id: string, updates: Partial<Omit<Cartridge, 'id' | 'created_at'>>): void {
  const cartridges = loadCartridges();
  const idx = cartridges.findIndex((c) => c.id === id);
  if (idx === -1) return;
  cartridges[idx] = { ...cartridges[idx], ...updates };
  saveCartridges(cartridges);
}

export function deleteCartridge(id: string): void {
  const cartridges = loadCartridges().filter((c) => c.id !== id);
  saveCartridges(cartridges);
}

export function replaceAllCartridges(newCartridges: Cartridge[]): void {
  saveCartridges(newCartridges);
}
