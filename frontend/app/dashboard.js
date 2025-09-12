import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/api';
import { useRouter } from 'expo-router';
import { AuthContext } from './_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    fetchHistory();
    fetchStats();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        router.replace('/login');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.get(`${API_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        router.replace('/login');
      }
    }
  };

  const handleScan = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Authentication Error', 'You must be logged in to use this feature.');
        router.replace('/login');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'scan.jpg',
        });
        formData.append('patientId', 'default-patient'); // You might want to make this dynamic

        const response = await axios.post(`${API_URL}/predict`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });

        // Refresh history after new scan
        fetchHistory();
        fetchStats();
      }
    } catch (error) {
      console.error('Error during scan:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        router.replace('/login');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Here's your dashboard overview</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Text style={styles.scanButtonText}>Start New Scan</Text>
        </TouchableOpacity>

        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total_scans || 0}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              {/* Add more stat boxes as needed */}
            </View>
          </View>
        )}

        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {history.map((scan, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(scan.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.historyDiagnosis}>
                Diagnosis: {scan.diagnosis}
              </Text>
              <Text style={styles.historyConfidence}>
                Confidence: {(scan.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a73e8',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyDiagnosis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  historyConfidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
}); 