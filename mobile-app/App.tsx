import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider, useThemeMode } from './src/context/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MLModelScreen } from './src/screens/MLModelScreen';
import { RobotArmScreen } from './src/screens/RobotArmScreen';
import { SensorControlsScreen } from './src/screens/SensorControlsScreen';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import './src/i18n'; // Initialize i18n

const Tab = createBottomTabNavigator();

const NavigationContent = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { t } = useTranslation();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.onBackground,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.surfaceVariant,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = 'help';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Dashboard') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'ML Model') {
              iconName = focused ? 'brain' : 'brain';
            } else if (route.name === 'Robot Arm') {
              iconName = focused ? 'robot' : 'robot-outline'; // specialized icon
            } else if (route.name === 'Sensors') {
              iconName = focused ? 'tune' : 'tune-vertical';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: t('home') }}
        />
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: t('dashboard') }}
        />
        <Tab.Screen 
          name="ML Model" 
          component={MLModelScreen} 
          options={{ title: t('mlModel') }}
        />
        <Tab.Screen 
          name="Robot Arm" 
          component={RobotArmScreen} 
          options={{ title: t('robotArm') }}
        />
        <Tab.Screen 
          name="Sensors" 
          component={SensorControlsScreen} 
          options={{ title: t('sensors') }}
        />
      </Tab.Navigator>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <NavigationContent />
      </NavigationContainer>
    </ThemeProvider>
  );
}
