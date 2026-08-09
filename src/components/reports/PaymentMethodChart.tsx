import { Text, View } from 'react-native';
import { Transaction } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';
import { DonutChart, DonutLegend, DonutSegment } from '../ui/charts';

interface PaymentMethodChartProps {
  transactions: Transaction[];
}

export function PaymentMethodChart({ transactions }: PaymentMethodChartProps) {
  const upiTotal = transactions
    .filter((t) => t.paymentMethod === 'upi' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const cashTotal = transactions
    .filter((t) => t.paymentMethod === 'cash' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (upiTotal + cashTotal === 0) return null;

  const segments: DonutSegment[] = [
    { label: 'UPI', value: upiTotal, color: '#C9A44C' },
    { label: 'Cash', value: cashTotal, color: '#3FA96A' },
  ];

  return (
    <Card className="gap-4">
      <Text className="text-white font-heading-semibold text-base">Spending by payment method</Text>
      <View className="flex-row items-center gap-6">
        <DonutChart data={segments} centerValue={formatCompactCurrency(upiTotal + cashTotal)} centerLabel="Spent" />
        <View className="flex-1">
          <DonutLegend data={segments} />
        </View>
      </View>
    </Card>
  );
}
