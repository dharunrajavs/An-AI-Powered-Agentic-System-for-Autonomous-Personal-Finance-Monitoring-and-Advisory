import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useUiStore } from '../../store/uiStore';
import { scanReceipt, ReceiptData } from '../../services/receiptOcr';
import { CATEGORIES } from '../../services';

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Camera roll permission is required', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setScanning(true);
    try {
      const data = await scanReceipt(result.assets[0].uri);
      if (data.confidence >= 50) {
        onScanComplete(data);
        showToast(`Scanned: ${data.merchant} — ₹${data.amount}`, 'success');
      } else {
        showToast('Low confidence scan, please try again', 'error');
      }
    } catch {
      showToast('Failed to scan receipt', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast('Camera permission is required', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setScanning(true);
    try {
      const data = await scanReceipt(result.assets[0].uri);
      if (data.confidence >= 50) {
        onScanComplete(data);
        showToast(`Scanned: ${data.merchant} — ₹${data.amount}`, 'success');
      } else {
        showToast('Low confidence scan, please try again', 'error');
      }
    } catch {
      showToast('Failed to scan receipt', 'error');
    } finally {
      setScanning(false);
    }
  };

  if (scanning) {
    return (
      <View className="flex-row items-center justify-center gap-2 py-2">
        <ActivityIndicator size="small" color="#005c55" />
        <Text className="text-on-surface-variant font-body text-sm">Scanning receipt...</Text>
      </View>
    );
  }

  return (
    <View className="flex-row gap-2 mb-3">
      <Pressable
        onPress={handleTakePhoto}
        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 active:opacity-80"
      >
        <Text className="text-base">📷</Text>
        <Text className="text-on-surface font-body-semibold text-sm">Camera</Text>
      </Pressable>
      <Pressable
        onPress={handlePickImage}
        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 active:opacity-80"
      >
        <Text className="text-base">🖼️</Text>
        <Text className="text-on-surface font-body-semibold text-sm">Gallery</Text>
      </Pressable>
    </View>
  );
}
