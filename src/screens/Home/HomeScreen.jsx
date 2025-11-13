import React, { useEffect, useState } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,FlatList,StatusBar,Modal,TextInput,ActivityIndicator,Alert,Dimensions,Animated} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../components/Home/MainHeader';
import SearchHeader from '../../components/Home/SearchHeader';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseUrl from '../../constant/Baseurl';
import formatLastSeen from '../../constant/formatLastSeen.js'

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [users,setUsers] = useState([])
  const navigation = useNavigation();
  
  // Animation value for modal
  const [modalY] = useState(new Animated.Value(SCREEN_HEIGHT));


  const fetchUsers = async () =>{
    try {
      const token = await AsyncStorage.getItem('authToken');
      const {data} = await axios.get(`${BaseUrl}/contact`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      console.log(data,"Fetched Contacts");
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  useEffect(() =>{
fetchUsers()
  },[])


  const fetchUserThroughEmail = async (email) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log("Auth Token:", token);
      const {data} = await axios.get(`${BaseUrl}/auth/${email}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      setSearchedUser(data?.user)
      console.log(data,"Fetched User Data");
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal with animation
  const openModal = () => {
    setShowAddContactModal(true);
    Animated.timing(modalY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close modal with animation
  const closeModal = () => {
    Animated.timing(modalY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAddContactModal(false);
      setContactEmail('');
      setSearchedUser(null);
    });
  };

  // Function to search user by email
  const handleSearchUser = async () => {
    if (!contactEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    setSearchedUser(null);

    try {
    fetchUserThroughEmail(contactEmail);      
    } catch (error) {
      Alert.alert('Error', 'Failed to search user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to add contact
  const handleAddContact = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');

      const {data} = await axios.post(
        `${BaseUrl}/contact/add`,
        { email: searchedUser?.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      console.log("Add Contact Response:", data);

      if (data) {
        Alert.alert('Success', 'Contact added successfully!');
        closeModal();
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.error || 'Failed to add contact';
        Alert.alert('Error', errorMsg);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user click
  const handleUserPress = (user) => {
    navigation.navigate('ChatScreen', {
      user: user,
      userName: user.name,
      userId: user._id
    });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}a</Text>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.lastSeen}>{formatLastSeen(item?.lastSeen)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={styles.userStatus}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
          see you at 5 pm
          </Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}2</Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#191717" barStyle="light-content" />

      {showSearch ? (
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowSearch={setShowSearch}
        />
      ) : (
        <MainHeader setShowSearch={setShowSearch} />
      )}

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>CHATS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>STATUS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>CALLS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.tabButton}>
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Floating Action Button - Opens Add Contact Modal */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openModal}
      >
        <Ionicons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal for Add Contact */}
      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: modalY }]
              }
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Contact</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Enter the email address of the person you want to add to your contacts.
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor="#999"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Search Result */}
              {searchedUser && (
                <View style={styles.searchResult}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.searchResultText}>
                    {searchedUser.email} found on ChatApp!
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {!searchedUser ? (
                  <TouchableOpacity
                    style={[styles.button, styles.searchButton]}
                    onPress={handleSearchUser}
                    disabled={loading || !contactEmail.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="search" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Search User</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.button, styles.addButton]}
                    onPress={handleAddContact}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="person-add" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Add Contact</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191717',
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    padding: 12,
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    fontSize: 40,
    width: 50,
    height: 50,
    textAlign: 'center',
    lineHeight: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    overflow: 'hidden',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#191717',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 7,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  lastSeen: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userStatus: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#191717',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    backgroundColor: '#191717',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  // Bottom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191717',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchResultText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButton: {
    backgroundColor: '#191717',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;