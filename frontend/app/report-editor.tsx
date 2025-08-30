import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { AuthContext } from './_layout';
import { API_URL } from '../constants/api';

// NOTE: To enable PDF generation, install these packages:
// npm install expo-print expo-sharing
// or
// yarn add expo-print expo-sharing

interface ReportData {
  patientId: string;
  patientName: string;
  diagnosis: string;
  confidence: string;
  timestamp: string;
  medicalHistory?: string;
  doctorNotes?: string;
}

export default function ReportEditorScreen() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Load report data and doctor information
  useEffect(() => {
    async function loadData() {
      try {
        const reportDataJson = await AsyncStorage.getItem('reportData');
        if (!reportDataJson) {
          Alert.alert(
            "No Report Data",
            "No report data found. Please try again.",
            [{ text: "OK", onPress: () => router.back() }]
          );
          return;
        }
        
        setReportData(JSON.parse(reportDataJson));
        
        // Get doctor information
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`${API_URL}/doctor/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          if (data.success && data.doctor) {
            setDoctorName(data.doctor.name);
          }
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        Alert.alert(
          "Error",
          "Failed to load report data. Please try again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (diagnosis: string) => {
    switch (diagnosis.toLowerCase()) {
      case 'malignant':
        return '#ef4444'; // red
      case 'benign':
        return '#f59e0b'; // amber
      case 'normal':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const generateHtml = () => {
    if (!reportData) return '';
    
    const diagnosisColor = getStatusColor(reportData.diagnosis);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lung Cancer Diagnosis Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1a73e8;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1a73e8;
              margin-bottom: 5px;
            }
            .title {
              font-size: 18px;
              color: #666;
            }
            .report-id {
              font-size: 12px;
              color: #888;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .patient-info {
              display: flex;
              flex-wrap: wrap;
            }
            .info-group {
              width: 50%;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              margin-right: 10px;
            }
            .diagnosis-box {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .diagnosis-value {
              font-size: 24px;
              font-weight: bold;
              color: ${diagnosisColor};
              margin-bottom: 10px;
            }
            .confidence {
              font-size: 14px;
              color: #666;
            }
            .notes {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              background-color: #f9f9f9;
              min-height: 100px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .signature {
              margin-top: 40px;
              text-align: right;
            }
            .doctor-name {
              font-weight: bold;
              font-size: 16px;
            }
            .timestamp {
              font-size: 12px;
              color: #888;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LungVision</div>
            <div class="title">Lung Cancer Diagnosis Report</div>
            <div class="report-id">Report ID: ${Date.now().toString(36)}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="patient-info">
              <div class="info-group">
                <span class="info-label">Patient ID:</span>
                <span>${reportData.patientId}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Patient Name:</span>
                <span>${reportData.patientName}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Report Date:</span>
                <span>${formatDate(reportData.timestamp)}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <div class="diagnosis-box">
              <div class="diagnosis-value">${reportData.diagnosis}</div>
              <div class="confidence">Confidence: ${reportData.confidence}%</div>
            </div>
          </div>
          

          <div class="section">
            <div class="section-title">Medical History</div>
            <div class="notes">${reportData.medicalHistory || "No history provided."}</div>
          </div>
          
          <div class="signature">
            <div class="doctor-name">Dr. ${doctorName}</div>
            <div class="timestamp">Generated on ${formatDate(new Date().toISOString())}</div>
          </div>
          
          <div class="footer">
            This report was generated by the LungVision AI Lung Cancer Detection System. This is an AI-assisted diagnosis 
            and should not replace professional medical judgment. Additional diagnostic tests may be recommended.
            <br><br>
            <strong>Developed by Nilansh Jain</strong>
          </div>
        </body>
      </html>
    `;
  };

  const generateAndPrintReport = async () => {
    try {
      setGenerating(true);
      
      // Instead of actually generating a PDF, show installation instructions
      Alert.alert(
        "Install Required Packages",
        "To enable PDF generation, install these packages:\n\n" +
        "npm install expo-print expo-sharing\n\n" +
        "or\n\n" +
        "yarn add expo-print expo-sharing",
        [{ text: "OK" }]
      );
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        "Error",
        "An error occurred. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.blue} />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Report</Text>
        </View>
        
        {reportData && (
          <View style={styles.reportContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Patient Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Patient:</Text>
                <Text style={styles.infoValue}>{reportData.patientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{reportData.patientId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(reportData.timestamp)}</Text>
              </View>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Diagnosis</Text>
              <View style={[
                styles.diagnosisBox, 
                { borderColor: getStatusColor(reportData.diagnosis) }
              ]}>
                <Text style={[
                  styles.diagnosisText,
                  { color: getStatusColor(reportData.diagnosis) }
                ]}>
                  {reportData.diagnosis}
                </Text>
                <Text style={styles.confidenceText}>
                  Confidence: {reportData.confidence}%
                </Text>
              </View>
            </View>
            
            
            <TouchableOpacity
              style={[styles.printButton, generating && styles.buttonDisabled]}
              onPress={generateAndPrintReport}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color={Colors.text.primary} />
              ) : (
                <>
                  <MaterialCommunityIcons name="printer" size={24} color={Colors.text.primary} />
                  <Text style={styles.printButtonText}>Print Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: Colors.text.primary,
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  reportContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 70,
    fontWeight: 'bold',
    color: Colors.text.secondary,
  },
  infoValue: {
    flex: 1,
    color: Colors.text.primary,
  },
  diagnosisBox: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  diagnosisText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confidenceText: {
    color: Colors.text.secondary,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.default,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 150,
  },
  printButton: {
    backgroundColor: Colors.accent.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  printButtonText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 