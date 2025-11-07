export type StoredPortrait = {
  id: string;
  url: string;
  createdAt: number;
};

const STORAGE_KEY = "corretoria_generated_portraits";
const MAX_STORED = 20; // Keep last 20 portraits

export function savePortrait(url: string): string {
  if (typeof window === "undefined") return "";
  
  const portraits = getStoredPortraits();
  const id = `portrait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newPortrait: StoredPortrait = {
    id,
    url,
    createdAt: Date.now(),
  };
  
  // Add to front and keep only last MAX_STORED
  const updated = [newPortrait, ...portraits].slice(0, MAX_STORED);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save portrait:", err);
  }
  
  return id;
}

export function getStoredPortraits(): StoredPortrait[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as StoredPortrait[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load portraits:", err);
    return [];
  }
}

export function getLatestPortrait(): StoredPortrait | null {
  const portraits = getStoredPortraits();
  return portraits.length > 0 ? portraits[0] : null;
}

export function deletePortrait(id: string): void {
  if (typeof window === "undefined") return;
  
  const portraits = getStoredPortraits();
  const filtered = portraits.filter((p) => p.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete portrait:", err);
  }
}


