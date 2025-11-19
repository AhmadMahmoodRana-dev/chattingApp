import React, { useState, useRef, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,FlatList,KeyboardAvoidingView,Platform,StatusBar,Alert,ActivityIndicator,Image,Modal,PermissionsAndroid} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BaseUrl from '../../constant/Baseurl';
import UploadBaseUrl from '../../constant/UploadBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types, isCancel } from '@react-native-documents/picker';
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';

const ChatScreen = ({ navigation, route }) => {
  const { user, userName, userId } = route.params;
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const flatListRef = useRef(null);
  const audioPathRef = useRef(null);

  // Helper function to construct full media URL
  const getMediaUrl = (attachmentUrl) => {
    if (!attachmentUrl) return '';
    
    // Remove leading slash if BaseUrl already ends with one
    const cleanUrl = attachmentUrl.startsWith('/') ? attachmentUrl.slice(1) : attachmentUrl;
    const cleanBaseUrl = UploadBaseUrl.endsWith('/') ? UploadBaseUrl.slice(0, -1) : UploadBaseUrl;
    
    return `${cleanBaseUrl}/${cleanUrl}`;
  };

  const fetchMessages = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const { data } = await axios.get(
        `${BaseUrl}/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Messages fetched:', data, conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (messageData = null) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!messageData && inputText.trim() === '') return;

      const formData = new FormData();

      if (messageData) {
        formData.append('type', messageData.type);
        formData.append('text', messageData.text || '');

        if (messageData.file) {
          const fileObj = {
            uri:
              Platform.OS === 'ios'
                ? messageData.file.uri.replace('file://', '')
                : messageData.file.uri,
            type: messageData.file.type,
            name: messageData.file.name,
          };
          formData.append('files', fileObj);
        }
      } else {
        formData.append('text', inputText);
        formData.append('type', 'text');
      }

      setIsUploading(true);

      const { data } = await axios.post(
        `${BaseUrl}/${conversationId}/messages/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Message sent:', data);
      setInputText('');
      setIsUploading(false);
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      setIsUploading(false);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send message',
      );
    }
  };

  const pickImage = () => {
    setShowAttachmentMenu(false);
    Alert.alert('Select Image', 'Choose image source', [
      {
        text: 'Camera',
        onPress: () => {
          launchCamera(
            {
              mediaType: 'photo',
              quality: 0.8,
              includeBase64: false,
            },
            handleImageResponse,
          );
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary(
            {
              mediaType: 'photo',
              quality: 0.8,
              includeBase64: false,
            },
            handleImageResponse,
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleImageResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    }
    if (response.error) {
      Alert.alert('Error', response.error);
      return;
    }

    const asset = response.assets[0];
    console.log('Image selected:', asset);

    sendMessage({
      type: 'image',
      text: '',
      file: {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      },
    });
  };

  const pickDocument = async () => {
    setShowAttachmentMenu(false);
    try {
      const results = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      const file = results[0];
      console.log('Document selected:', file);

      sendMessage({
        type: 'document',
        text: file.name,
        file: {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name,
        },
      });
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert('Error', 'Failed to pick document');
        console.error(err);
      }
    }
  };

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'This app needs access to your microphone to record voice messages.',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');

      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice messages.',
        );
        return;
      }

      const audioPath = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.m4a`,
        android: `${RNFS.DocumentDirectoryPath}/recording_${Date.now()}.m4a`,
      });

      audioPathRef.current = audioPath;
      console.log('Recording path:', audioPath);

      const audioSet = {
        AudioSamplingRate: 44100,
        AudioEncodingBitRate: 128000,
        AudioChannels: 1,
        AudioEncoderAndroid: Sound.AudioEncoderAndroidType?.AAC,
        AudioSourceAndroid: Sound.AudioSourceAndroidType?.MIC,
        AVSampleRateKeyIOS: 44100,
        AVFormatIDKeyIOS: Sound.AVEncodingOption?.aac,
        AVEncoderAudioQualityKeyIOS: Sound.AVEncoderAudioQualityIOSType?.high,
        AVNumberOfChannelsKeyIOS: 1,
      };

      Sound.addRecordBackListener((e) => {
        const currentTime = Math.floor(e.currentPosition);
        setRecordTime(Sound.mmssss(currentTime));
      });

      const resultUri = await Sound.startRecorder(audioPath, audioSet, true);
      console.log('Recording started, saved to:', resultUri);

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
      setRecordTime('00:00');
      Sound.removeRecordBackListener();
    }
  };

  const stopRecording = async () => {
    try {
      const savedPath = await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      console.log("Recording stopped, file saved at:", savedPath);

      setIsRecording(false);
      setRecordTime("00:00");

      if (!savedPath) {
        console.log("No audio file saved");
        return;
      }

      const fileName = `voice_${Date.now()}.m4a`;

      sendMessage({
        type: "audio",
        text: "",
        file: {
          uri: Platform.OS === "android" ? `file://${savedPath}` : savedPath,
          type: "audio/m4a",
          name: fileName,
        },
      });
    } catch (err) {
      console.error("Stop recording error:", err);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const cancelRecording = async () => {
    try {
      console.log('Canceling recording...');

      await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      setIsRecording(false);
      setRecordTime('00:00');

      if (audioPathRef.current) {
        const exists = await RNFS.exists(audioPathRef.current);
        if (exists) {
          await RNFS.unlink(audioPathRef.current);
          console.log('Recording file deleted');
        }
        audioPathRef.current = null;
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
      setIsRecording(false);
      setRecordTime('00:00');
    }
  };

  // FIXED: Improved audio playback with proper URL handling
  const playAudio = async (audioUrl, messageId) => {
    try {
      console.log('Attempting to play audio from:', audioUrl);

      // Stop any currently playing audio
      if (playingAudioId) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingAudioId(null);
      }

      // If clicking the same audio that was playing, just stop it
      if (playingAudioId === messageId) {
        return;
      }

      // Set up playback listeners
      Sound.addPlayBackListener((e) => {
        console.log('Playback progress:', e.currentPosition, '/', e.duration);
      });

      Sound.addPlaybackEndListener((e) => {
        console.log('Playback completed');
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingAudioId(null);
      });

      // Start playback with the full URL
      await Sound.startPlayer(audioUrl);
      console.log('Playback started successfully');
      setPlayingAudioId(messageId);

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Playback Error', 'Failed to play audio. Please try again.');
      setPlayingAudioId(null);
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    }
  };

  useEffect(() => {
    return () => {
      Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      Sound.stopRecorder();
      Sound.removeRecordBackListener();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isSent = item.sender._id === currentUserId;
    const messageTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const hasAttachment = item.attachments && item.attachments.length > 0;
    const attachment = hasAttachment ? item.attachments[0] : null;

    return (
      <View
        style={[
          styles.messageBubble,
          isSent ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {/* FIXED: Image rendering with proper URL construction */}
        {attachment && attachment.type === 'image' && (
          <Image
            source={{ uri: getMediaUrl(attachment.url) }}
            style={styles.messageImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error:', error.nativeEvent.error);
              console.log('Failed URL:', getMediaUrl(attachment.url));
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', getMediaUrl(attachment.url));
            }}
          />
        )}

        {/* FIXED: Audio rendering with proper URL and playback state */}
        {attachment && attachment.type === 'audio' && (
          <TouchableOpacity
            style={styles.audioContainer}
            onPress={() => {
              const audioUrl = getMediaUrl(attachment.url);
              console.log('Playing audio from URL:', audioUrl);
              playAudio(audioUrl, item._id);
            }}
          >
            <Ionicons 
              name={playingAudioId === item._id ? "pause-circle" : "play-circle"} 
              size={32} 
              color="#075E54" 
            />
            <View style={styles.audioInfo}>
              <Text style={styles.audioText}>
                {playingAudioId === item._id ? 'Playing...' : 'Voice message'}
              </Text>
              {attachment.size && (
                <Text style={styles.audioSize}>
                  {(attachment.size / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {attachment && attachment.type === 'document' && (
          <TouchableOpacity
            style={styles.documentContainer}
            onPress={() => {
              Alert.alert(
                'Document',
                `${attachment.filename}\nSize: ${(attachment.size / 1024).toFixed(2)} KB`,
              );
            }}
          >
            <Ionicons name="document-text" size={32} color="#075E54" />
            <View style={styles.documentInfo}>
              <Text style={styles.documentText} numberOfLines={1}>
                {attachment.filename}
              </Text>
              <Text style={styles.documentSize}>
                {(attachment.size / 1024).toFixed(2)} KB
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {item.text && (
          <Text
            style={[
              styles.messageText,
              isSent ? styles.sentMessageText : styles.receivedMessageText,
            ]}
          >
            {item.text}
          </Text>
        )}

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

  const getConversation = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const { data } = await axios.get(`${BaseUrl}/conversation/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data && data.length > 0) {
        setConversationId(data[0]._id);
        console.log('Conversation ID set:', data[0]._id);
      }
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
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
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
          />

          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#075E54" />
              <Text style={styles.uploadingText}>Sending...</Text>
            </View>
          )}
        </View>

        {/* Recording Overlay */}
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingContainer}>
              <TouchableOpacity onPress={cancelRecording}>
                <Ionicons name="trash" size={24} color="#ff0000" />
              </TouchableOpacity>
              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{recordTime}</Text>
              </View>
              <TouchableOpacity
                onPress={stopRecording}
                style={styles.stopButton}
              >
                <Ionicons name="send" size={24} color="#075E54" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={() => setShowAttachmentMenu(true)}
            >
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
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#075E54" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              if (inputText.trim() === '') {
                startRecording();
              } else {
                sendMessage();
              }
            }}
            onLongPress={startRecording}
          >
            <Ionicons
              name={inputText.trim() === '' ? 'mic' : 'send'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={pickDocument}
            >
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#9575CD' }]}
              >
                <Ionicons name="document" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentLabel}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={pickImage}
            >
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#EC407A' }]}
              >
                <Ionicons name="image" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentMenu(false);
                launchCamera(
                  { mediaType: 'photo', quality: 0.8 },
                  handleImageResponse,
                );
              }}
            >
              <View
                style={[styles.attachmentIcon, { backgroundColor: '#26C6DA' }]}
              >
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
              <Text style={styles.attachmentLabel}>Camera</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"",
    gap:20,
    width:150
  },
  
  audioText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  audioSize: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  documentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  documentText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
    alignItems: 'center',
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
  recordingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  stopButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default ChatScreen;