import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { StoryScreen } from '../screens/StoryScreen';
import { ScienceScreen } from '../screens/ScienceScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
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
          name="Home"
          component={HomeScreen}
          options={{
            title: '首页',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerShown: false,
          }}
          initialParams={{
            onNavigateToChat: () => {},
            onNavigateToStory: () => {},
            onNavigateToScience: () => {},
          }}
        />

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
          name="Story"
          component={StoryScreen}
          options={{
            title: '故事',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Science"
          component={ScienceScreen}
          options={{
            title: '科学',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
