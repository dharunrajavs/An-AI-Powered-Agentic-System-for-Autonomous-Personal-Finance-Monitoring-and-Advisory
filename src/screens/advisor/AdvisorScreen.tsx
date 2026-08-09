import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MoreVertical, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AgentActionLog } from '../../components/agent/AgentActionLog';
import { AgentChatWindow } from '../../components/agent/AgentChatWindow';
import { ChatInput } from '../../components/agent/ChatInput';
import { SuggestedPromptChips } from '../../components/agent/SuggestedPromptChips';
import { useChatMessages } from '../../hooks';

type AdvisorTab = 'chat' | 'activity';

export function AdvisorScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<AdvisorTab>('chat');
  const { data: messages } = useChatMessages();
  const isEmpty = !messages || messages.length === 0;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background"
      style={Platform.OS === 'android' ? { paddingBottom: keyboardHeight } : {}}
    >
      {/* Header */}
      <View className="bg-background px-6 py-4 flex-row items-center justify-between"
        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
      >
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft color="#005c55" size={24} />
          </Pressable>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-primary text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>FinSense AI</Text>
              <Sparkles color="#6029c9" size={20} fill="#6029c9" />
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-on-surface-variant text-xs" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Online</Text>
            </View>
          </View>
        </View>
        <Pressable className="p-2 rounded-full">
          <MoreVertical color="#3e4947" size={24} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-surface-container rounded-full p-1 mx-6 mb-3">
        <Pressable
          onPress={() => setTab('chat')}
          className={`flex-1 py-2 rounded-full ${tab === 'chat' ? 'bg-primary' : ''}`}
        >
          <Text className={`text-center text-xs font-semibold ${tab === 'chat' ? 'text-on-primary' : 'text-on-surface-variant'}`}
            style={{ fontFamily: 'Inter', fontWeight: '600' }}
          >
            Chat
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('activity')}
          className={`flex-1 py-2 rounded-full ${tab === 'activity' ? 'bg-primary' : ''}`}
        >
          <Text className={`text-center text-xs font-semibold ${tab === 'activity' ? 'text-on-primary' : 'text-on-surface-variant'}`}
            style={{ fontFamily: 'Inter', fontWeight: '600' }}
          >
            Activity
          </Text>
        </Pressable>
      </View>

      {tab === 'chat' ? (
        <View className="flex-1 px-6"
          style={Platform.OS === 'ios' ? { paddingBottom: keyboardHeight } : {}}
        >
          {isEmpty ? <SuggestedPromptChips /> : null}
          <AgentChatWindow />
          <ChatInput />
        </View>
      ) : (
        <View className="flex-1 px-6">
          <AgentActionLog />
        </View>
      )}
    </SafeAreaView>
  );
}
