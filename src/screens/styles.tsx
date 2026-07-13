import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#AC5CF9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 5,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#202126',
    width: 392,
    alignSelf: 'center',
    borderRadius: 20,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginLeft: 10,
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  sendText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  switchButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 20,
  },
  switchText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    color: '#d1d5db',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  statusText: {
    color: '#d1d5db',
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  failedBubble: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
});
