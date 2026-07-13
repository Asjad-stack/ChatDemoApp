import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../screens/ChatScreen';
import ChatListScreen from '../screens/ChatListScreen/ChatListScreen';

export type RootStackParamList = {
  ChatList: undefined;
  Chat: {
    chatId: string;
    currentUserId: string;
    otherUserId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#050505',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 20,
          },
          contentStyle: {
            backgroundColor: '#050505',
          },
        }}
      >
        <Stack.Screen
          name="ChatList"
          component={ChatListScreen}
          options={{ title: 'Chats' }}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
