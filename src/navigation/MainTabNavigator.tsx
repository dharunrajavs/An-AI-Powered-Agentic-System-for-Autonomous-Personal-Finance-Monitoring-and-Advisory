import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '../components/layout';
import { AdvisorScreen } from '../screens/advisor/AdvisorScreen';
import { BudgetsScreen } from '../screens/budgets/BudgetsScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { MoreNavigator } from './MoreNavigator';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Advisor" component={AdvisorScreen} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
}
