import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { BudgetsScreen } from '../BudgetsScreen';
import { Budget } from '../../types';

jest.mock('../../../hooks', () => ({
  useBudgets: () => ({
    data: [
      {
        id: 'b1',
        category: 'Food & Dining',
        limit: 5000,
        spent: 3200,
        period: 'monthly',
      } as Budget,
    ],
    isLoading: false,
    isError: false,
  }),
  useUpsertBudget: () => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useDeleteBudget: () => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('../../../services', () => ({
  CATEGORIES: ['Food & Dining', 'Shopping', 'Transport'],
  ACCOUNTS: ['HDFC Savings'],
}));

describe('BudgetsScreen', () => {
  it('renders budget section without the Goals tab', async () => {
    const queryClient = new QueryClient();
    await render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <BudgetsScreen />
        </NavigationContainer>
      </QueryClientProvider>
    );

    expect(screen.getByText('Food & Dining')).toBeDefined();
    expect(screen.getByText('Subscriptions')).toBeDefined();
    expect(screen.queryByText('Goals')).toBeNull();
    expect(screen.queryByText('Create new goal')).toBeNull();
  });
});