import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AutomaticExpenseScreen } from '../screens/smsTracking/AutomaticExpenseScreen';
import { WhySmsPermissionScreen } from '../screens/smsTracking/WhySmsPermissionScreen';
import { RequestSmsPermissionScreen } from '../screens/smsTracking/RequestSmsPermissionScreen';
import { ScanningTransactionsScreen } from '../screens/smsTracking/ScanningTransactionsScreen';
import { ProcessingCompleteScreen } from '../screens/smsTracking/ProcessingCompleteScreen';
import { ExpenseSummaryDashboardScreen } from '../screens/smsTracking/ExpenseSummaryDashboardScreen';
import { ManualSmsImportScreen } from '../screens/smsTracking/ManualSmsImportScreen';
import { SmsTrackingStackParamList } from './types';

const Stack = createNativeStackNavigator<SmsTrackingStackParamList>();

export function SmsTrackingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AutomaticExpense" component={AutomaticExpenseScreen} />
      <Stack.Screen name="WhySmsPermission" component={WhySmsPermissionScreen} />
      <Stack.Screen name="RequestSmsPermission" component={RequestSmsPermissionScreen} />
      <Stack.Screen name="ScanningTransactions" component={ScanningTransactionsScreen} />
      <Stack.Screen name="ProcessingComplete" component={ProcessingCompleteScreen} />
      <Stack.Screen name="ExpenseSummaryDashboard" component={ExpenseSummaryDashboardScreen} />
      <Stack.Screen name="ManualSmsImport" component={ManualSmsImportScreen} />
    </Stack.Navigator>
  );
}