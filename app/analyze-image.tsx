import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import PoopTypeSelector from '@/components/PoopTypeSelector';
import PoopVolumeSelector from '@/components/PoopVolumeSelector';
import PoopColorSelector from '@/components/PoopColorSelector';
import { poopTypes, poopVolumes, poopColors } from '@/constants/poopTypes';
import { FileText, Check, AlertCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export default function AnalyzeImageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const [predictedType, setPredictedType] = useState<number>(4); // Default to type 4
  const [predictedVolume, setPredictedVolume] = useState<number>(2); // Default to medium
  const [predictedColor, setPredictedColor] = useState<number>(1); // Default to brown
  
  const [selectedType, setSelectedType] = useState<number>(4);
  const [selectedVolume, setSelectedVolume] = useState<number>(2);
  const [selectedColor, setSelectedColor] = useState<number>(1);
  
  const [analysisDetails, setAnalysisDetails] = useState<string>('');

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
      analyzeImage(params.imageUri);
    }
  }, [params.imageUri]);

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Convert image to base64
      let base64Image;
      
      if (Platform.OS === 'web') {
        // For web, we'll use a mock analysis since we can't easily get base64
        mockAnalysis();
        return;
      }
      
      try {
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (error) {
        console.error('Error reading image file:', error);
        setAnalysisError('Could not read image file');
        setIsAnalyzing(false);
        return;
      }
      
      // Prepare the message for the AI
      const messages = [
        {
          role: 'system',
          content: 'You are an expert medical AI specialized in analyzing stool samples based on the Bristol Stool Scale. Analyze the provided image and determine: 1) Stool type (1-7 on Bristol Scale), 2) Volume (small/medium/large), and 3) Color (brown, dark brown, light brown, yellow, green, red, or black). Provide a brief explanation for your assessment. Format your response as JSON: {"type": number, "volume": number, "color": number, "explanation": "text"}. For volume, use 1 for small, 2 for medium, 3 for large. For color, use 1 for brown, 2 for dark brown, 3 for light brown, 4 for yellow, 5 for green, 6 for red, 7 for black.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this stool sample image:' },
            { type: 'image', image: `data:image/jpeg;base64,${base64Image}` }
          ]
        }
      ];
      
      // Send to AI for analysis
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the AI response
      try {
        const result = JSON.parse(data.completion);
        
        // Update state with predictions
        setPredictedType(result.type);
        setSelectedType(result.type);
        
        setPredictedVolume(result.volume);
        setSelectedVolume(result.volume);
        
        setPredictedColor(result.color);
        setSelectedColor(result.color);
        
        setAnalysisDetails(result.explanation);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        setAnalysisError('Could not understand the AI response');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError('Failed to analyze the image');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Mock analysis for web or testing
  const mockAnalysis = () => {
    setTimeout(() => {
      // Random values for demonstration
      const mockType = Math.floor(Math.random() * 7) + 1;
      const mockVolume = Math.floor(Math.random() * 3) + 1;
      const mockColor = Math.floor(Math.random() * 7) + 1;
      
      setPredictedType(mockType);
      setSelectedType(mockType);
      
      setPredictedVolume(mockVolume);
      setSelectedVolume(mockVolume);
      
      setPredictedColor(mockColor);
      setSelectedColor(mockColor);
      
      setAnalysisDetails('This is a simulated analysis. In the actual app, AI would analyze the image and provide detailed insights about the stool sample.');
      
      setIsAnalyzing(false);
    }, 2000); // Simulate 2 second analysis time
  };
  
  const handleContinue = () => {
    // Navigate to add-entry with the analysis results
    router.push({
      pathname: '/add-entry',
      params: {
        imageUri: imageUri || '',
        type: selectedType.toString(),
        volume: selectedVolume.toString(),
        color: selectedColor.toString(),
        analysisDetails: encodeURIComponent(analysisDetails)
      }
    });
  };
  
  const handleRetry = () => {
    if (imageUri) {
      analyzeImage(imageUri);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Analyzing Image',
          headerBackTitle: 'Cancel',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        )}
        
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.accent} />
            <Text style={styles.loadingText}>Analyzing your poop...</Text>
            <Text style={styles.loadingSubtext}>Our AI is working hard to identify the type, volume, and color.</Text>
          </View>
        ) : analysisError ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={Colors.primary.error} />
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorText}>{analysisError}</Text>
            <Button
              title="Try Again"
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </View>
        ) : (
          <>
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <FileText size={24} color={Colors.primary.accent} />
                <Text style={styles.resultTitle}>Analysis Results</Text>
              </View>
              
              <Text style={styles.resultDescription}>
                Our AI has analyzed your image. You can adjust the results if needed.
              </Text>
              
              {analysisDetails && (
                <View style={styles.analysisDetails}>
                  <Text style={styles.analysisTitle}>AI Assessment:</Text>
                  <Text style={styles.analysisText}>{analysisDetails}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.selectorsContainer}>
              <PoopTypeSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
              
              <PoopVolumeSelector
                selectedVolume={selectedVolume}
                onSelectVolume={setSelectedVolume}
              />
              
              <PoopColorSelector
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Continue"
                onPress={handleContinue}
                style={styles.continueButton}
              />
              
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </>
        )}
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
  loadingContainer: {
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.primary.lightText,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.primary.lightText,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  resultContainer: {
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginLeft: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: Colors.primary.lightText,
    marginBottom: 16,
  },
  analysisDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.text,
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 14,
    color: Colors.primary.lightText,
    lineHeight: 20,
  },
  selectorsContainer: {
    backgroundColor: Colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  continueButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});