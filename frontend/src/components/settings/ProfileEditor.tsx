import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile } from '../../hooks';
import { useUiStore } from '../../store/uiStore';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileEditor() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const showToast = useUiStore((state) => state.showToast);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name ?? '', email: profile?.email ?? '' },
  });

  if (!profile) {
    return null;
  }

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(
      { name: values.name, email: values.email },
      { onSuccess: () => showToast('Profile updated', 'success') }
    );
  };

  const isSaving = isSubmitting || updateProfile.isPending;

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Text className="font-heading-bold text-lg text-primary">{profile.avatarInitials}</Text>
        </View>
        <Text className="flex-1 font-body text-xs text-on-surface-variant">
          Your name and email are shared with the agent to personalize insights.
        </Text>
      </View>

      <View>
        <Text className="mb-1.5 font-body-medium text-xs text-on-surface-variant">Full name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Jane Doe"
              placeholderTextColor="#6e7977"
              autoCapitalize="words"
              textContentType="name"
              accessibilityLabel="Full name"
              className="rounded-xl border border-border bg-surface-container-low px-4 py-3.5 font-body text-on-surface"
            />
          )}
        />
        {errors.name ? <Text className="mt-1 font-body text-xs text-alert">{errors.name.message}</Text> : null}
      </View>

      <View>
        <Text className="mb-1.5 font-body-medium text-xs text-on-surface-variant">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              placeholderTextColor="#6e7977"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
              className="rounded-xl border border-border bg-surface-container-low px-4 py-3.5 font-body text-on-surface"
            />
          )}
        />
        {errors.email ? <Text className="mt-1 font-body text-xs text-alert">{errors.email.message}</Text> : null}
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Save profile"
        className={`items-center rounded-xl bg-primary py-3.5 active:opacity-90 ${isSaving ? 'opacity-70' : ''}`}
      >
        <Text className="font-body-semibold text-sm text-on-primary">{isSaving ? 'Saving…' : 'Save changes'}</Text>
      </Pressable>
    </View>
  );
}
