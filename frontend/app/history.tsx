import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform, ScrollView, Image, Alert, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, API_ROUTES } from '../constants/api';
import Footer from '../components/Footer';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from './_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PatientRecord {
  patientId: string;
  timestamp: string;
  diagnosis: string;
  confidence: number;
  probabilities: {
    normal: number;
    benign: number;
    malignant: number;
  };
}

interface ProgressAnalysis {
  trend: 'improving' | 'worsening' | 'stable';
  riskLevel: 'low' | 'moderate' | 'high';
  details: string;
  timeSpan: string;
}

export default function History() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [patientId, setPatientId] = useState(params.id?.toString() || '');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (params.id) {
      handleSearch();
    }
  }, [params.id]);

  const handleSearch = async () => {
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      let url = `${API_URL}${API_ROUTES.HISTORY}`;
      if (patientId.trim()) {
        url = `${API_URL}${API_ROUTES.HISTORY}/${patientId.trim()}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setRecords(response.data);
      if (response.data.length === 0) {
        setError('No records found for this patient');
      }
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setError('Failed to fetch patient records');
      setRecords([]);
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiagnosisColor = (diagnosis: string) => {
    switch (diagnosis.toLowerCase()) {
      case 'normal':
        return '#10b981';
      case 'benign':
        return '#f59e0b';
      case 'malignant':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const analyzeProgress = () => {
    if (records.length < 2) {
      setError('Need at least 2 scans to analyze progress');
      return;
    }

    // Sort records by timestamp
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate time span
    const firstScan = new Date(sortedRecords[0].timestamp);
    const lastScan = new Date(sortedRecords[sortedRecords.length - 1].timestamp);
    const monthsDiff = (lastScan.getTime() - firstScan.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Analyze malignancy probability trend
    const firstMalignancy = sortedRecords[0].probabilities.malignant;
    const lastMalignancy = sortedRecords[sortedRecords.length - 1].probabilities.malignant;
    const malignancyChange = lastMalignancy - firstMalignancy;

    // Determine trend and risk level
    let trend: ProgressAnalysis['trend'];
    let riskLevel: ProgressAnalysis['riskLevel'];
    let details: string;

    if (malignancyChange > 0.1) {
      trend = 'worsening';
      riskLevel = lastMalignancy > 0.7 ? 'high' : 'moderate';
      details = `Malignancy probability has increased by ${(malignancyChange * 100).toFixed(1)}% over ${monthsDiff.toFixed(1)} months. Regular monitoring recommended.`;
    } else if (malignancyChange < -0.1) {
      trend = 'improving';
      riskLevel = lastMalignancy > 0.5 ? 'moderate' : 'low';
      details = `Malignancy probability has decreased by ${(Math.abs(malignancyChange) * 100).toFixed(1)}% over ${monthsDiff.toFixed(1)} months. Continue current treatment plan.`;
    } else {
      trend = 'stable';
      riskLevel = lastMalignancy > 0.5 ? 'moderate' : 'low';
      details = `Condition appears stable with minimal changes over ${monthsDiff.toFixed(1)} months. Continue regular check-ups.`;
    }

    setAnalysis({
      trend,
      riskLevel,
      details,
      timeSpan: `${monthsDiff.toFixed(1)} months`
    });
    setShowAnalysis(true);
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    const getTrendIcon = () => {
      switch (analysis.trend) {
        case 'improving':
          return <Ionicons name="trending-down" size={24} color="#10b981" />;
        case 'worsening':
          return <Ionicons name="trending-up" size={24} color="#ef4444" />;
        case 'stable':
          return <Ionicons name="remove" size={24} color="#f59e0b" />;
      }
    };

    const getRiskColor = () => {
      switch (analysis.riskLevel) {
        case 'low':
          return '#10b981';
        case 'moderate':
          return '#f59e0b';
        case 'high':
          return '#ef4444';
      }
    };

    return (
      <View style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Progress Analysis</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowAnalysis(false)}
          >
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.analysisContent}>
          <View style={styles.analysisRow}>
            <View style={styles.trendContainer}>
              {getTrendIcon()}
              <Text style={[styles.trendText, { color: getTrendColor(analysis.trend) }]}>
                {analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
              </Text>
            </View>
            <View style={[styles.riskTag, { backgroundColor: getRiskColor() }]}>
              <Text style={styles.riskText}>{analysis.riskLevel.toUpperCase()} RISK</Text>
            </View>
          </View>

          <Text style={styles.timeSpan}>Analysis Period: {analysis.timeSpan}</Text>
          <Text style={styles.analysisDetails}>{analysis.details}</Text>
        </View>
      </View>
    );
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '#10b981';
      case 'worsening':
        return '#ef4444';
      case 'stable':
        return '#f59e0b';
    }
  };

  const renderRecord = ({ item }: { item: PatientRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        <View style={[styles.diagnosisTag, { backgroundColor: getDiagnosisColor(item.diagnosis) }]}>
          <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
        </View>
      </View>
      
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence:</Text>
        <Text style={styles.confidenceValue}>{(item.confidence * 100).toFixed(1)}%</Text>
      </View>

      <View style={styles.probabilitiesContainer}>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Normal</Text>
          <Text style={styles.probabilityValue}>{(item.probabilities.normal * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Benign</Text>
          <Text style={styles.probabilityValue}>{(item.probabilities.benign * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Malignant</Text>
          <Text style={styles.probabilityValue}>{(item.probabilities.malignant * 100).toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1a2a6c', '#2a4858', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient History</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter Patient ID"
              value={patientId}
              onChangeText={setPatientId}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1a73e8" />
              <Text style={styles.loadingText}>Loading patient records...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : searched && records.length > 0 ? (
            <>
              {!showAnalysis && (
                <TouchableOpacity 
                  style={styles.analyzeButton}
                  onPress={analyzeProgress}
                >
                  <Ionicons name="analytics" size={20} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyze Progress</Text>
                </TouchableOpacity>
              )}
              {showAnalysis && renderAnalysis()}
              <FlatList
                data={records}
                renderItem={renderRecord}
                keyExtractor={(item) => item.timestamp}
                contentContainerStyle={styles.listContainer}
              />
            </>
          ) : (
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={64} color="#94a3b8" />
              <Text style={styles.initialText}>
                Enter a patient ID above to view their scan history
              </Text>
            </View>
          )}
        </View>
      </View>
      <Footer />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    minWidth: 100,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  initialText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#94a3b8',
  },
  diagnosisTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  diagnosisText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  probabilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  probabilityItem: {
    flex: 1,
    alignItems: 'center',
  },
  probabilityLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  probabilityValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  analysisContent: {
    gap: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  riskTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeSpan: {
    fontSize: 14,
    color: '#94a3b8',
  },
  analysisDetails: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
}); 