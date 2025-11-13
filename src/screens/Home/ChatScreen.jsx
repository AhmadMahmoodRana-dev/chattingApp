// ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {View,Text,StyleSheet,SafeAreaView,TouchableOpacity,TextInput,FlatList,KeyboardAvoidingView,Platform,Image,StatusBar} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import axios from 'axios';
import BaseUrl from '../../constant/Baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ navigation, route }) => {
  const { user, userName, userId } = route.params;
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const flatListRef = useRef(null);

  const fetchMessages = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const { data } = await axios.get(`${BaseUrl}/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Messages fetched:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  const sendMessage = async () => {
    try {
      if (inputText.trim() === '') return;

      const { data } = await axios.post(
        `${BaseUrl}/${conversationId}/messages/send`,
        { text: inputText, type: 'text' },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        },
      );
      console.log('Message sent:', data);
      setInputText('');
      // Refresh messages after sending
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isSent = item.sender._id === currentUserId;
    const messageTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isSent ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSent ? styles.sentMessageText : styles.receivedMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            isSent ? styles.sentTimeText : styles.receivedTimeText,
          ]}
        >
          {messageTime}
        </Text>
      </View>
    );
  };

  // ##################  ADD CONVERSATION   #######################

  const addConversation = async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('authToken');
    try {
      const { data } = await axios.post(
        `${BaseUrl}/conversation/add`,
        {
          type: 'direct',
          members: [currentUserId, userId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Conversation added:', data);
    } catch (error) {
      console.error('Error adding conversation:', error);
    }
  };

  // ##################  GET CONVERSATION   #######################

  const getConversation = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const { data } = await axios.get(
        `${BaseUrl}/conversation/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setConversationId(data[0]?._id);
      console.log('Conversation get:', data);
    } catch (error) {
      console.error('Error getting conversation:', error);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setCurrentUserId(storedUserId);
      await addConversation();
      await getConversation();
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#075E54" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userName?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.headerTitle}>{userName}</Text>
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachmentButton}>
              <Ionicons name="add" size={24} color="#075E54" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy" size={24} color="#075E54" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={24} color="#075E54" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() === '' && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={inputText.trim() === ''}
          >
            <Ionicons
              name={inputText.trim() === '' ? 'mic' : 'send'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#191717',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    fontSize: 12,
    color: '#90EE90',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    // padding: 8,
    marginLeft: 16,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#000',
  },
  receivedMessageText: {
    color: '#000',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  sentTimeText: {
    textAlign: 'right',
    color: '#000',
  },
  receivedTimeText: {
    textAlign: 'left',
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 80,
    marginHorizontal: 8,
    padding: 0,
  },
  attachmentButton: {
    padding: 4,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 4,
  },
  cameraButton: {
    padding: 4,
    marginLeft: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
});

export default ChatScreen;