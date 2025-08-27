import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { AuthContext } from './_layout';

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  medicalHistory?: string;
  doctorNotes?: string;
  scanCount: number;
  lastScan?: string;
}

export default function SelectPatientScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Refresh patients list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPatients()
      .finally(() => setRefreshing(false));
  }, []);

  const fetchPatients = async () => {
    if (refreshing) return;
    
    setLoading(prev => !refreshing && prev);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching patients...');
      const response = await fetch(`${API_URL}/patients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patients');
      }

      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
        console.log(`Loaded ${data.patients.length} patients`);
      } else {
        console.warn('No patients found or invalid data format');
        setPatients([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      console.error('Fetch patients error:', error);
      
      if (error instanceof Error && error.message.includes('Authentication required')) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId: string, patientName: string, medicalHistory?: string, doctorNotes?: string) => {
    // Store selected patient ID and navigate to scan page
    AsyncStorage.setItem('selectedPatientId', patientId)
      .then(() => AsyncStorage.setItem('selectedPatientName', patientName))
      .then(() => AsyncStorage.setItem('selectedPatientMedicalHistory', medicalHistory || ''))
      .then(() => AsyncStorage.setItem('selectedPatientDoctorNotes', doctorNotes || ''))
      .then(() => router.push('/scan'))
      .catch(err => {
        console.error('Failed to save selected patient:', err);
        Alert.alert('Error', 'Failed to select patient. Please try again.');
      });
  };

  const handleAddPatient = () => {
    router.push('/add-patient');
  };

  const filteredPatients = searchQuery.trim() 
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.bloodGroup && patient.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : patients;

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity 
      style={styles.patientCard}
      onPress={() => handlePatientSelect(item.id, item.name, item.medicalHistory, item.doctorNotes)}
    >
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View style={styles.patientDetails}>
          {item.gender && <Text style={styles.detailText}>{item.gender}</Text>}
          {item.age && <Text style={styles.detailText}>{item.age} years</Text>}
          {item.bloodGroup && <Text style={styles.detailText}>Blood: {item.bloodGroup}</Text>}
        </View>
      </View>
      <View style={styles.patientFooter}>
        <View style={styles.statBadge}>
          <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
          <Text style={styles.statText}>{item.scanCount} scans</Text>
        </View>
        {item.lastScan && (
          <View style={styles.statBadge}>
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text style={styles.statText}>
              Last: {new Date(item.lastScan).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1a2a6c', '#2a4858', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Select Patient for Scan</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddPatient}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPatients}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPatients.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>
            {searchQuery ? "No patients match your search" : "No patients found"}
          </Text>
          <TouchableOpacity style={styles.addPatientButton} onPress={handleAddPatient}>
            <Text style={styles.addPatientButtonText}>Add New Patient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1a73e8"]}
              tintColor="#1a73e8"
              title="Refreshing..."
              titleColor="#94a3b8"
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#1a73e8',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  patientCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  patientHeader: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  patientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#94a3b8',
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
    color: 'white',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addPatientButton: {
    marginTop: 16,
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addPatientButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
}); 