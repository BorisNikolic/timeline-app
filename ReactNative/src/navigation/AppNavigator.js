/**
 * AppNavigator - Bottom tabs with Home, Schedule, Map, Info, and My Events
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MapScreen from '../screens/MapScreen';
import InfoScreen from '../screens/InfoScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import BlogPostScreen from '../screens/BlogPostScreen';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: colors.navyDark,
  },
  headerTintColor: colors.text.inverse,
  headerTitleStyle: {
    ...typography.textStyles.h4,
  },
};

// Home stack with event detail and blog post navigation
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="BlogPost"
        component={BlogPostScreen}
        options={({ route }) => ({
          title: route.params?.title || 'News',
          headerBackTitle: 'Home',
        })}
      />
    </Stack.Navigator>
  );
}

// Schedule stack with event detail
function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={{
          title: 'PYRAMID FESTIVAL',
          headerTitleStyle: {
            ...typography.textStyles.h4,
            letterSpacing: 2,
          },
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
    </Stack.Navigator>
  );
}

// Map stack (no nested screens for now)
function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerShown: false }}>
      <Stack.Screen
        name="MapMain"
        component={MapScreen}
      />
    </Stack.Navigator>
  );
}

// Info stack (no nested screens for now)
function InfoStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerShown: false }}>
      <Stack.Screen
        name="InfoMain"
        component={InfoScreen}
      />
    </Stack.Navigator>
  );
}

// My Events stack
function MyEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ ...stackScreenOptions, headerShown: false }}>
      <Stack.Screen
        name="MyEventsMain"
        component={MyEventsScreen}
        options={{ title: 'My Events' }}
      />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Schedule: { focused: 'calendar', unfocused: 'calendar-outline' },
  Map: { focused: 'map', unfocused: 'map-outline' },
  Info: { focused: 'information-circle', unfocused: 'information-circle-outline' },
  MyEvents: { focused: 'heart', unfocused: 'heart-outline' },
};

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

  const height = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabBarHeight],
  });

  return (
    <Animated.View
      style={{ height, opacity: animValue, overflow: 'hidden' }}
      pointerEvents={shouldHide ? 'none' : 'auto'}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStack}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{ title: 'Map' }}
      />
      <Tab.Screen
        name="Info"
        component={InfoStack}
        options={{ title: 'Info' }}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsStack}
        options={{ title: 'My Events' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.card,
    borderTopColor: colors.neutral.grayLight,
    height: 60,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    ...typography.textStyles.caption,
    marginTop: 2,
  },
});
