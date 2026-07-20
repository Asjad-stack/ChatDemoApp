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
    const chatsRef = collection(db, 'chats');
    const chatsQuery = query(
      chatsRef,
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageAt', 'desc'),
      limit(50),
    );
    const unsubscribe = onSnapshot(
      chatsQuery,
      snapshot => {
        if (!snapshot) {
          console.log('Chat snapshot is null');
          return;
        }
        const chatList: ChatItem[] = snapshot.docs.map(item => {
          const data = item.data();
          return {
            id: item.id,
            participants: data.participants || [],
            lastMessage: data.lastMessage || '',
            lastMessageSenderId: data.lastMessageSenderId || '',
            lastMessageAt: data.lastMessageAt,
            updatedAt: data.updatedAt,
          };
        });
        setChats(chatList);
      },
      error => {
        console.log('Chat list Firestore error:', error);
      },
    );

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const currentUserId = getAuth().currentUser?.uid;
      if (!currentUserId) {
        return;
      }
      const userRef = collection(db, 'users');
      const usersQuery = query(userRef, where('uid', '!=', currentUserId));
      const snapshot = await getDocs(usersQuery);
      const userList: AppUser[] = snapshot.docs.map(item => {
        const data = item?.data();
        return {
          uid: data.uid,
          isAnonymous: data.isAnonymous,
        };
      });
      setUsers(userList);
    } catch (error) {
      console.log('Load users error:', error);
    }
  };

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
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.card}
        onPress={() => openChat(item)}
      >
        <Text style={styles.name}>{otherUserId || 'Unknown User'}</Text>

        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
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
        keyExtractor={item => item?.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default ChatListScreen;
