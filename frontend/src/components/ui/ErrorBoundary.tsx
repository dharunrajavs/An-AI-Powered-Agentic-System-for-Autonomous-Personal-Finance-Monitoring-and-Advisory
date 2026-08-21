import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    const stackLines = errorInfo.componentStack
      .split('\n')
      .filter(Boolean)
      .map((l) => l.trim())
      .filter((l) => !l.startsWith('at CssInterop') && !l.startsWith('at RNCSafeArea'));
    console.error('[ErrorBoundary] COMPONENT STACK >>>');
    stackLines.forEach((l) => console.error('[ErrorBoundary]   ' + l));
    console.error('[ErrorBoundary] <<< END COMPONENT STACK');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <View className="w-16 h-16 rounded-full bg-alert/10 items-center justify-center mb-4">
            <Text className="text-2xl">!</Text>
          </View>
          <Text className="text-on-surface font-heading-bold text-lg text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-on-surface-variant font-body text-sm text-center mb-6 leading-5">
            We encountered an unexpected error. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-primary px-8 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-on-primary font-body-semibold text-sm">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
