import { CheckCircle, Loader, MessageCircle, Smartphone, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { UpiProvider } from '../../types';
import { useUpiProviders, useVerifyUpiId, useLinkUpiAccount, useUpiAccounts } from '../../hooks';
import { useUiStore } from '../../store/uiStore';

interface ConnectUpiFormProps {
  onContinue: () => void;
  onSkip: () => void;
}

const PROVIDER_ICONS: Record<string, string> = {
  googlepay: '💰',
  phonepe: '📱',
  paytm: '🪙',
  amazonpay: '📦',
  other: '🏦',
};

type Step = 'phone' | 'otp' | 'upi';

export function ConnectUpiForm({ onContinue, onSkip }: ConnectUpiFormProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<UpiProvider | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const { data: providers = [] } = useUpiProviders();
  const { data: upiAccounts = [] } = useUpiAccounts();
  const verifyMutation = useVerifyUpiId();
  const linkMutation = useLinkUpiAccount();
  const showToast = useUiStore((s) => s.showToast);

  const verifiedData = verifyMutation.data;
  const isValidating = verifyMutation.isPending;

  const handleSendOtp = () => {
    if (phone.trim().length < 10) return;
    setOtpSent(true);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (otp.trim().length < 4) return;
    setStep('upi');
  };

  const handleVerifyUpi = () => {
    if (!upiId.trim()) return;
    verifyMutation.mutate(upiId.trim());
  };

  const handleLink = () => {
    if (!verifiedData?.valid || !selectedProvider) return;
    linkMutation.mutate(
      { upiId: upiId.trim(), provider: selectedProvider },
      {
        onSuccess: () => {
          showToast('UPI account linked', 'success');
          setPhone('');
          setOtp('');
          setUpiId('');
          setSelectedProvider(null);
          setOtpSent(false);
          setStep('phone');
          verifyMutation.reset();
        },
        onError: () => showToast('Could not link UPI account', 'error'),
      }
    );
  };

  return (
    <View className="gap-6">
      <View className="items-center gap-3 mb-1">
        <View className="flex-row items-center gap-1.5 bg-secondary-container/20 rounded-full px-3 py-1.5">
          <Smartphone color="#006c49" size={14} />
          <Text className="text-secondary font-body-medium text-xs">UPI — Unified Payments Interface</Text>
        </View>
        <Text className="text-on-surface font-heading-bold text-2xl text-center">Link your UPI ID</Text>
        <Text className="text-on-surface-variant font-body text-sm text-center leading-5 px-4">
          Connect your UPI accounts to track all your digital payments automatically.
        </Text>
      </View>

      {/* Already linked accounts */}
      {upiAccounts.length > 0 && (
        <View className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 gap-2">
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">
            Linked UPI Accounts
          </Text>
          {upiAccounts.map((acc) => (
            <View key={acc.id} className="flex-row items-center gap-3">
              <Text className="text-lg">{PROVIDER_ICONS[acc.provider] ?? '🏦'}</Text>
              <View className="flex-1">
                <Text className="text-on-surface font-body-medium text-sm">{acc.upiId}</Text>
                <Text className="text-on-surface-variant font-body text-xs">{acc.bankName}</Text>
              </View>
              {acc.isPrimary && (
                <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                  <Text className="text-primary font-body-bold text-[10px]">PRIMARY</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Step 1: Phone Number */}
      {step === 'phone' && (
        <View className="gap-3">
          <Text className="text-on-surface font-body-medium text-sm">Enter your registered mobile number</Text>
          <Text className="text-on-surface-variant font-body text-xs">An OTP will be sent to verify your identity.</Text>
          <View className="flex-row gap-2">
            <View className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 items-center justify-center">
              <Text className="text-on-surface font-body-medium text-sm">+91</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              placeholderTextColor="#6e7977"
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-body text-sm"
            />
          </View>
          <Pressable
            onPress={handleSendOtp}
            disabled={phone.trim().length < 10}
            className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
          >
            <MessageCircle color="#ffffff" size={18} />
            <Text className="text-on-primary font-heading-semibold text-base">Send OTP</Text>
          </Pressable>
        </View>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <View className="gap-3">
          <Text className="text-on-surface font-body-medium text-sm">Enter OTP</Text>
          <Text className="text-on-surface-variant font-body text-xs">
            OTP sent to +91 {phone}
          </Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#6e7977"
            keyboardType="number-pad"
            maxLength={6}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-body text-sm text-center text-lg tracking-[8px]"
          />
          <Pressable
            onPress={handleVerifyOtp}
            disabled={otp.trim().length < 4}
            className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
          >
            <CheckCircle color="#ffffff" size={18} />
            <Text className="text-on-primary font-heading-semibold text-base">Verify OTP</Text>
          </Pressable>
          <Pressable onPress={() => { setStep('phone'); setOtpSent(false); setOtp(''); }} className="py-2">
            <Text className="text-on-surface-variant font-body-medium text-sm text-center">Change phone number</Text>
          </Pressable>
        </View>
      )}

      {/* Step 3: UPI ID + Provider + Link */}
      {step === 'upi' && (
        <>
          {/* Enter UPI ID */}
          <View className="gap-2">
            <Text className="text-on-surface font-body-medium text-sm">Enter your UPI ID</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={upiId}
                onChangeText={(v) => { setUpiId(v); verifyMutation.reset(); }}
                placeholder="username@bank"
                placeholderTextColor="#6e7977"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-body text-sm"
              />
              <Pressable
                onPress={handleVerifyUpi}
                disabled={!upiId.trim() || isValidating}
                className="bg-primary px-5 py-3 rounded-xl items-center justify-center active:opacity-80"
              >
                {isValidating ? (
                  <Loader color="#ffffff" size={18} />
                ) : (
                  <Text className="text-on-primary font-body-semibold text-sm">Verify</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Verification Result */}
          {verifiedData && (
            <View className={`rounded-xl p-4 border ${verifiedData.valid ? 'bg-secondary-container/10 border-secondary/30' : 'bg-alert/10 border-alert/30'}`}>
              <View className="flex-row items-start gap-3">
                {verifiedData.valid ? (
                  <CheckCircle color="#006c49" size={20} />
                ) : (
                  <XCircle color="#ba1a1a" size={20} />
                )}
                <View className="flex-1">
                  {verifiedData.valid ? (
                    <>
                      <Text className="text-secondary font-body-semibold text-sm">UPI ID Verified</Text>
                      <Text className="text-on-surface font-body text-sm mt-1">{verifiedData.accountHolder}</Text>
                      <Text className="text-on-surface-variant font-body text-xs">{verifiedData.bankName}</Text>
                    </>
                  ) : (
                    <Text className="text-alert font-body-semibold text-sm">Invalid UPI ID. Please check and try again.</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Provider Selection */}
          {verifiedData?.valid && (
            <View className="gap-2">
              <Text className="text-on-surface font-body-medium text-sm">Choose UPI App</Text>
              <View className="flex-row flex-wrap gap-2">
                {providers.map((p) => {
                  const active = selectedProvider === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelectedProvider(active ? null : p.id as UpiProvider)}
                      className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
                    >
                      <Text className="text-lg">{PROVIDER_ICONS[p.id] ?? '🏦'}</Text>
                      <Text className={`font-body-medium text-sm ${active ? 'text-on-primary' : 'text-on-surface'}`}>{p.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Link Button */}
          {verifiedData?.valid && selectedProvider && (
            <Pressable
              onPress={handleLink}
              disabled={linkMutation.isPending}
              className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
            >
              <Text className="text-on-primary font-heading-semibold text-base">
                {linkMutation.isPending ? 'Linking…' : 'Link UPI Account'}
              </Text>
            </Pressable>
          )}
        </>
      )}

      {/* Skip / Continue */}
      <View className="gap-3 mt-2">
        <Pressable onPress={onSkip} className="py-2">
          <Text className="text-on-surface-variant font-body-medium text-sm text-center">Skip — I'll do this later</Text>
        </Pressable>
        <Pressable
          onPress={onContinue}
          className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-base">Continue</Text>
          <Text className="text-on-primary font-heading-semibold text-base">→</Text>
        </Pressable>
      </View>
    </View>
  );
}
