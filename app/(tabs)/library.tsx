import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePoopStore } from '@/store/poopStore';
import Colors from '@/constants/colors';
import PoopCard from '@/components/PoopCard';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  FileDown, 
  Search,
  Calendar as CalendarIcon,
  List
} from 'lucide-react-native';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { poopFeelings } from '@/constants/poopTypes';
import { formatDate } from '@/utils/dateUtils';

export default function LibraryScreen() {
  const router = useRouter();
  const { entries } = usePoopStore();
  
  const [showImages, setShowImages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(entries);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  useEffect(() => {
    filterEntries(activeFilter, searchQuery);
  }, [entries, activeFilter, searchQuery]);
  
  const filterEntries = (filter: string, query = '') => {
    setIsLoading(true);
    
    // Apply search query filter
    let results = sortedEntries.filter(entry => {
      const entryName = entry.name?.toLowerCase() || '';
      const entryNotes = entry.notes?.toLowerCase() || '';
      const searchLower = query.toLowerCase();
      
      return entryName.includes(searchLower) || entryNotes.includes(searchLower);
    });
    
    // Apply feeling filter
    if (filter !== 'all') {
      const feelingId = poopFeelings.find(f => f.name.toLowerCase() === filter)?.id;
      if (feelingId) {
        results = results.filter(entry => entry.feeling === feelingId);
      }
    }
    
    setFilteredEntries(results);
    setIsLoading(false);
  };
  
  const handleAddNew = () => {
    router.push('/add-entry');
  };
  
  const handleEntryPress = (id: string) => {
    router.push({
      pathname: '/entry-details',
      params: { id }
    });
  };
  
  const toggleShowImages = () => {
    setShowImages(!showImages);
  };
  
  const handleExport = () => {
    // In a real app, you would implement export functionality
    alert('Export functionality would be implemented here');
  };
  
  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
    filterEntries(filter, searchQuery);
  };
  
  const renderFilterButton = (label: string, filter: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => handleFilterPress(filter)}
    >
      <Text 
        style={[
          styles.filterButtonText,
          activeFilter === filter && styles.activeFilterText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.resultCount}>
            {filteredEntries.length} of {entries.length} entries
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[
              styles.headerButton,
              showImages && styles.activeHeaderButton
            ]}
            onPress={toggleShowImages}
          >
            {showImages ? (
              <Eye size={20} color={showImages ? "#FFFFFF" : Colors.primary.accent} />
            ) : (
              <EyeOff size={20} color={Colors.primary.accent} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleExport}
          >
            <FileDown size={20} color={Colors.primary.accent} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.primary.lightText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries..."
            placeholderTextColor={Colors.primary.lightText}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Easy', 'easy')}
          {renderFilterButton('Moderate', 'moderate')}
          {renderFilterButton('Difficult', 'difficult')}
          {renderFilterButton('Incomplete', 'incomplete')}
        </ScrollView>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.accent} />
        </View>
      ) : filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No entries found</Text>
          <Text style={styles.emptySubtext}>
            {entries.length === 0 
              ? "Start tracking your poops to see them here" 
              : "Try adjusting your search or filters"}
          </Text>
          {entries.length === 0 && (
            <Button 
              title="Add Your First Poop" 
              onPress={handleAddNew}
              style={styles.addButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoopCard 
              entry={item} 
              onPress={() => handleEntryPress(item.id)}
              showImage={showImages}
              style={styles.poopCard}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddNew}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.text,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.primary.lightText,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeHeaderButton: {
    backgroundColor: Colors.primary.accent,
  },
  searchSection: {
    padding: 16,
    backgroundColor: Colors.primary.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.primary.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.primary.border,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary.accent,
    borderColor: Colors.primary.accent,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.primary.text,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  poopCard: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.primary.lightText,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});