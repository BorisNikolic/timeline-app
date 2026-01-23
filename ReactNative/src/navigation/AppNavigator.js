/**
 * AppNavigator - Bottom tabs with Schedule and My Events
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import ScheduleScreen from '../screens/ScheduleScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab icons as text emojis (can be replaced with proper icons later)
function TabIcon({ name, focused }) {
  const icons = {
    Schedule: focused ? '📅' : '📆',
    MyEvents: focused ? '🔔' : '🔕',
  };

  return (
    <Text style={styles.tabIcon}>{icons[name] || '📋'}</Text>
  );
}

// Schedule stack with event detail
function ScheduleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navyDark,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          ...typography.textStyles.h4,
        },
      }}
    >
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
        options={{
          title: 'Event Details',
        }}
      />
    </Stack.Navigator>
  );
}

// My Events stack
function MyEventsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.navyDark,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          ...typography.textStyles.h4,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MyEventsMain"
        component={MyEventsScreen}
        options={{
          title: 'My Events',
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Schedule"
        component={ScheduleStack}
        options={{
          title: 'Schedule',
        }}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsStack}
        options={{
          title: 'My Events',
        }}
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
  tabIcon: {
    fontSize: 24,
  },
});
