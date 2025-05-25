import * as React from 'react';
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CartScreen from './screens/Cart';
import HomeScreen from './screens/Home';
import ProfileScreen from './screens/Profile';
import ProfileIconButton from './components/ProfileButton';
import SelectedScreen from './screens/SelectedToys';
import { colors } from './shared/colors';
import { useNavigationHistory } from './zustand/useNavigationHistory';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabbedNavigator() {
  const navigation = useNavigation();
  const { reset } = useNavigationHistory();

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        reset();
      }
    }, [navigation])
  )
  return (  
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerRight: () => (<ProfileIconButton onPress={() => {
          navigation.navigate('Profile');
        }} changeStyle={false} />),
        headerStyle: {
          backgroundColor: colors.headerAndTabBar[2],
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
          backgroundColor: colors.headerAndTabBar[2],
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
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'rgba(232, 241, 231, 0.5)',
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <TabbedNavigator />
    </NavigationContainer>
  );
}