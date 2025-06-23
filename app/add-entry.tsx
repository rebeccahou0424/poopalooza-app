import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { usePoopStore } from '@/store/poopStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import PoopTypeSelector from '@/components/PoopTypeSelector';
import PoopVolumeSelector from '@/components/PoopVolumeSelector';
import PoopFeelingSelector from '@/components/PoopFeelingSelector';
import PoopColorSelector from '@/components/PoopColorSelector';
import { Image } from 'expo-image';
import { getTimeOfDay } from '@/utils/dateUtils';

export default function AddEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    imageUri?: string, 
    type?: string, 
    volume?: string, 
    color?: string,
    analysisDetails?: string
  }>();
  const { addEntry, stopTimer, currentTimer, resetTimer } = usePoopStore();
  
  const [name, setName] = useState(`${getTimeOfDay()} Poop`);
  const [type, setType] = useState(params.type ? parseInt(params.type) : 4);
  const [volume, setVolume] = useState(params.volume ? parseInt(params.volume) : 2);
  const [feeling, setFeeling] = useState(1); // Default to easy
  const [color, setColor] = useState(params.color ? parseInt(params.color) : 1);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(0);
  const [analysisDetails, setAnalysisDetails] = useState('');
  
  useEffect(() => {
    if (currentTimer) {
      setDuration(currentTimer);
    }
    
    if (params.analysisDetails) {
      setAnalysisDetails(decodeURIComponent(params.analysisDetails));
      
      // If we have analysis details, add them to the notes
      if (decodeURIComponent(params.analysisDetails).trim() !== '') {
        setNotes(`AI Analysis: ${decodeURIComponent(params.analysisDetails)}\n\n`);
      }
    }
  }, [currentTimer, params.analysisDetails]);
  
  const handleSave = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: name,
      type,
      volume,
      feeling,
      color,
      duration,
      notes,
      imageUri: params.imageUri,
    };
    
    addEntry(newEntry);
    resetTimer();
    router.replace('/(tabs)');
  };
  
  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Add New Entry',
          headerBackTitle: 'Cancel',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {params.imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: params.imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Give your poop a name"
            />
          </View>
          
          <PoopTypeSelector
            selectedType={type}
            onSelectType={setType}
          />
          
          <PoopVolumeSelector
            selectedVolume={volume}
            onSelectVolume={setVolume}
          />
          
          <PoopFeelingSelector
            selectedFeeling={feeling}
            onSelectFeeling={setFeeling}
          />
          
          <PoopColorSelector
            selectedColor={color}
            onSelectColor={setColor}
          />
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Duration</Text>
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                {Math.floor(duration / 60)}m {duration % 60}s
              </Text>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Save Entry"
            onPress={handleSave}
            style={styles.saveButton}
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  formContainer: {
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  durationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  durationText: {
    fontSize: 16,
    color: Colors.primary.text,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});