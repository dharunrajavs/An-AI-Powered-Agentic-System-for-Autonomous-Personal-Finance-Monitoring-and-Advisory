import React from 'react';
import { ScrollView, View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from './TopBar';

interface ScreenProps {
  title: string;
  showBell?: boolean;
  showProfile?: boolean;
  scroll?: boolean;
  edges?: Edge[];
  contentClassName?: string;
  children?: React.ReactNode;
}

export function Screen({
  title,
  showBell = true,
  showProfile = false,
  scroll = true,
  edges = ['top', 'left', 'right', 'bottom'],
  contentClassName = '',
  children,
}: ScreenProps) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? { contentContainerStyle: { flexGrow: 1, paddingBottom: 32 }, keyboardShouldPersistTaps: 'handled' as const }
    : { style: { flex: 1 } };

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <TopBar title={title} showBell={showBell} showProfile={showProfile} />
      <Content className={`flex-1 px-5 ${contentClassName}`} {...contentProps}>
        {children}
      </Content>
    </SafeAreaView>
  );
}
