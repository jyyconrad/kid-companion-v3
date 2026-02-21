import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ChatScreen } from '../screens/ChatScreen';
import { MyProfile } from '../screens/MyProfile';
import { ApiConfigScreen } from '../screens/ApiConfigScreen';
import { ModelSelectScreen } from '../screens/ModelSelectScreen';
import { FeatureConfigScreen } from '../screens/FeatureConfigScreen';
import { PersonaEditScreen } from '../screens/PersonaEditScreen';
import { WelcomeGuide } from '../screens/WelcomeGuide';
import { useAppConfig } from '../store/useAppConfig';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
        },
      }}
    >
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{ title: '我的' }}
      />
      <Stack.Screen
        name="ApiConfigScreen"
        component={ApiConfigScreen}
        options={{ title: 'API配置' }}
      />
      <Stack.Screen
        name="ModelSelectScreen"
        component={ModelSelectScreen}
        options={{ title: '模型设置' }}
      />
      <Stack.Screen
        name="FeatureConfigScreen"
        component={FeatureConfigScreen}
        options={{ title: '功能配置' }}
      />
      <Stack.Screen
        name="PersonaEditScreen"
        component={PersonaEditScreen}
        options={{ title: 'AI角色设置' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const config = useAppConfig();

  useEffect(() => {
    config.loadConfig();
  }, []);

  // Show welcome guide if not initialized
  if (!config.persona.isInitialized || !config.apiKey) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WelcomeGuide" component={WelcomeGuide} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Chat"
        screenOptions={{
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
          },
        }}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: '聊天',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="MyProfile"
          component={ProfileStack}
          options={{
            title: '我的',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
