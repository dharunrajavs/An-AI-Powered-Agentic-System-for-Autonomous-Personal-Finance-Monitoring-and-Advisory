import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OtpVerification: { phone: string; email: string; password: string; name: string; devOtp?: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Goals: undefined;
  Reports: undefined;
  MonthlyReport: { month: string; year: number } | undefined;
  Investments: undefined;
  FireCalculator: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Budgets: undefined;
  Advisor: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type SmsTrackingStackParamList = {
  AutomaticExpense: undefined;
  WhySmsPermission: undefined;
  RequestSmsPermission: undefined;
  ScanningTransactions: undefined;
  ProcessingComplete: undefined;
  ExpenseSummaryDashboard: undefined;
  ManualSmsImport: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Carousel: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  Syncing: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Notifications: undefined;
  Insights: undefined;
  Subscriptions: undefined;
  SmsTracking: NavigatorScreenParams<SmsTrackingStackParamList>;
};

export type RootNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
