import {
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CartScreen from './screens/Cart';
import HomeScreen from './screens/Home';
import ProfileScreen from './screens/Profile';
import ProfileIconButton from './components/ProfileButton';
import SelectedScreen from './screens/SelectedToys';
// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabbedNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({  
        headerShown: true,
        headerRight: () => (<ProfileIconButton onPress={() => {
          navigation.navigate('Profile');
        }} changeStyle={false} />),
        headerStyle: { backgroundColor: 'hotpink' },
        headerTintColor: 'white',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          }
          else if (route.name === 'Selected Toys') {
            iconName = 'list-outline'; // or 'rss', 'document-text-outline'
          } else if (route.name === 'Cart') {
            iconName = 'cart-outline'; // or 'mail-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'mediumturquoise',
        tabBarInactiveTintColor: 'gray',
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