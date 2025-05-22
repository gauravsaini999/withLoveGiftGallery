// In App.js in a new project

import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  NavigationContainer,
  useNavigation,
  useFocusEffect,
  useNavigationState
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button } from 'react-native-elements';

function getDeepestRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route.state) {
    return getDeepestRouteName(route.state);
  }
  return route.name;
}

function ProfileIconButton({ onPress }) {
  const [iconname, setIconname] = React.useState("person-outline");
  const activeScreen = useNavigationState(state => getDeepestRouteName(state));
  useFocusEffect(
    React.useCallback(() => {
      if (activeScreen == 'Profile' ) {
        setIconname("account-circle");
      }
      else {
        setIconname("person-outline");
      }
    }, [activeScreen])
  )
  return (
    <TouchableOpacity onPress={onPress}>
      <MaterialIcons name={iconname} size={28} color="#fff" />
    </TouchableOpacity>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>This is the Profile Screen</Text>
    </View>
  )
}

function FeedScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Feeds' });
      }
    }, [navigation])
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>This is the Feed Screen</Text>
    </View>
  )
}

function MessagesScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ title: 'Messages' });
      }
    }, [navigation])
  );
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>This is the Messages Screen</Text>
    </View>
  )
}

function HomeScreen() {
  const navigation = useNavigation();
  const activeScreen = useNavigationState(state => getDeepestRouteName(state));
  // const [count, setCount] = React.useState(0);

  // to change the screen from within the header via buttons
  // React.useEffect(() => {
  //   // Use `setOptions` to update the button that we previously specified
  //   // Now the button includes an `onPress` handler to update the count
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <Button 
  //         title="Update Count" 
  //         onPress={() => setCount((c) => c + 1)}
  //         buttonStyle={{ backgroundColor: 'green' }}
  //         titleStyle={{ color: 'white' }}/>
  //     ),
  //   });
  // }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ headerTitle: 'Home' });
        navigation.navigate('Home');
      }
      navigation.setOptions({
        headerRight: () => (
          <ProfileIconButton onPress={() => navigation.navigate('Home', { screen: 'Profile' })} />
        )
      });
    }, [navigation])
  );

  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <ProfileIconButton onPress={() => navigation.navigate('Home', { screen: 'Profile' })} />
  //     ),
  //   });
  // }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      {/* <Text>Count: {count}</Text> */}
      <Button onPress={() => navigation.navigate('Details', {
        itemId: 86,
        otherParam: 'anything you want here',
      })}
        title="Go To Details"
        buttonStyle={{ backgroundColor: 'green' }}
        titleStyle={{ color: 'white' }} />
    </View>
  );
}

function DetailsScreen({ route }) {
  const navigation = useNavigation();
  const { itemId, otherParam } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Text>itemId: {JSON.stringify(itemId)}</Text>
      <Text>otherParam: {JSON.stringify(otherParam)}</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate('HomeScreen')} buttonStyle={{ backgroundColor: 'green' }}
        titleStyle={{ color: 'white' }} />
      <Button
        title="Go to Details... again"
        buttonStyle={{ backgroundColor: 'green' }}
        titleStyle={{ color: 'white' }}
        onPress={
          () =>
            navigation.push('Details', {
              itemId: Math.floor(Math.random() * 100),
            })
        }
      />
      <Button title="Go Back" onPress={() => navigation.goBack()} buttonStyle={{ backgroundColor: 'green' }}
        titleStyle={{ color: 'white' }} />
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
        headerStyle: { backgroundColor: 'mediumturquoise' },
        headerTintColor: 'white',
        headerRight: () => (<ProfileIconButton onPress={() => navigation.navigate('Home', { screen: 'Profile' })} />),
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          }
          else if (route.name === 'Feed') {
            iconName = 'list-outline'; // or 'rss', 'document-text-outline'
          } else if (route.name === 'Messages') {
            iconName = 'chatbubble-outline'; // or 'mail-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'mediumturquoise',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigatorComponent} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

function HomeStackNavigatorComponent() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ navigation }) => ({
        headerShown: false,
      })}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Overview',
          // You can override headerRight later in HomeScreen with setOptions
        })}
      />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerRight: () => null }} />
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