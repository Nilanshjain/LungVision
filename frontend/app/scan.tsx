import React, { useState, useContext, useEffect } from "react";
import { 
  View, 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Platform, 
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Modal
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from "expo-router";
import Footer from '../components/Footer';
import { AuthContext } from './_layout';
import { API_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces based on the actual response formats
interface WebDocumentResult {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    mimeType: string;
    name: string;
    size: number;
  }>;
  output?: FileList;
}

interface MobileImageResult {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }>;
}

type ImageState = {
  uri: string;
  name?: string;
  type?: string;
  file?: File;
} | null;

const { width } = Dimensions.get("window");

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [patientMedicalHistory, setPatientMedicalHistory] = useState<string>('');
  const [patientDoctorNotes, setPatientDoctorNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ blob: Blob; fileType: string } | null>(null);
  const [prediction, setPrediction] = useState<{
    predicted_class: string;
    confidence: number;
    probabilities: {
      normal: number;
      malignant: number;
      benign: number;
    };
  } | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useContext(AuthContext);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Load selected patient information
  useEffect(() => {
    async function loadPatientInfo() {
      try {
        const storedPatientId = await AsyncStorage.getItem('selectedPatientId');
        const storedPatientName = await AsyncStorage.getItem('selectedPatientName');
        const storedMedicalHistory = await AsyncStorage.getItem('selectedPatientMedicalHistory');
        const storedDoctorNotes = await AsyncStorage.getItem('selectedPatientDoctorNotes');
        
        if (!storedPatientId) {
          // If no patient is selected, go back to patient selection
          Alert.alert(
            "No Patient Selected",
            "Please select a patient before proceeding.",
            [{ text: "OK", onPress: () => router.replace('/select-patient') }]
          );
          return;
        }
        
        setPatientId(storedPatientId);
        setPatientName(storedPatientName);
        setPatientMedicalHistory(storedMedicalHistory || '');
        setPatientDoctorNotes(storedDoctorNotes || '');
      } catch (error) {
        console.error('Error loading patient info:', error);
        Alert.alert(
          "Error",
          "Failed to load patient information. Please try again.",
          [{ text: "OK", onPress: () => router.replace('/select-patient') }]
        );
      }
    }
    
    loadPatientInfo();
  }, [router]);

  const pickImage = async () => {
    if (!patientId) {
      Alert.alert(
        "No Patient Selected",
        "Please select a patient before uploading a scan.",
        [{ text: "OK", onPress: () => router.replace('/select-patient') }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Reduce quality slightly for better compatibility
        base64: false, // Don't use base64
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        setImage(selectedAsset.uri);
        
        // Handle file processing for all platforms
        console.log('Selected asset:', selectedAsset);
        
        let blob;
        let fileType = 'jpg';
        let mimeType = 'image/jpeg';
        
        if (Platform.OS === 'ios') {
          // For iOS, we need to handle the URI differently
          try {
            // First try to fetch the URI directly
            const response = await fetch(selectedAsset.uri);
            console.log('Fetch response status:', response.status);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.status}`);
            }
            
            blob = await response.blob();
            console.log('Blob size after fetch:', blob.size);
            
            if (blob.size === 0) {
              console.log('Blob is empty, trying FileSystem fallback...');
              // If blob is empty, try using FileSystem to read the file
              const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              
              console.log('Base64 length:', base64.length);
              
              if (base64.length === 0) {
                throw new Error('Could not read image file');
              }
              
              // Convert base64 to blob
              const byteCharacters = atob(base64);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              blob = new Blob([byteArray], { type: 'image/jpeg' });
              console.log('Blob size after base64 conversion:', blob.size);
            }
            
            // Determine file type
            if (selectedAsset.mimeType) {
              mimeType = selectedAsset.mimeType;
              fileType = selectedAsset.mimeType.split('/')[1] || 'jpg';
            } else if (selectedAsset.type) {
              mimeType = selectedAsset.type;
              fileType = selectedAsset.type.split('/')[1] || 'jpg';
            } else {
              fileType = selectedAsset.uri.split('.').pop() || 'jpg';
              mimeType = `image/${fileType}`;
            }
          } catch (error) {
            console.error('Error processing iOS image:', error);
            throw new Error('Failed to process image on iOS');
          }
        } else {
          // For other platforms, use standard fetch
          const response = await fetch(selectedAsset.uri);
          blob = await response.blob();
          fileType = selectedAsset.uri.split('.').pop() || 'jpg';
          mimeType = `image/${fileType}`;
        }
        
        console.log('Final blob size:', blob.size);
        console.log('File type:', fileType, 'MIME type:', mimeType);
        
        if (blob.size === 0) {
          throw new Error('Selected image is empty or corrupted');
        }
        
        // Ensure the blob has the correct MIME type
        if (blob.type !== mimeType) {
          console.log('Correcting MIME type from', blob.type, 'to', mimeType);
          blob = new Blob([blob], { type: mimeType });
        }
        
        setSelectedFile({ blob, fileType });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleUpload = async (blob: Blob, asset: any) => {
    try {
      setIsLoading(true);

      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert("Authentication Error", "You must be logged in to use this feature.");
        router.replace('/login');
        return;
      }

      // Create form data
      const formData = new FormData();
      
      // Get file extension and type
      const uriParts = asset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      
      // Determine MIME type
      let mimeType = 'image/jpeg';
      if (asset.mimeType) {
        mimeType = asset.mimeType;
      } else if (asset.type) {
        mimeType = asset.type;
      } else {
        mimeType = `image/${fileType}`;
      }
      
      // Save the blob and fileType for later use when saving to database
      setSelectedFile({ blob, fileType });
      
      // Validate blob before uploading
      if (!blob || blob.size === 0) {
        throw new Error('Invalid or empty image file');
      }

      console.log('Blob details before upload:', {
        size: blob.size,
        type: blob.type,
        constructor: blob.constructor.name
      });

      // For iOS, use the original asset URI directly
      if (Platform.OS === 'ios') {
        const fileObj = {
          uri: asset.uri,
          type: mimeType,
          name: `scan.${fileType}`,
        };
        formData.append('file', fileObj as any);
        console.log('Using iOS file object:', fileObj);
      } else {
        // For other platforms, use the blob directly
        formData.append('file', blob, `scan.${fileType}`);
        console.log('Using blob for non-iOS platform');
      }

      // Debug FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log('Uploading image:', {
        filename: `scan.${fileType}`,
        type: `image/${fileType}`,
        size: blob.size,
        platform: Platform.OS
      });

      // Make the request for prediction only
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        transformRequest: (data) => {
          return data;
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          console.log('Upload progress:', progressEvent);
        }
      });

      console.log('Server response:', response.data);

      if (response.data) {
        setPrediction(response.data);
      } else {
        throw new Error('No data received from server');
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to upload image. ';
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        router.replace('/login');
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data.error || 'Please ensure the image is a valid CT scan.';
      } else if (error.response?.status === 500) {
        errorMessage += error.response.data.error || 'Server error occurred.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      Alert.alert("Error", errorMessage);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!selectedFile || !prediction || !patientId) {
      Alert.alert(
        "Missing Information",
        "Please ensure you have selected an image and processed it.",
        [{ text: "OK" }]
      );
      return;
    }

    // Get auth token
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert("Authentication Error", "You must be logged in to save records.");
      router.replace('/login');
      return;
    }

    try {
      setIsSaving(true);
      
      // Create form data
      const formData = new FormData();
      
      // Append the file with proper filename
      const filename = `${patientId}_${Date.now()}.${selectedFile.fileType}`;
      formData.append('file', selectedFile.blob, filename);
      
      // Append patient ID
      formData.append('patientId', patientId);
      
      // Append prediction data along with patient notes
      formData.append('prediction', JSON.stringify({
        ...prediction,
        medicalHistory: patientMedicalHistory,
        doctorNotes: patientDoctorNotes,
      }));
      
      // Send to server
      const response = await axios.post(`${API_URL}/save-record`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        transformRequest: (data) => {
          return data;
        },
        timeout: 30000,
      });

      console.log('Save response:', response.data);

      if (response.data && response.data.success) {
        setShowSuccessPopup(true);
      } else {
        throw new Error(response.data?.message || 'Failed to save record');
      }
      
    } catch (error: any) {
      console.error('Save error:', error);
      
      let errorMessage = 'Failed to save record. ';
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        router.replace('/login');
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle popup actions
  const handlePopupAction = (action: 'history' | 'new' | 'close' | 'report') => {
    console.log("Popup action triggered:", action);
    setShowSuccessPopup(false);
    setIsSaving(false);
    
    if (action === 'history') {
      router.push({
        pathname: '/history',
        params: { id: patientId }
      });
    } else if (action === 'new') {
      setImage(null);
      setPrediction(null);
      setSelectedFile(null);
      setPatientId(null);
    } else if (action === 'report') {
      // Store data in AsyncStorage for report page to access
      console.log("Preparing report data...");
      const reportData = {
        patientId: patientId || '',
        patientName: patientName || '',
        diagnosis: prediction?.predicted_class || '',
        confidence: prediction ? (prediction.confidence * 100).toFixed(1) : '',
        timestamp: new Date().toISOString(),
        medicalHistory: patientMedicalHistory,
        doctorNotes: patientDoctorNotes,
      };
      
      console.log("Report data:", reportData);
      
      // First try directly opening the report screen
      try {
        Alert.alert(
          "Creating Report",
          "Opening report editor...",
          [{ text: "OK" }]
        );
        
        // Store data and redirect with timeout to ensure data is saved
        AsyncStorage.setItem('reportData', JSON.stringify(reportData))
          .then(() => {
            setTimeout(() => {
              router.push('/patients');
              
              // After returning to patients screen, show message about report data
              setTimeout(() => {
                Alert.alert(
                  "Report Data Saved",
                  "Report data has been saved. Access it from report-editor.tsx or view patient history.",
                  [{ text: "OK" }]
                );
              }, 1000);
            }, 500);
          })
          .catch(err => {
            console.error('Failed to save report data:', err);
            Alert.alert('Error', 'Failed to prepare report. Please try again.');
          });
      } catch (e) {
        console.error("Navigation error:", e);
        Alert.alert(
          "Navigation Error", 
          "Could not navigate to report editor: " + String(e)
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Patient Information</Text>
              
              {patientId && (
                <View style={styles.patientInfoDisplay}>
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>Patient:</Text>
                    <Text style={styles.patientInfoValue}>{patientName || 'Unknown'}</Text>
                  </View>
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>ID:</Text>
                    <Text style={styles.patientInfoValue}>{patientId}</Text>
                  </View>
                  <View style={{ height: 12 }} />
                  <Text style={styles.cardTitle}>Medical History</Text>
                  <TextInput
                    style={[styles.inputArea, styles.textArea]}
                    value={patientMedicalHistory}
                    onChangeText={setPatientMedicalHistory}
                    placeholder="Enter or update medical history for this scan"
                    placeholderTextColor={Colors.text.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={{ height: 12 }} />
                  <Text style={styles.cardTitle}>Doctor's Notes</Text>
                  <TextInput
                    style={[styles.inputArea, styles.textArea]}
                    value={patientDoctorNotes}
                    onChangeText={setPatientDoctorNotes}
                    placeholder="Write notes relevant to this scan"
                    placeholderTextColor={Colors.text.muted}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View style={styles.content}>
                <Text style={styles.title}>Upload CT Scan Image</Text>
                <Text style={styles.subtitle}>
                  Our AI system will analyze your CT scan and provide results within seconds
                </Text>

                {!image ? (
                  <TouchableOpacity 
                    style={[
                      styles.uploadArea, 
                      isDragging && styles.uploadAreaActive,
                      patientId && styles.uploadAreaDisabled
                    ]}
                    onPress={pickImage}
                  >
                    <View style={styles.uploadContent}>
                      <MaterialCommunityIcons 
                        name="cloud-upload-outline" 
                        size={48} 
                        color={Colors.accent.blue}
                      />
                      <Text style={styles.uploadText}>
                        Drag and drop your CT scan image here, or
                      </Text>
                      <TouchableOpacity 
                        style={styles.browseButton}
                        onPress={pickImage}
                      >
                        <Text style={styles.browseButtonText}>Browse Files</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: image }} 
                      style={styles.imagePreview} 
                      resizeMode="contain"
                    />
                    <View style={styles.imagePreviewActions}>
                      <TouchableOpacity 
                        style={styles.previewButton}
                        onPress={() => {
                          setImage(null);
                          setPrediction(null);
                          setSelectedFile(null);
                        }}
                      >
                        <MaterialCommunityIcons 
                          name="close" 
                          size={24} 
                          color={Colors.status.error}
                        />
                        <Text style={[styles.previewButtonText, { color: Colors.status.error }]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.previewButton}
                        onPress={pickImage}
                      >
                        <MaterialCommunityIcons 
                          name="image-plus" 
                          size={24} 
                          color={Colors.accent.blue}
                        />
                        <Text style={[styles.previewButtonText, { color: Colors.accent.blue }]}>
                          Change Image
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {!prediction && selectedFile && (
                      <TouchableOpacity
                        style={[styles.processButton, isLoading && styles.processButtonDisabled]}
                        onPress={() => handleUpload(selectedFile.blob, { uri: image })}
                        disabled={isLoading}
                      >
                        <View style={styles.processButtonContent}>
                          <MaterialCommunityIcons 
                            name="brain" 
                            size={24} 
                            color={Colors.text.primary} 
                          />
                          <Text style={styles.processButtonText}>
                            {isLoading ? 'Processing...' : 'Process Image'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.accent.blue} />
                <Text style={styles.loadingText}>Processing image...</Text>
              </View>
            )}
            
            {prediction && (
              <View style={[styles.resultCard, { 
                borderColor: prediction.predicted_class === 'Malignant' ? Colors.status.error : 
                            prediction.predicted_class === 'Benign' ? Colors.status.warning : 
                            Colors.status.success,
                backgroundColor: Colors.card
              }]}>
                <Text style={styles.resultTitle}>Analysis Results</Text>
                
                <View style={styles.resultContent}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Diagnosis:</Text>
                    <Text style={[styles.resultValue, { 
                      color: prediction.predicted_class === 'Malignant' ? Colors.status.error : 
                             prediction.predicted_class === 'Benign' ? Colors.status.warning : 
                             Colors.status.success
                    }]}>{prediction.predicted_class}</Text>
                  </View>
                  
                  <Text style={styles.resultDisclaimer}>
                    This is an AI-assisted analysis and should not replace professional medical advice.
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isSaving && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveToDatabase}
                    disabled={isSaving}
                  >
                    <View style={styles.saveButtonContent}>
                      <MaterialCommunityIcons 
                        name="database-plus" 
                        size={24} 
                        color={Colors.text.primary} 
                      />
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving to Database...' : 'Save to Database'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Success Popup */}
            <Modal
              visible={showSuccessPopup}
              transparent={true}
              animationType="fade"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.popupContainer}>
                  <View style={styles.popupHeader}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={48}
                      color={Colors.status.success}
                    />
                    <Text style={styles.popupTitle}>Success</Text>
                  </View>
                  
                  <View style={styles.popupContent}>
                    <Text style={styles.popupMessage}>
                      Record saved successfully!
                    </Text>
                    <View style={styles.popupDetails}>
                      <Text style={styles.popupDetailText}>
                        <Text style={styles.popupDetailLabel}>Patient ID: </Text>
                        {patientId}
                      </Text>
                      <Text style={styles.popupDetailText}>
                        <Text style={styles.popupDetailLabel}>Diagnosis: </Text>
                        {prediction?.predicted_class}
                      </Text>
                      <Text style={styles.popupDetailText}>
                        <Text style={styles.popupDetailLabel}>Confidence: </Text>
                        {prediction ? `${(prediction.confidence * 100).toFixed(1)}%` : ''}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.popupActions}>
                    <TouchableOpacity
                      style={[styles.popupButton, styles.popupButtonPrimary]}
                      onPress={() => {
                        setShowSuccessPopup(false);
                        
                        // Store report data
                        const reportData = {
                          patientId: patientId || '',
                          patientName: patientName || '',
                          diagnosis: prediction?.predicted_class || '',
                          confidence: prediction ? (prediction.confidence * 100).toFixed(1) : '',
                          timestamp: new Date().toISOString()
                        };
                        
                        AsyncStorage.setItem('reportData', JSON.stringify(reportData))
                          .then(() => {
                            // Go directly to report-editor
                            router.push('/report-editor');
                          })
                          .catch(err => {
                            console.error('Failed to save report data:', err);
                            Alert.alert('Error', 'Failed to prepare report. Please try again.');
                          });
                      }}
                    >
                      <MaterialCommunityIcons
                        name="file-document-outline"
                        size={20}
                        color={Colors.background}
                      />
                      <Text style={styles.popupButtonTextPrimary}>Make Report</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.popupButton, styles.popupButtonSecondary]}
                      onPress={() => handlePopupAction('history')}
                    >
                      <MaterialCommunityIcons
                        name="history"
                        size={20}
                        color={Colors.accent.blue}
                      />
                      <Text style={styles.popupButtonTextSecondary}>View History</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.popupButton, styles.popupButtonSecondary]}
                      onPress={() => handlePopupAction('new')}
                    >
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={20}
                        color={Colors.accent.blue}
                      />
                      <Text style={styles.popupButtonTextSecondary}>New Scan</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.popupButton, styles.popupButtonTertiary]}
                      onPress={() => handlePopupAction('close')}
                    >
                      <Text style={styles.popupButtonTextTertiary}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          <Footer />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    width: "100%",
    maxWidth: 600,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  patientInfoDisplay: {
    marginBottom: 20,
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  patientInfoLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    width: 80,
  },
  patientInfoValue: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  inputArea: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.default,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 18,
  },
  textArea: {
    minHeight: 120,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
  },
  uploadArea: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.default,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadAreaActive: {
    borderColor: Colors.border.active,
    backgroundColor: Colors.overlay.light,
  },
  uploadAreaDisabled: {
    opacity: 0.6,
    borderColor: Colors.border.default,
  },
  uploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadText: {
    color: Colors.text.secondary,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  browseButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  browseButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    borderLeftWidth: 8,
    width: "100%",
    maxWidth: 600,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  resultContent: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  resultDisclaimer: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
  resultLabel: {
    fontSize: 18,
    color: Colors.text.primary,
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: Colors.text.primary,
    marginTop: 12,
    fontSize: 16,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.default,
    overflow: 'hidden',
    padding: 16,
  },
  imagePreview: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  imagePreviewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.accent.blue,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    width: '100%',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  processButton: {
    backgroundColor: Colors.accent.green,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  processButtonDisabled: {
    opacity: 0.6,
  },
  processButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 450,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 8,
  },
  popupContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  popupMessage: {
    fontSize: 18,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  popupDetails: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  popupDetailText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  popupDetailLabel: {
    fontWeight: 'bold',
  },
  popupActions: {
    flexDirection: 'column',
    gap: 12,
  },
  popupButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  popupButtonPrimary: {
    backgroundColor: Colors.accent.blue,
  },
  popupButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.accent.blue,
  },
  popupButtonTertiary: {
    backgroundColor: 'transparent',
  },
  popupButtonTextPrimary: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  popupButtonTextSecondary: {
    color: Colors.accent.blue,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  popupButtonTextTertiary: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
}); 