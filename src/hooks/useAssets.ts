import { useQuery } from '@tanstack/react-query';
import { getAssetById, getAssets } from '../services';

export function useAssets() {
  return useQuery({ queryKey: ['assets'], queryFn: getAssets });
}

export function useAsset(id: string) {
  return useQuery({ queryKey: ['assets', id], queryFn: () => getAssetById(id), enabled: !!id });
}
