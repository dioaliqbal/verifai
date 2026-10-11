import { ScanRecord, DetectionOutput } from '../types';

const STORAGE_KEY = 'verifai_scans_data';

// Helper to generate sample scans for empty state exploration if desired
const SEED_SCANS: ScanRecord[] = [
  {
    id: 'seed-1',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    fileName: 'portrait_natural_light.jpg',
    fileSize: 1420000,
    aiScore: 0.06,
    label: 'human',
    topGenerator: '',
    generatorScores: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
  {
    id: 'seed-2',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fileName: 'cyberpunk_cityscape_render.png',
    fileSize: 2840000,
    aiScore: 0.94,
    label: 'ai',
    topGenerator: 'Midjourney v6',
    generatorScores: [
      { name: 'Midjourney v6', score: 0.78 },
      { name: 'Flux.1 Dev', score: 0.12 },
      { name: 'Stable Diffusion XL', score: 0.04 },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1.5, // 1.5 days ago
  },
  {
    id: 'seed-3',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    fileName: 'yosemite_valley_landscape.jpg',
    fileSize: 3100000,
    aiScore: 0.03,
    label: 'human',
    topGenerator: '',
    generatorScores: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: 'seed-4',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
    fileName: 'futuristic_glass_sculpture.webp',
    fileSize: 1980000,
    aiScore: 0.89,
    label: 'ai',
    topGenerator: 'Flux.1 Dev',
    generatorScores: [
      { name: 'Flux.1 Dev', score: 0.72 },
      { name: 'Midjourney v6', score: 0.14 },
      { name: 'DALL-E 3', score: 0.03 },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
  },
  {
    id: 'seed-5',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    fileName: 'oil_painting_still_life.jpg',
    fileSize: 2200000,
    aiScore: 0.12,
    label: 'human',
    topGenerator: '',
    generatorScores: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
  },
  {
    id: 'seed-6',
    userId: 'demo-user',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80',
    fileName: 'abstract_fluid_forms.png',
    fileSize: 1850000,
    aiScore: 0.91,
    label: 'ai',
    topGenerator: 'DALL-E 3',
    generatorScores: [
      { name: 'DALL-E 3', score: 0.68 },
      { name: 'Midjourney v6', score: 0.18 },
      { name: 'Stable Diffusion XL', score: 0.05 },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
  },
];

function getAllStoredScans(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First time initialization only when key is strictly absent
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SCANS));
      return SEED_SCANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading scans from storage:', e);
    return [];
  }
}

function saveStoredScans(scans: ScanRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  } catch (e) {
    console.error('Failed saving scans to storage:', e);
  }
}

export const StorageService = {
  getScansForUser(userId: string): ScanRecord[] {
    const all = getAllStoredScans();
    // Return all scans created by this user or initial seeded demo scans
    return all
      .filter((s) => s.userId === userId || s.userId === 'demo-user')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  saveScan(
    userId: string,
    file: File,
    imageDataUrl: string,
    result: DetectionOutput
  ): ScanRecord {
    const newRecord: ScanRecord = {
      id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      imageUrl: imageDataUrl,
      thumbnailUrl: imageDataUrl,
      fileName: file.name,
      fileSize: file.size,
      aiScore: result.ai_score,
      label: result.label,
      topGenerator: result.top_generator,
      generatorScores: result.generator_scores,
      provider: result.provider || 'Sightengine AI Vision',
      createdAt: Date.now(),
    };

    const all = getAllStoredScans();
    const updated = [newRecord, ...all];
    saveStoredScans(updated);
    return newRecord;
  },

  deleteScan(scanId: string): void {
    const all = getAllStoredScans();
    const filtered = all.filter((s) => s.id !== scanId);
    saveStoredScans(filtered);
  },

  clearAllForUser(userId: string): void {
    const all = getAllStoredScans();
    // When clearing, completely delete all records belonging to this user or demo-user
    const filtered = all.filter((s) => s.userId !== userId && s.userId !== 'demo-user');
    saveStoredScans(filtered);
  },
};
