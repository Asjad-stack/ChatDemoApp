export type MessageStatus = 'sending' | 'sent' | 'failed';

export type Message = {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt?: any;
  status?: MessageStatus;
  clientMessageId?: string;
};

export type ChatItem = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: any;
  updatedAt?: any;
};
