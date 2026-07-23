import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { styles } from './styles';
import { db } from '../../config/firebase';
import { AppUser, ChatItem } from '../../types/chat';
import { getAuth } from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const ChatListScreen = ({ navigation }: Props) => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const currentUserId = getAuth().currentUser?.uid;
  console.log('DEVICE CURRENT UID:', currentUserId);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersRef,
      snapshot => {
        const userList: AppUser[] = snapshot.docs
          .map(item => {
            const data = item.data();

            return {
              uid: data.uid,
              isAnonymous: data.isAnonymous,
            };
          })
          .filter(user => user.uid !== currentUserId);

        setUsers(userList);
      },
      error => {
        console.log('Users listener error:', error);
      },
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const createChatId = (userA: string, userB: string) => {
    return [userA, userB].sort().join('-');
  };

  const startChatWithUser = (user: AppUser) => {
    if (!currentUserId) {
      return;
    }
    const chatId = createChatId(currentUserId, user.uid);
    navigation.navigate('Chat', {
      chatId,
      currentUserId,
      otherUserId: user.uid,
    });
  };

  const openChat = (chat: ChatItem) => {
    if (!currentUserId) {
      return;
    }
    const otherUserId = chat.participants.find(id => id !== currentUserId);
    if (!otherUserId) {
      return;
    }
    navigation.navigate('Chat', {
      chatId: chat.id,
      currentUserId,
      otherUserId,
    });
  };

  const renderItem = ({ item }: { item: ChatItem }) => {
    if (!currentUserId) {
      return null;
    }

    const otherUserId = item.participants.find(id => id !== currentUserId);

    const isMyLastMessage = item.lastMessageSenderId === currentUserId;

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.card}
        onPress={() => openChat(item)}
      >
        <Text style={styles.name}>{otherUserId || 'Unknown User'}</Text>

        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage
            ? `${isMyLastMessage ? 'You: ' : ''}${item.lastMessage}`
            : 'No messages yet'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>Available Users</Text>

        {users.map(user => (
          <TouchableOpacity
            key={user.uid}
            style={styles.card}
            onPress={() => startChatWithUser(user)}
            activeOpacity={0.7}
          >
            <Text style={styles.name}>{user.uid}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChatListScreen;
