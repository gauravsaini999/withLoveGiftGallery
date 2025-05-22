import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function ProfileIconButton({ onPress, changeStyle }) {
  console.log(changeStyle, ' <---- changeStyle')
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialIcons name={changeStyle ? "account-circle" : "person-outline"} size={28} color="#fff" />
    </TouchableOpacity>
  );
}

function ProfileScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => <ProfileIconButton changeStyle={true} onPress={() => {
          navigation.navigate('Profile');
        }} />
      })
    }, [navigation])
  )
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Your Profile Screen</Text>
    </View>
  )
}

function SelectedScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Selected Toys' });
      }
    }, [navigation])
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Your Selected Toys</Text>
    </View>
  )
}

function CartScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Cart' });
      }
    }, [navigation])
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>Cart Screen</Text>
    </View>
  )
}

function HomeScreen() {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ headerTitle: 'Home' });
      }
    }, [navigation])
  );

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Your Home Screen</Text>
    </View>
  );
}

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MoreTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({  
        headerShown: true,
        headerRight: () => (<ProfileIconButton onPress={() => {
          navigation.navigate('Profile');
        }} changeStyle={false} />),
        headerStyle: { backgroundColor: 'mediumturquoise' },
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
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerRight: () => null, tabBarItemStyle: { display: 'none' } }} />
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
      <MoreTabs />
    </NavigationContainer>
  );
}