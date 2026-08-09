import { useQuery } from '@tanstack/react-query';
import { fetchCreditCardBills } from '../services/creditCardBills';

export function useCreditCardBills() {
  return useQuery({
    queryKey: ['credit-card-bills'],
    queryFn: fetchCreditCardBills,
    staleTime: 60_000,
  });
}
