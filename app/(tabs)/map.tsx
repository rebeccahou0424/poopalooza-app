import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

// Mock data for nearby bathrooms
const mockBathrooms = [
  {
    id: '1',
    name: "Starbucks",
    distance: 0.2,
    rating: 4.5,
    type: "Café",
    address: "123 Main St",
  },
  {
    id: '2',
    name: "McDonald's",
    distance: 0.5,
    rating: 3.8,
    type: "Fast Food",
    address: "456 Oak Ave",
  },
  {
    id: '3',
    name: "Public Library",
    distance: 0.7,
    rating: 4.2,
    type: "Public",
    address: "789 Elm St",
  },
  {
    id: '4',
    name: "Shell Gas Station",
    distance: 1.1,
    rating: 3.5,
    type: "Gas Station",
    address: "101 Pine Rd",
  },
  {
    id: '5',
    name: "Target",
    distance: 1.4,
    rating: 4.7,
    type: "Retail",
    address: "202 Maple Dr",
  },
  {
    id: '6',
    name: "City Park Restroom",
    distance: 1.8,
    rating: 3.2,
    type: "Public",
    address: "303 Park Ave",
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bathrooms, setBathrooms] = useState(mockBathrooms);
  const [activeTab, setActiveTab] = useState<'nearby' | 'visited'>('nearby');
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg('Could not get your location');
      }
    })();
  }, []);
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starIcon}>★</Text>
        ))}
        {halfStar && <Text style={styles.starIcon}>★</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.starIcon, styles.emptyStar]}>★</Text>
        ))}
      </View>
    );
  };
  
  const handleNavigate = (bathroom: typeof mockBathrooms[0]) => {
    // In a real app, you would open maps app with directions
    alert(`Navigating to ${bathroom.name}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bathroom Finder</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'nearby' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('nearby')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'nearby' && styles.activeTabText,
            ]}>
              Nearby
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'visited' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('visited')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'visited' && styles.activeTabText,
            ]}>
              Visited
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Text style={styles.errorSubtext}>
            Please enable location services to find bathrooms near you.
          </Text>
        </View>
      ) : !location ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      ) : activeTab === 'nearby' ? (
        <ScrollView style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Bathrooms Near You</Text>
          
          {bathrooms.map((bathroom) => (
            <View key={bathroom.id} style={styles.bathroomCard}>
              <View style={styles.bathroomInfo}>
                <View style={styles.bathroomHeader}>
                  <Text style={styles.bathroomName}>{bathroom.name}</Text>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{bathroom.type}</Text>
                  </View>
                </View>
                
                <Text style={styles.bathroomAddress}>{bathroom.address}</Text>
                
                <View style={styles.bathroomDetails}>
                  <View style={styles.ratingContainer}>
                    {renderStars(bathroom.rating)}
                    <Text style={styles.ratingText}>{bathroom.rating.toFixed(1)}</Text>
                  </View>
                  
                  <Text style={styles.distanceText}>{bathroom.distance} mi</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.navigateButton}
                onPress={() => handleNavigate(bathroom)}
              >
                <Navigation size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MapPin size={48} color={Colors.primary.lightText} />
          <Text style={styles.emptyTitle}>No Visited Bathrooms</Text>
          <Text style={styles.emptyText}>
            Bathrooms you use will appear here so you can easily find them again.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.card,
    borderRadius: 20,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: Colors.primary.accent,
  },
  tabText: {
    fontSize: 14,
    color: Colors.primary.lightText,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.primary.lightText,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary.lightText,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginBottom: 12,
  },
  bathroomCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  bathroomInfo: {
    flex: 1,
  },
  bathroomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bathroomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: Colors.primary.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  bathroomAddress: {
    fontSize: 14,
    color: Colors.primary.lightText,
    marginBottom: 8,
  },
  bathroomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 16,
    color: '#FFC107',
    marginRight: 2,
  },
  emptyStar: {
    color: Colors.primary.border,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.primary.lightText,
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: Colors.primary.lightText,
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.primary.lightText,
    textAlign: 'center',
  },
});