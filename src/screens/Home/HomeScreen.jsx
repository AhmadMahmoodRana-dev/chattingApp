import React, { useState} from 'react';
import {View,Text,TouchableOpacity,StyleSheet,SafeAreaView,FlatList,StatusBar} from 'react-native';
import MainHeader from '../../components/Home/MainHeader'
import SearchHeader from '../../components/Home/SearchHeader'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
const navigation = useNavigation();
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
    {
      id: '7',
      name: 'Tech Support',
      status: 'We are here to help',
      lastSeen: 'Always online',
      unreadCount: 0,
      isOnline: true,
      avatar: '🤖',
    },
    {
      id: '8',
      name: 'Tech Support',
      status: 'We are here to help',
      lastSeen: 'Always online',
      unreadCount: 0,
      isOnline: true,
      avatar: '🤖',
    },
    {
      id: '9',
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

  // Function to handle user click
  const handleUserPress = (user) => {
    navigation.navigate('ChatScreen', { 
      user: user,
      userName: user.name, // You can pass specific data you need
      userId: user.id
    });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)} // Add onPress handler
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#191717" barStyle="light-content" />
      
      {showSearch ? <SearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} setShowSearch={setShowSearch} /> : <MainHeader setShowSearch={setShowSearch}  />}

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

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ... keep your existing styles the same ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#191717',
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
});

export default HomeScreen;