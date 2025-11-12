import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

const MainHeader = ({ setShowSearch }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.appTitle}>ChatApp</Text>
    </View>

    <View style={styles.headerRight}>
      <Ionicons
        name="search"
        size={22}
        color="#fff"
        onPress={() => setShowSearch(true)}
      />
      <Ionicons
        name="ellipsis-vertical"
        size={24}
        color="#fff"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
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
});

export default MainHeader;
