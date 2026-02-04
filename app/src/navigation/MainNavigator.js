import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import JourneyScreen from '../screens/JourneyScreen';
import PrayerScreen from '../screens/PrayerScreen';
import CommunityScreen from '../screens/CommunityScreen';
import LibraryScreen from '../screens/LibraryScreen';
import PodcastScreen from '../screens/PodcastScreen';

// Detail Screens
import DevotionalScreen from '../screens/DevotionalScreen';
import WeekDetailScreen from '../screens/WeekDetailScreen';
import RevivalDetailScreen from '../screens/RevivalDetailScreen';
import TestimonyScreen from '../screens/TestimonyScreen';
import EpisodeDetailScreen from '../screens/EpisodeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Icon Component
const TabIcon = ({ name, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{
      fontSize: 20,
      color: focused ? '#FF6B35' : '#8E8E93'
    }}>
      {name === 'Home' && '🔥'}
      {name === 'Journey' && '📖'}
      {name === 'Prayer' && '🙏'}
      {name === 'Community' && '👥'}
      {name === 'Podcast' && '🎙️'}
      {name === 'Library' && '📚'}
    </Text>
  </View>
);

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Reawakened' }}
      />
      <Stack.Screen
        name="Devotional"
        component={DevotionalScreen}
        options={{ title: 'Daily Devotional' }}
      />
    </Stack.Navigator>
  );
}

// Journey Stack
function JourneyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="JourneyMain"
        component={JourneyScreen}
        options={{ title: 'The Journey' }}
      />
      <Stack.Screen
        name="WeekDetail"
        component={WeekDetailScreen}
        options={({ route }) => ({ title: route.params?.title || 'Week' })}
      />
    </Stack.Navigator>
  );
}

// Prayer Stack
function PrayerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="PrayerMain"
        component={PrayerScreen}
        options={{ title: 'Prayer Hub' }}
      />
    </Stack.Navigator>
  );
}

// Community Stack
function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="CommunityMain"
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Stack.Screen
        name="Testimony"
        component={TestimonyScreen}
        options={{ title: 'Share Testimony' }}
      />
    </Stack.Navigator>
  );
}

// Podcast Stack
function PodcastStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="PodcastMain"
        component={PodcastScreen}
        options={{ title: 'The Reawakened One' }}
      />
      <Stack.Screen
        name="EpisodeDetail"
        component={EpisodeDetailScreen}
        options={({ route }) => ({ title: route.params?.episode?.title || 'Episode' })}
      />
    </Stack.Navigator>
  );
}

// Library Stack
function LibraryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A2E' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="LibraryMain"
        component={LibraryScreen}
        options={{ title: 'Revival Library' }}
      />
      <Stack.Screen
        name="RevivalDetail"
        component={RevivalDetailScreen}
        options={({ route }) => ({ title: route.params?.title || 'Revival' })}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2D2D44',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Journey" component={JourneyStack} />
      <Tab.Screen name="Podcast" component={PodcastStack} />
      <Tab.Screen name="Prayer" component={PrayerStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Library" component={LibraryStack} />
    </Tab.Navigator>
  );
}
