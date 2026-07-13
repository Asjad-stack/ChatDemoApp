import React, { useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Message } from '../types/chat';
import { USER_1_ID, USER_2_ID } from '../constants/chat';
import { styles } from './styles';
import useChatScreen from './Hooks';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const {
    currentUserId,
    messages,
    setCurrentUserId,
    loading,
    sending,
    sendMessage,
    message,
    setMessage,
    formatTime,
    retryMessage,
  } = useChatScreen();

  const flatListRef = useRef<FlatList<Message>>(null);

  const renderItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;
    const isFailed = item.status === 'failed';
    return (
      <TouchableOpacity
        activeOpacity={isFailed ? 0.7 : 1}
        onPress={() => {
          if (isFailed) {
            retryMessage(item);
          }
        }}
        style={[
          styles.bubble,
          isMyMessage ? styles.myBubble : styles.otherBubble,
          isFailed && styles.failedBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>

        {item.senderId == currentUserId && item.status && (
          <Text style={styles.statusText}>
            {isFailed ? 'failed • tap to retry' : item.status}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Firebase Chat</Text>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() =>
            setCurrentUserId(prev =>
              prev === USER_1_ID ? USER_2_ID : USER_1_ID,
            )
          }
        >
          <Text style={styles.switchText}>Using: {currentUserId}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      ) : messages?.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>No messages yet. Start chat!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          inverted
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message..."
            placeholderTextColor="#9ca3af"
            style={styles.input}
            multiline
            maxLength={500}
            returnKeyType="default"
          />

          <TouchableOpacity
            activeOpacity={0.6}
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || sending}
          >
            <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
