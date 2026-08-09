import { Asset } from '../../types';
import { delay } from './delay';

function trend(start: number, points: number, volatility: number, drift: number): number[] {
  const values: number[] = [start];
  let seed = start;
  for (let i = 1; i < points; i++) {
    seed = seed * (1 + drift) + (Math.sin(i * 1.7) * volatility);
    values.push(Math.round(seed * 100) / 100);
  }
  return values;
}

const assets: Asset[] = [
  { id: 'asset_001', name: 'Nifty 50 Index Fund', type: 'stock', value: 154200, returnPct: 14.2, history: trend(132000, 30, 1200, 0.005) },
  { id: 'asset_002', name: 'SBI Bluechip Fund', type: 'stock', value: 89300, returnPct: 11.8, history: trend(78000, 30, 800, 0.004) },
  { id: 'asset_003', name: 'HDFC Mid-Cap Opportunities', type: 'stock', value: 56100, returnPct: 16.4, history: trend(47000, 30, 900, 0.006) },
  { id: 'asset_004', name: 'PPFAS Flexi Cap Fund', type: 'stock', value: 42750, returnPct: 13.1, history: trend(37000, 30, 500, 0.005) },
  { id: 'asset_005', name: 'Government Bond 10Y', type: 'bond', value: 50000, returnPct: 7.2, history: trend(48000, 30, 200, 0.001) },
  { id: 'asset_006', name: 'Fixed Deposit (HDFC Bank)', type: 'cash', value: 200000, returnPct: 6.5, history: trend(193000, 30, 100, 0.002) },
  { id: 'asset_007', name: 'Gold ETF (GOLDBEES)', type: 'stock', value: 32800, returnPct: 8.9, history: trend(29500, 30, 400, 0.003) },
  { id: 'asset_008', name: 'S&P 500 Index (via VOO)', type: 'stock', value: 12450, returnPct: 9.1, history: trend(11000, 30, 300, 0.004) },
];

export function getAssets(): Promise<Asset[]> {
  return delay([...assets].map((a) => ({
    ...a,
    history: trend(a.history[0], 30, a.history[0] * 0.01, (Math.random() - 0.3) * 0.003),
  })));
}

export function getAssetById(id: string): Promise<Asset | undefined> {
  return delay(assets.find((a) => a.id === id));
}

export function syncAssets(): Promise<{ success: boolean; updatedAt: string }> {
  return delay({ success: true, updatedAt: new Date().toISOString() }, 2000);
}
