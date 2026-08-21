import { create } from 'zustand';
import { CurrencyCode, PaymentMethod } from '../types';

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface AmountRange {
  min: number | null;
  max: number | null;
}

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface FilterState {
  searchQuery: string;
  dateRange: DateRange;
  selectedCategories: string[];
  amountRange: AmountRange;
  paymentMethod: PaymentMethod | 'all';
  sortBy: SortOption;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: DateRange) => void;
  setAmountRange: (range: AmountRange) => void;
  setPaymentMethod: (method: PaymentMethod | 'all') => void;
  setSortBy: (sort: SortOption) => void;
  toggleCategory: (category: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  searchQuery: '',
  dateRange: { start: null, end: null },
  selectedCategories: [],
  amountRange: { min: null, max: null },
  paymentMethod: 'all',
  sortBy: 'newest',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDateRange: (dateRange) => set({ dateRange }),
  setAmountRange: (amountRange) => set({ amountRange }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleCategory: (category) => {
    const current = get().selectedCategories;
    set({
      selectedCategories: current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    });
  },
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  clearFilters: () =>
    set({
      searchQuery: '',
      dateRange: { start: null, end: null },
      selectedCategories: [],
      amountRange: { min: null, max: null },
      paymentMethod: 'all',
      sortBy: 'newest',
    }),
  hasActiveFilters: () => {
    const s = get();
    return (
      s.searchQuery.trim() !== '' ||
      s.selectedCategories.length > 0 ||
      s.dateRange.start !== null ||
      s.dateRange.end !== null ||
      s.amountRange.min !== null ||
      s.amountRange.max !== null ||
      s.paymentMethod !== 'all'
    );
  },
}));
