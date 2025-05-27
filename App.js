import * as React from 'react';
import {
  StatusBar
} from 'react-native';
import {
  NavigationContainer
} from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CartScreen from './screens/HomeTabs/Cart';
import HomeScreen from './screens/HomeTabs/Home';
import ProfileScreen from './screens/AuthenticationScreens/Profile1';
import ProfileIconButton from './components/ProfileButton';
import SelectedScreen from './screens/HomeTabs/SelectedToys';
import { colors } from './shared/colors';
import { useNavigationHistory } from './zustand/useNavigationHistory';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function TabbedNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerRight: () => (<ProfileIconButton onPress={() => {
          navigation.navigate('Profile', { formType: 'Sign Up' });
        }} changeStyle={false} />),
        headerStyle: {
          backgroundColor: colors.headerAndTabBar[3],
        },
        headerTintColor: '#444',
        headerTitleStyle: {
          color: '#444',
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          }
          else if (route.name === 'Selected Toys') {
            iconName = focused ? 'list' : 'list-outline'; // or 'rss', 'document-text-outline'
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline'; // or 'mail-outline'
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.headerAndTabBar[3],
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#444',
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigatorComponent} />
      <Tab.Screen name="Selected Toys" component={SelectedScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}

function HomeStackNavigatorComponent() {
  return (
    <Stack.Navigator
      initialRouteName="Home Screen"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'rgba(232, 241, 231, 0.5)',
        },
      }}
    >
      <Stack.Screen
        name="Home Screen"
        component={HomeScreen}
      />
    </Stack.Navigator>
  )
}

function getActiveRouteName(state) {
  if (!state || !state.routes || state.index == null) return null;
  const route = state.routes[state.index];
  if (route.state) {
    // Recursively dive into nested navigators
    return getActiveRouteName(route.state);
  }
  return route.name || null;
}

export default function App() {
  const { push, pop, history } = useNavigationHistory();
  const routeNameRef = React.useRef(null);
  enableScreens();
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {/* <SafeAreaView style={{ flex: 1, backgroundColor: '#EEE' }}> */}
        <NavigationContainer
          onReady={(nav) => {
            const rootState = nav?.getRootState?.();
            if (!rootState) return;

            const initialRoute = getActiveRouteName(rootState);
            if (initialRoute) {
              routeNameRef.current = initialRoute;
              push(initialRoute);
            }
          }}
          onStateChange={(state) => {
            const currentRoute = getActiveRouteName(state);
            const previousRoute = routeNameRef.current;

            if (!currentRoute || currentRoute === previousRoute) return;

            if (history.length >= 2 && history[history.length - 2] === currentRoute) {
              pop(); // went back
            } else {
              push(currentRoute); // went forward
            }

            routeNameRef.current = currentRoute;
          }}>
          <TabbedNavigator />
        </NavigationContainer>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
}