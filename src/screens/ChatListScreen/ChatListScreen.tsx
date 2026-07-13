import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { USER_1_ID } from '../../constants/chat';
import { styles } from './styles';
import { db } from '../../config/firebase';
import { ChatItem } from '../../types/chat';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const ChatListScreen = ({ navigation }: Props) => {
  const [chats, setChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    const chatsRef = collection(db, 'chats');

    const chatsQuery = query(
      chatsRef,
      orderBy('lastMessageAt', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(chatsQuery, snapshot => {
      const chatList: ChatItem[] = snapshot.docs.map(item => {
        const data = item.data();

        return {
          id: item.id,
          participants: data.participants || [],
          lastMessage: data.lastMessage,
          lastMessageSenderId: data.lastMessageSenderId,
          lastMessageAt: data.lastMessageAt,
          updatedAt: data.updatedAt,
        };
      });

      setChats(chatList);
    });

    return () => unsubscribe();
  }, []);

  const openChat = (chat: ChatItem) => {
    const otherUserId =
      chat.participants.find((id: string) => id !== USER_1_ID) || 'user_2';

    navigation.navigate('Chat', {
      chatId: chat.id,
      currentUserId: USER_1_ID,
      otherUserId,
    });
  };

  const renderItem = ({ item }: { item: ChatItem }) => {
    const otherUserId =
      item.participants.find((id: string) => id !== USER_1_ID) || 'user_2';

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.card}
        onPress={() => openChat(item)}
      >
        <Text style={styles.name}>{otherUserId}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
