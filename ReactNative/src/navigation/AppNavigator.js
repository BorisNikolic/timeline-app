/**
 * AppNavigator - Bottom tabs (Home, Lineup, Map, Info, My Plan) with themed stacks.
 */

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MapScreen from '../screens/MapScreen';
import InfoScreen from '../screens/InfoScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import BlogPostScreen from '../screens/BlogPostScreen';

import PyramidTabBar from './PyramidTabBar';
import { useTheme } from '../contexts/ThemeContext';
import { fonts } from '../theme/tokens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function useStackScreenOptions() {
  const { t } = useTheme();
  return {
    headerStyle: { backgroundColor: t.bg2 },
    headerTintColor: t.ink,
    headerTitleStyle: { fontFamily: fonts.displayBold, fontSize: 18 },
    contentStyle: { backgroundColor: t.bg },
  };
}

function HomeStack() {
  const opts = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={opts}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="BlogPost"
        component={BlogPostScreen}
        options={({ route }) => ({ title: route.params?.title || 'News', headerBackTitle: 'Home' })}
      />
    </Stack.Navigator>
  );
}

function ScheduleStack() {
  const opts = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={opts}>
      <Stack.Screen name="ScheduleMain" component={ScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MapStack() {
  const opts = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={{ ...opts, headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
    </Stack.Navigator>
  );
}

function InfoStack() {
  const opts = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={{ ...opts, headerShown: false }}>
      <Stack.Screen name="InfoMain" component={InfoScreen} />
    </Stack.Navigator>
  );
}

function MyEventsStack() {
  const opts = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={{ ...opts, headerShown: false }}>
      <Stack.Screen name="MyEventsMain" component={MyEventsScreen} options={{ title: 'My Plan' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const FULLSCREEN_ROUTES = ['BlogPost'];
const TAB_BAR_ANIMATION_DURATION = 500;

function AnimatedTabBar(props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  const currentTabRoute = props.state.routes[props.state.index];
  const focused = getFocusedRouteNameFromRoute(currentTabRoute);
  const shouldHide = !!focused && FULLSCREEN_ROUTES.includes(focused);

  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: shouldHide ? 0 : 1,
      duration: TAB_BAR_ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [shouldHide, animValue]);

  const height = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, tabBarHeight] });

  return (
    <Animated.View style={{ height, opacity: animValue, overflow: 'hidden' }} pointerEvents={shouldHide ? 'none' : 'auto'}>
      <PyramidTabBar {...props} />
    </Animated.View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ title: 'Lineup' }} />
      <Tab.Screen name="Map" component={MapStack} options={{ title: 'Map' }} />
      <Tab.Screen name="Info" component={InfoStack} options={{ title: 'Info' }} />
      <Tab.Screen name="MyEvents" component={MyEventsStack} options={{ title: 'My Plan' }} />
    </Tab.Navigator>
  );
}
