import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { poopTypes, poopVolumes, poopFeelings, poopColors } from '@/constants/poopTypes';
import Colors from '@/constants/colors';
import { PoopEntry } from '@/types/poop';
import { formatDate } from '@/utils/dateUtils';
import { Clock } from 'lucide-react-native';

interface PoopCardProps {
  entry: PoopEntry;
  onPress?: () => void;
  showImage?: boolean;
  style?: ViewStyle;
}

export default function PoopCard({ entry, onPress, showImage = false, style }: PoopCardProps) {
  const poopType = poopTypes.find(type => type.id === entry.type) || poopTypes[0];
  const poopVolume = poopVolumes.find(vol => vol.id === entry.volume) || poopVolumes[0];
  const poopFeeling = poopFeelings.find(feel => feel.id === entry.feeling) || poopFeelings[0];
  const poopColor = poopColors.find(col => col.id === entry.color) || poopColors[0];
  
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "No duration recorded";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Pressable 
      style={[styles.container, style]}
      onPress={onPress}
    >
      {showImage && entry.imageUri && (
        <Image
          source={{ uri: entry.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {entry.name || `${formatDate(entry.date)} Poop`}
        </Text>
        <Text style={styles.time}>{formatTime(entry.date)}</Text>
      </View>
      
      <Text style={styles.durationText}>
        {formatDuration(entry.duration)}
      </Text>
      
      <View style={styles.tagsContainer}>
        <View style={[
          styles.tag, 
          styles[`${poopFeeling.name.toLowerCase()}Tag` as keyof typeof styles] || styles.defaultTag
        ]}>
          <Text style={styles.tagText}>{poopFeeling.name.toLowerCase()}</Text>
        </View>
        
        <View style={[styles.tag, styles.typeTag]}>
          <Text style={styles.tagText}>Type {poopType.id}</Text>
        </View>
        
        <View style={[
          styles.tag, 
          styles[`${poopVolume.name.toLowerCase()}Tag` as keyof typeof styles] || styles.defaultTag
        ]}>
          <Text style={styles.tagText}>{poopVolume.name.toLowerCase()}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0E6D2',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  time: {
    fontSize: 12,
    color: Colors.primary.lightText,
  },
  durationText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultTag: {
    backgroundColor: '#FFF2C2',
  },
  easyTag: {
    backgroundColor: '#E8F5E8',
  },
  moderateTag: {
    backgroundColor: '#FFF3E0',
  },
  difficultTag: {
    backgroundColor: '#FFEBEE',
  },
  incompleteTag: {
    backgroundColor: '#E1F5FE',
  },
  typeTag: {
    backgroundColor: '#F3E5F5',
  },
  smallTag: {
    backgroundColor: '#E8F5E9',
  },
  mediumTag: {
    backgroundColor: '#FFF3E0',
  },
  largeTag: {
    backgroundColor: '#FFEBEE',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C2C2C',
  },
});