import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FEATURE_FLAGS } from '../services/config';
import { GoalsScreen } from '../screens/goals/GoalsScreen';
import { InvestmentsScreen } from '../screens/investments/InvestmentsScreen';
import { MoreMenuScreen } from '../screens/more/MoreMenuScreen';
import { MonthlyReportScreen } from '../screens/reports/MonthlyReportScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { FireCalculatorScreen } from '../screens/tools/FireCalculatorScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="MonthlyReport" component={MonthlyReportScreen} />
      {FEATURE_FLAGS.investments ? <Stack.Screen name="Investments" component={InvestmentsScreen} /> : null}
      <Stack.Screen name="FireCalculator" component={FireCalculatorScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
