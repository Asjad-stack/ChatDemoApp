import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { Message } from '../../types/chat';
import { db } from '../../config/firebase';

type UseChatScreenParams = {
  chatId: string;
  currentUserId: string;
  otherUserId: string;
};

const useChatScreen = ({
  chatId,
  currentUserId,
  otherUserId,
}: UseChatScreenParams) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const formatTime = (createdAt: any) => {
    if (!createdAt) {
      return '';
    }
    const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const markMessagesAsRead = async () => {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const unreadMessagesQuery = query(
        messagesRef,
        where('receiverId', '==', currentUserId),
        where('status', '==', 'sent'),
      );
      const snapshot = await getDocs(unreadMessagesQuery);
      if (snapshot.empty) {
        return;
      }
      const updateRequests = snapshot.docs.map(messageDoc =>
        updateDoc(doc(db, 'chats', chatId, 'messages', messageDoc.id), {
          status: 'read',
          readAt: serverTimestamp(),
        }),
      );
      await Promise.all(updateRequests);
    } catch (error) {
      console.log('Mark messages as read error:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      snapshot => {
        const chatMessages: Message[] = snapshot.docs.map(item => {
          const data = item.data();
          return {
            id: item.id,
            text: data.text,
            senderId: data.senderId,
            receiverId: data.receiverId,
            createdAt: data.createdAt,
            readAt: data.readAt,
            status: data.status,
            clientMessageId: data.clientMessageId,
          };
        });
        setMessages(prev => {
          const localPendingMessages = prev.filter(
            localMessage =>
              (localMessage.status === 'sending' ||
                localMessage.status === 'failed') &&
              !chatMessages.some(
                serverMessage =>
                  serverMessage.clientMessageId ===
                  localMessage.clientMessageId,
              ),
          );
          return [...localPendingMessages, ...chatMessages];
        });

        const hasUnreadMessages = chatMessages.some(
          item => item.receiverId === currentUserId && item.status === 'sent',
        );
        if (hasUnreadMessages) {
          markMessagesAsRead();
        }
        setLoading(false);
      },
      error => {
        setLoading(false);
        console.log('Firestore listener error:', error);
      },
    );
    return () => unsubscribe();
  }, [chatId, currentUserId]);

  const sendToFirestore = async ({
    text,
    senderId,
    receiverId,
    clientMessageId,
  }: {
    text: string;
    senderId: string;
    receiverId: string;
    clientMessageId: string;
  }) => {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await setDoc(
      chatRef,
      {
        participants: [senderId, receiverId],
        participantMap: {
          [senderId]: true,
          [receiverId]: true,
        },
        lastMessage: text,
        lastMessageSenderId: senderId,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await addDoc(messagesRef, {
      text,
      senderId,
      receiverId,
      createdAt: serverTimestamp(),
      status: 'sent',
      clientMessageId,
    });
  };

  const updateLocalMessageStatus = (
    clientMessageId: string,
    status: 'sending' | 'failed',
  ) => {
    setMessages(prev =>
      prev.map(item =>
        item.clientMessageId === clientMessageId
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || sending || !currentUserId || !otherUserId) {
      return;
    }
    const tempId = `${currentUserId}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const temporaryMessage: Message = {
      id: tempId,
      clientMessageId: tempId,
      text,
      senderId: currentUserId,
      receiverId: otherUserId,
      createdAt: new Date(),
      status: 'sending',
    };
    setMessage('');
    setSending(true);
    setMessages(prev => [temporaryMessage, ...prev]);
    try {
      await sendToFirestore({
        text,
        senderId: currentUserId,
        receiverId: otherUserId,
        clientMessageId: tempId,
      });
    } catch (error) {
      console.log('Send message error:', error);
      updateLocalMessageStatus(tempId, 'failed');
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (item: Message) => {
    if (!item.clientMessageId || item.status !== 'failed') {
      return;
    }
    updateLocalMessageStatus(item.clientMessageId, 'sending');
    try {
      await sendToFirestore({
        text: item.text,
        senderId: item.senderId,
        receiverId: item.receiverId,
        clientMessageId: item.clientMessageId,
      });
    } catch (error) {
      console.log('Retry message error:', error);
      updateLocalMessageStatus(item.clientMessageId, 'failed');
    }
  };

  return {
    message,
    messages,
    loading,
    sending,
    setMessage,
    sendMessage,
    retryMessage,
    formatTime,
  };
};

export default useChatScreen;
