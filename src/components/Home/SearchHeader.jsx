import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';


const SearchHeader = ({setShowSearch,setSearchQuery,searchQuery}) => (
    <View style={styles.searchHeader}>
      <Ionicons 
        name="arrow-back" 
        size={24} 
        color="#fff" 
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
        <Ionicons 
          name="close" 
          size={24} 
          color="#fff" 
          onPress={() => setSearchQuery('')}
        />
      )}
    </View>
  );

  const styles = StyleSheet.create({
    searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191717',
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
  })

  export default SearchHeader;