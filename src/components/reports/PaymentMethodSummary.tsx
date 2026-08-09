import { Text, View } from 'react-native';
import { Transaction } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';

interface PaymentMethodSummaryProps {
  transactions: Transaction[];
}

function sumExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function PaymentMethodSummary({ transactions }: PaymentMethodSummaryProps) {
  const upiTotal = sumExpenses(transactions.filter((t) => t.paymentMethod === 'upi'));
  const cashTotal = sumExpenses(transactions.filter((t) => t.paymentMethod === 'cash'));
  const overallTotal = upiTotal + cashTotal;

  const tiles = [
    { label: 'Total UPI', value: upiTotal, color: 'text-white' },
    { label: 'Total Cash', value: cashTotal, color: 'text-white' },
    { label: 'Overall', value: overallTotal, color: 'text-gold' },
  ];

  return (
    <Card className="flex-row">
      {tiles.map((tile, i) => (
        <View key={tile.label} className={`flex-1 items-center ${i > 0 ? 'border-l border-border' : ''}`}>
          <Text className="text-muted font-body-medium text-[11px] uppercase tracking-wide mb-1">{tile.label}</Text>
          <Text className={`font-mono-semibold text-sm ${tile.color}`}>{formatCompactCurrency(tile.value)}</Text>
        </View>
      ))}
    </Card>
  );
}
