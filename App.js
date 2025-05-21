// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import {
  NavigationContainer,
  useNavigation
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button } from '@react-navigation/elements';
import Ionicons from 'react-native-vector-icons/Ionicons';

function FeedScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <Text>This is the Feed Screen</Text>
    </View>
  )
}

function MessagesScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Text>This is the Messages Screen</Text>
    </View>
  )
}

function HomeScreen() {
  const navigation = useNavigation();
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => setCount((c) => c + 1)}>Update count</Button>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Text>Count: {count}</Text>
      <Button onPress={() => navigation.navigate('Details', {
        itemId: 86,
        otherParam: 'anything you want here',
      })}>
        Go to Details
      </Button>
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
      <Button onPress={() => navigation.navigate('Home')}>Go to Home</Button>
      <Button
        onPress={
          () =>
            navigation.push('Details', {
              itemId: Math.floor(Math.random() * 100),
            })
        }
      >
        Go to Details... again
      </Button>
      <Button onPress={() => navigation.goBack()}>Go back</Button>
      <Button onPress={() => navigation.navigate('More')}>Go to Tabs Screen</Button>
    </View>
  );
}

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MoreTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = 'list-outline'; // or 'rss', 'document-text-outline'
          } else if (route.name === 'Messages') {
            iconName = 'chatbubble-outline'; // or 'mail-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: 'tomato' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Overview',
            // You can override headerRight later in HomeScreen with setOptions
            headerRight: () => <Button title="Update count" onPress={() => { }} />,
          }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="More"
          component={MoreTabs}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}