import { useEffect, useState } from 'react';
import { Message } from '../../types/chat';
import { CHAT_ID, USER_1_ID, USER_2_ID } from '../../constants/chat';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { db } from '../../config/firebase';

const useChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState(USER_1_ID);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const otherUserId = currentUserId === USER_1_ID ? USER_2_ID : USER_1_ID;

  const formatTime = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt?.toDate ? createdAt.toDate() : createdAt;
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const messagesRef = collection(db, 'chats', CHAT_ID, 'messages');

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
            status: data.status,
            clientMessageId: data.clientMessageId,
          };
        });

        setMessages(prev => {
          const tempSendingMessages = prev.filter(
            localMsg =>
              localMsg.status === 'sending' &&
              !chatMessages.some(
                serverMsg =>
                  serverMsg.clientMessageId === localMsg.clientMessageId,
              ),
          );
          return [...tempSendingMessages, ...chatMessages];
        });
        setLoading(false);
      },
      error => {
        setLoading(false);
        console.log('Firestore listener error:', error);
      },
    );

    return () => unsubscribe();
  }, []);

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
    console.log('1 chat update start');

    const chatRef = doc(db, 'chats', CHAT_ID);
    const messagesRef = collection(db, 'chats', CHAT_ID, 'messages');

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
      prev.map(msg =>
        msg.clientMessageId === clientMessageId ? { ...msg, status } : msg,
      ),
    );
  };

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || sending) {
      return;
    }

    setMessage('');
    setSending(true);

    const tempId = Date.now().toString();

    const tempMessage: Message = {
      id: tempId,
      clientMessageId: tempId,
      text,
      senderId: currentUserId,
      receiverId: otherUserId,
      createdAt: new Date(),
      status: 'sending',
    };

    setMessages(prev => [tempMessage, ...prev]);

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

  const retryMessage = async (msg: Message) => {
    if (!msg.clientMessageId || msg.status !== 'failed') {
      return;
    }

    updateLocalMessageStatus(msg.clientMessageId, 'sending');

    try {
      await sendToFirestore({
        text: msg.text,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        clientMessageId: msg.clientMessageId,
      });
    } catch (error) {
      console.log('Retry message error:', error);
      updateLocalMessageStatus(msg.clientMessageId, 'failed');
    }
  };

  return {
    messages,
    setCurrentUserId,
    loading,
    sending,
    setSending,
    sendMessage,
    currentUserId,
    message,
    setMessage,
    formatTime,
    retryMessage,
  };
};

export default useChatScreen;
