import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
  FlatList,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Custom Icon Component using Text with emoji/icons
const Icon = ({ name, size = 24, color = '#000', style, onPress }) => {
  const icons = {
    search: '🔍',
    dots: '⋯',
    camera: '📷',
    edit: '✏️',
    add: '➕',
    group: '👥',
    broadcast: '📢',
    settings: '⚙️',
    status: '●',
    check: '✓',
    back: '←',
    send: '➤',
    close: '✕',
    menu: '☰',
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Text style={[{
        fontSize: size,
        color: color,
      }, style]}>
        {icons[name] || '❓'}
      </Text>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Sample users data
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Doe',
      status: 'Hey there! I am using ChatApp',
      lastSeen: '10:30 AM',
      unreadCount: 2,
      isOnline: true,
      avatar: '👨‍💼',
    },
    {
      id: '2',
      name: 'Sarah Smith',
      status: 'Available for chat',
      lastSeen: '9:15 AM',
      unreadCount: 0,
      isOnline: true,
      avatar: '👩‍💻',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      status: 'At work',
      lastSeen: 'Yesterday',
      unreadCount: 5,
      isOnline: false,
      avatar: '👨‍🔧',
    },
    {
      id: '4',
      name: 'Emily Davis',
      status: 'Busy right now',
      lastSeen: '2 hours ago',
      unreadCount: 0,
      isOnline: true,
      avatar: '👩‍🎨',
    },
    {
      id: '5',
      name: 'Alex Wilson',
      status: 'On vacation 🏖️',
      lastSeen: 'Online',
      unreadCount: 1,
      isOnline: true,
      avatar: '👨‍🚀',
    },
    {
      id: '6',
      name: 'Tech Support',
      status: 'We are here to help',
      lastSeen: 'Always online',
      unreadCount: 0,
      isOnline: true,
      avatar: '🤖',
    },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (user) => {
    Alert.alert(
      'Start Chat',
      `Start chatting with ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Chat', 
          onPress: () => {
            // Navigate to chat screen
            // navigation.navigate('Chat', { user });
          }
        },
      ]
    );
  };

  const handleAddContact = () => {
    Alert.prompt(
      'Add New Contact',
      'Enter phone number or username:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (contact) => {
            if (contact) {
              const newUser = {
                id: Date.now().toString(),
                name: contact,
                status: 'Hey there! I am using ChatApp',
                lastSeen: 'Just now',
                unreadCount: 0,
                isOnline: true,
                avatar: '👤',
              };
              setUsers(prev => [newUser, ...prev]);
              Alert.alert('Success', 'Contact added successfully!');
            }
          },
        },
      ]
    );
    setShowAddModal(false);
  };

  const handleNewGroup = () => {
    Alert.alert('New Group', 'Create a new group chat feature');
    setShowAddModal(false);
  };

  const handleNewBroadcast = () => {
    Alert.alert('New Broadcast', 'Create a new broadcast list');
    setShowAddModal(false);
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Open app settings');
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
      onLongPress={() => setSelectedUser(item)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.lastSeen}>{item.lastSeen}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text 
            style={styles.userStatus} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.status}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.appTitle}>ChatApp</Text>
      </View>
      
      <View style={styles.headerRight}>
        <Icon 
          name="search" 
          size={22} 
          color="#fff" 
          onPress={() => setShowSearch(true)}
        />
        <Icon 
          name="dots" 
          size={28} 
          color="#fff" 
          onPress={() => setShowAddModal(true)}
        />
      </View>
    </View>
  );

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <Icon 
        name="back" 
        size={24} 
        color="#075E54" 
        onPress={() => {
          setShowSearch(false);
          setSearchQuery('');
        }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />
      {searchQuery.length > 0 && (
        <Icon 
          name="close" 
          size={20} 
          color="#075E54" 
          onPress={() => setSearchQuery('')}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      
      {showSearch ? renderSearchHeader() : renderHeader()}

      {/* Tabs Section */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tabButton}>
          <Icon name="camera" size={24} color="#666" />
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
          <Icon name="edit" size={20} color="#666" onPress={handleAddContact} />
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

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalItem}
              onPress={handleNewGroup}
            >
              <Icon name="group" size={24} color="#075E54" />
              <Text style={styles.modalItemText}>New Group</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalItem}
              onPress={handleNewBroadcast}
            >
              <Icon name="broadcast" size={24} color="#075E54" />
              <Text style={styles.modalItemText}>New Broadcast</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalItem}
              onPress={handleAddContact}
            >
              <Icon name="add" size={24} color="#075E54" />
              <Text style={styles.modalItemText}>New Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalItem}
              onPress={handleSettings}
            >
              <Icon name="settings" size={24} color="#075E54" />
              <Text style={styles.modalItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
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
    paddingBottom: 80,
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#25D366',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    backgroundColor: '#25D366',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

export default HomeScreen;