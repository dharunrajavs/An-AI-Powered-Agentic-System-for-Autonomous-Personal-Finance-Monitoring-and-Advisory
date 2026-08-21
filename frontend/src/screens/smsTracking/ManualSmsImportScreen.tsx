import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardList, Upload, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { importFromRawText } from '../../services';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';

export function ManualSmsImportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const setScanResults = useSmsTrackingStore((s) => s.setScanResults);
  const setScanComplete = useSmsTrackingStore((s) => s.setScanComplete);
  const [rawText, setRawText] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  const handleImport = () => {
    if (!rawText.trim()) return;
    const result = importFromRawText(rawText);
    if (result.transactions.length > 0) {
      setScanResults(result.transactions, result.summary);
      setScanComplete(true);
      navigation.replace('ProcessingComplete');
    }
    setParsedCount(result.transactions.length);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-container-lowest border border-border items-center justify-center"
        >
          <Text className="text-on-surface font-heading-bold text-lg">←</Text>
        </Pressable>
        <Text className="text-on-surface font-heading-semibold text-base ml-3">Import SMS Manually</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-surface-container-lowest rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-start gap-3 mb-3">
            <ClipboardList color="#005c55" size={20} />
            <View className="flex-1">
              <Text className="text-on-surface font-heading-semibold text-sm mb-1">How to get SMS data</Text>
              <Text className="text-on-surface-variant font-body text-xs leading-5">
                Open your messaging app, find bank transaction SMS messages, copy them, and paste into the field below.
              </Text>
            </View>
          </View>
          <Text className="text-on-surface-variant font-body text-[11px] leading-4 mt-1">
            Tip: Long-press on a message {'>'} Select all {'>'} Copy. Paste multiple messages at once.
          </Text>
        </View>

        <View className="bg-surface-container-low rounded-xl border border-outline-variant/30 mb-3">
          <TextInput
            value={rawText}
            onChangeText={setRawText}
            placeholder={"Paste your bank SMS messages here...\n\nExample:\nRs.1,250 debited from HDFC Bank A/c XX1234 on 23-Jul-26 at Swigdy. Avl Bal: Rs.12,340"}
            placeholderTextColor="#6e7977"
            multiline
            textAlignVertical="top"
            className="min-h-[200] max-h-[400] p-4 text-on-surface font-body text-sm"
          />
        </View>

        <Pressable
          onPress={() => setRawText('')}
          className="self-end mb-4 px-4 py-2 rounded-lg bg-surface-container-low active:opacity-80"
        >
          <Text className="text-on-surface-variant font-body-medium text-xs">Clear</Text>
        </Pressable>

        <View className="bg-tertiary-container/10 border border-tertiary-container/30 rounded-xl p-4 mb-4 flex-row items-start gap-3">
          <Sparkles color="#7948e3" size={16} />
          <Text className="text-on-surface-variant font-body text-xs flex-1 leading-5">
            The AI automatically detects bank messages, extracts transaction amounts and merchants, and categorizes each expense.
          </Text>
        </View>

        <Pressable
          onPress={handleImport}
          disabled={!rawText.trim()}
          className="w-full flex-row items-center justify-center gap-2 bg-primary py-4 rounded-full active:opacity-90 disabled:opacity-30"
        >
          <Upload color="#ffffff" size={20} />
          <Text className="text-on-primary font-heading-semibold text-base">
            {parsedCount !== null ? `Imported ${parsedCount} transaction${parsedCount !== 1 ? 's' : ''}` : 'Analyze & Import'}
          </Text>
        </Pressable>

        {parsedCount !== null && parsedCount === 0 && (
          <Text className="text-alert font-body text-sm text-center mt-3">
            No bank transactions detected. Try pasting different SMS messages.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
