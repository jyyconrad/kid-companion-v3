import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
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
import { PersonaGuideScreen } from '../screens/PersonaGuideScreen';
import { WelcomeGuide } from '../screens/WelcomeGuide';
import WizardScreen from '../screens/WizardScreen';
import { useAppConfig } from '../store/useAppConfig';
import { wizardService } from '../services/wizardService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
        },
        headerShadowVisible: true,
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
      <Stack.Screen
        name="PersonaGuideScreen"
        component={PersonaGuideScreen}
        options={{ title: '角色配置' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const config = useAppConfig();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const characterConfig = await wizardService.loadCharacterConfig();
        const hasPersona = config.persona.isInitialized && !!config.apiKey;
        setIsConfigured(!!characterConfig || hasPersona);
      } catch (error) {
        console.error('检查配置状态失败:', error);
        setIsConfigured(false);
      }
    };

    config.loadConfig();
    checkConfiguration();
  }, [config]);

  // 配置状态未确定时，显示加载
  if (isConfigured === null) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="hourglass-outline" size={48} color="#4A90E2" />
              <Text style={{ marginTop: 16 }}>正在加载...</Text>
            </View>
          )} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Show wizard screen if not configured
  if (!isConfigured) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WizardScreen" component={WizardScreen} />
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
          },
          headerShadowVisible: true,
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
