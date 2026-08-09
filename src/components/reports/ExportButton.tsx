import { Download, FileSpreadsheet, FileText } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { useTransactions } from '../../hooks';
import { useUiStore } from '../../store';
import { Transaction } from '../../types';

function generateCsv(transactions: Transaction[]): string {
  const header = 'Date,Time,Merchant,Category,Amount,Account,PaymentMethod,Notes,Flagged';
  const rows = transactions.map((t) =>
    [
      t.date,
      t.time ?? '',
      `"${(t.merchant ?? '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.account}"`,
      t.paymentMethod,
      `"${(t.notes ?? '').replace(/"/g, '""')}"`,
      t.flagged ? 'Yes' : 'No',
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const showToast = useUiStore((state) => state.showToast);
  const { data: transactions = [] } = useTransactions();

  const handleExportCsv = useCallback(async () => {
    setOpen(false);
    try {
      const csv = generateCsv(transactions);
      await Share.share({
        message: csv,
        title: 'FinSense Transaction Export',
      });
    } catch {
      showToast('Could not export data', 'error');
    }
  }, [transactions, showToast]);

  const handleExportPdf = useCallback(() => {
    setOpen(false);
    showToast('PDF export is not available yet. Try CSV instead.', 'info');
  }, [showToast]);

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel="Export report"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 active:opacity-80"
      >
        <Download color="#C9A44C" size={18} />
        <Text className="text-on-surface font-body-semibold text-sm">Export</Text>
      </Pressable>

      {open ? (
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleExportPdf}
            accessibilityRole="button"
            accessibilityLabel="Export as PDF"
            className="flex-1 flex-row items-center justify-center gap-2 bg-background border border-border rounded-xl py-3 active:opacity-80"
          >
            <FileText color="#7C8797" size={16} />
            <Text className="text-on-surface font-body-medium text-sm">Export as PDF</Text>
          </Pressable>
          <Pressable
            onPress={handleExportCsv}
            accessibilityRole="button"
            accessibilityLabel="Export as CSV"
            className="flex-1 flex-row items-center justify-center gap-2 bg-background border border-border rounded-xl py-3 active:opacity-80"
          >
            <FileSpreadsheet color="#7C8797" size={16} />
            <Text className="text-on-surface font-body-medium text-sm">Export as CSV</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
