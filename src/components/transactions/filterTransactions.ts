import { AmountRange, DateRange, SortOption } from '../../store/filterStore';
import { PaymentMethod, Transaction } from '../../types';

interface FilterOptions {
  searchQuery: string;
  selectedCategories: string[];
  dateRange: DateRange;
  amountRange: AmountRange;
  paymentMethod: PaymentMethod | 'all';
  sortBy: SortOption;
}

export function filterTransactions(
  transactions: Transaction[],
  { searchQuery, selectedCategories, dateRange, amountRange, paymentMethod, sortBy }: FilterOptions,
): Transaction[] {
  const query = searchQuery.trim().toLowerCase();

  let filtered = transactions.filter((transaction) => {
    if (paymentMethod !== 'all' && transaction.paymentMethod !== paymentMethod) return false;

    if (query) {
      const matchesMerchant = transaction.merchant.toLowerCase().includes(query);
      const matchesCategory = transaction.category.toLowerCase().includes(query);
      const matchesNotes = transaction.notes?.toLowerCase().includes(query) ?? false;
      if (!matchesMerchant && !matchesCategory && !matchesNotes) return false;
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes(transaction.category)) {
      return false;
    }

    if (dateRange.start && transaction.date < dateRange.start) return false;
    if (dateRange.end && transaction.date > dateRange.end) return false;

    const absAmount = Math.abs(transaction.amount);
    if (amountRange.min !== null && absAmount < amountRange.min) return false;
    if (amountRange.max !== null && absAmount > amountRange.max) return false;

    return true;
  });

  switch (sortBy) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      break;
    case 'highest':
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      break;
    case 'lowest':
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
  }

  return filtered;
}
