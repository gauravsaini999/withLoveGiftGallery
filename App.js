// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import * as Font from 'expo-font';
import {
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
  useFocusEffect
} from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CartScreen from './screens/UnAuthenticatedTabScreens/Cart';
import HomeScreen from './screens/UnAuthenticatedTabScreens/Home';
import ProfileScreen from './screens/AuthenticationScreens/Profile';
import LinkPhoneScreen from './screens/AuthenticationScreens/LinkPhone';
import ProfileScreenDecider from './screens/AuthenticatedTabScreens/ProfileDecider';
import ProfileIconButton from './components/ProfileButton';
import SelectedScreen from './screens/UnAuthenticatedTabScreens/SelectedToys';
import MyOrders from './screens/AuthenticatedTabScreens/MyOrders';
import SavedAddresses from './screens/AuthenticatedTabScreens/SavedAddresses';
import { colors } from './shared/colors';
import { useNavigationHistory } from './zustand/useNavigationHistory';
import { useAuthenticationStateSlice } from './zustand/useAuthenticationStateSlice';
import { useFirebaseInit } from './zustand/useFirebaseInit';
import { Provider as PaperProvider } from 'react-native-paper';
import IntraScreenBackButton from './components/IntraScreenBackButton';
import Toast from 'react-native-toast-message';
import { CustomToast } from './shared/utilities';
import eventBus from './shared/eventBus';
import { signOut } from 'firebase/auth';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function LoginStackNavigatorComponent() {
  return (
    <Stack.Navigator
      initialRouteName="Authenticate Screen"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.screenContent[0],
        },
      }}
    >
      <Stack.Screen
        name="Authenticate Screen"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Phone Link"
        component={LinkPhoneScreen}
      />
    </Stack.Navigator>
  )
}


function UnauthenticatedTabbedNavigator() {
  const { reset } = useNavigationHistory();
  const { isLoggedIn, logoutFn } = useAuthenticationStateSlice();
  const { auth } = useFirebaseInit();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        logoutFn();
      }
    } catch (errMsg) {
      console.log('Error while signing out: ', errMsg);
    }
  };
  return (
    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerRight: () => (!isLoggedIn ? <ProfileIconButton onPress={() => {
          reset();
          if (!isLoggedIn) {
            navigation.navigate('Auth', { screen: "Authenticate Screen" });
          }
        }} changeStyle={false} />
          :
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={24} color="#333" />
          </TouchableOpacity>),
        headerStyle: {
          backgroundColor: colors.screenContent[1],
        },
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
          backgroundColor: colors.screenContent[1],
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#444',
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigatorComponent} />
      <Tab.Screen name="Selected Toys" component={SelectedScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Auth" component={LoginStackNavigatorComponent} options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}

function AuthenticatedTabbedNavigator() {
  const { reset } = useNavigationHistory();
  const navigation = useNavigation();
  const { auth } = useFirebaseInit();
  const { isLoggedIn, logoutFn } = useAuthenticationStateSlice();
  console.log("----- AuthenticatedTabbedNavigator Rendered -----");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        logoutFn();
      }
    } catch (errMsg) {
      console.log('Error while signing out: ', errMsg);
    }
  };
  return (
    <Tab.Navigator
      initialRouteName='Home'
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.screenContent[1],
        },
        headerRight: () => (isLoggedIn ?
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={20} color="#333" style={{ marginRight: 10 }} />
          </TouchableOpacity> : <ProfileIconButton onPress={() => {
            navigation.navigate('Auth', { screen: "Authenticate Screen" });
          }} changeStyle={false} />),
        headerLeft: () => {
          return <IntraScreenBackButton />
        },
        headerTitleStyle: {
          color: '#444',
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Edit Profile') {
            iconName = focused ? 'create' : 'create-outline'; // person-circle-outline 
          }
          else if (route.name === 'My Orders') {
            iconName = focused ? 'cube' : 'cube-outline'; // receipt-outline
          } else if (route.name === 'Saved Addresses') {
            iconName = focused ? 'location' : 'location-outline'; // home-outline
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.screenContent[1],
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#444',
      })}>
      <Tab.Screen name="Edit Profile" component={ProfileScreenDecider} />
      <Tab.Screen name="My Orders" component={MyOrders} />
      <Tab.Screen name="Saved Addresses" component={SavedAddresses} />
      <Tab.Screen name="Auth" component={LoginStackNavigatorComponent} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="Home" component={HomeStackNavigatorComponent} options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator >
  );
}

function HomeStackNavigatorComponent() {
  return (
    <Stack.Navigator
      initialRouteName="Home Screen"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.screenContent[1],
        },
      }}
    >
      <Stack.Screen
        name="Home Screen"
        component={HomeScreen}
      />
      <Stack.Screen name="Edit Profile" component={ProfileScreenDecider} />
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

const toastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
  info: (props) => <CustomToast {...props} type="info" />,
};

export default function App() {
  const { push, pop, history, setActiveRoute, insertInitPaths, activeRoute } = useNavigationHistory();
  const routeNameRef = React.useRef(null);
  const { isLoggedIn } = useAuthenticationStateSlice();
  const navigationRef = useNavigationContainerRef();
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  enableScreens();
  // To check whether persistence is actually happening in zustand
  // AsyncStorage.getItem('firebase-storage').then((value) => {
  //   console.log('Persisted raw JSON:', value);
  // });
  console.log(activeRoute, '-------- active route ----------')
  console.log(isLoggedIn, '----- is logged in ----------')

  const loadFonts = async () => {
    await Font.loadAsync({
      'ComicSansMS': require('./assets/fonts/ComicSansMS.ttf'),
    });
    setFontsLoaded(true);
  };

  React.useEffect(() => {
    loadFonts();
  }, []);

  React.useEffect(() => {
    if (isLoggedIn && navigationRef.isReady()) {
      eventBus.emit("tabChangedComplete", { completed: true });
      console.log('Navigating to Home screen after login state change');
      navigationRef.navigate('Home');
    }
  }, [isLoggedIn, navigationRef]);

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        {/* <SafeAreaView style={{ flex: 1, backgroundColor: '#EEE' }}> */}
        <NavigationContainer
          ref={navigationRef}
          onReady={(nav) => {
            const fullState = navigationRef.getRootState();
            console.log('Root nav state:', JSON.stringify(fullState, null, 2));
            const stateToPush = JSON.stringify(fullState, null, 2)
            insertInitPaths(stateToPush);

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
            setActiveRoute(routeNameRef.current);
          }}>
          {isLoggedIn ? <AuthenticatedTabbedNavigator /> : <UnauthenticatedTabbedNavigator />}
        </NavigationContainer>
        {/* </SafeAreaView> */}
        {/* Toast MUST be outside navigation, and setRef is required if rendering inside portals */}
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </PaperProvider>
  );
};