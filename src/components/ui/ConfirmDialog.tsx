import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-on-surface/40 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-on-surface font-heading-semibold text-lg mb-2">{title}</Text>
          {message ? <Text className="text-muted font-body text-sm leading-5 mb-5">{message}</Text> : null}
          <View className="flex-row gap-3 mt-1">
            <Pressable
              onPress={onCancel}
              className="flex-1 items-center py-3 rounded-xl bg-background border border-border active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text className="text-on-surface font-body-medium text-sm">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 items-center py-3 rounded-xl active:opacity-80 ${destructive ? 'bg-alert' : 'bg-gold'}`}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text className={`font-body-semibold text-sm ${destructive ? 'text-white' : 'text-background'}`}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
