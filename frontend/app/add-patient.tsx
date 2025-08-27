import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/api';
import { AuthContext } from './_layout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define dropdown option type
interface DropdownOption {
  label: string;
  value: string;
}

// Gender options
const genderOptions: DropdownOption[] = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
];

// Blood group options
const bloodGroupOptions: DropdownOption[] = [
  { label: 'Select Blood Group', value: '' },
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' }
];

export default function AddPatientScreen() {
  const [patientId, setPatientId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  
  // Dropdown state
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleAddPatient = async () => {
    // Validate required fields
    if (!name.trim()) {
      setError('Patient name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: patientId.trim() || undefined,
          name,
          age: age ? parseInt(age) : undefined,
          gender,
          bloodGroup,
          medicalHistory,
          doctorNotes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add patient');
      }

      // Redirect to Select Patient after successful creation
      router.replace('/select-patient');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      console.error('Add patient error:', error);
      
      if (error instanceof Error && error.message.includes('Authentication required')) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Custom dropdown component
  const CustomDropdown = ({ 
    label, 
    placeholder, 
    options, 
    value, 
    onChange, 
    isOpen, 
    onToggle 
  }: { 
    label: string, 
    placeholder: string, 
    options: DropdownOption[], 
    value: string, 
    onChange: (value: string) => void, 
    isOpen: boolean, 
    onToggle: () => void 
  }) => {
    const selectedOption = options.find(option => option.value === value);
    
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={styles.dropdownButton} 
          onPress={onToggle}
        >
          <Text style={[
            styles.dropdownButtonText,
            !value && { color: 'rgba(255,255,255,0.5)' }
          ]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="rgba(255,255,255,0.7)" 
          />
        </TouchableOpacity>
        
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={onToggle}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={onToggle}
          >
            <View style={styles.dropdownListContainer}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.value === value && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      onToggle();
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      item.value === value && styles.dropdownItemTextSelected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#1a2a6c', '#2a4858', '#000000']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Add New Patient</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Patient Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Patient ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholder="Custom ID (generated if left empty)"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={text => setAge(text.replace(/[^0-9]/g, ''))}
                    placeholder="Age"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <CustomDropdown
                    label="Gender"
                    placeholder="Select Gender"
                    options={genderOptions}
                    value={gender}
                    onChange={setGender}
                    isOpen={showGenderDropdown}
                    onToggle={() => setShowGenderDropdown(!showGenderDropdown)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <CustomDropdown
                  label="Blood Group"
                  placeholder="Select Blood Group"
                  options={bloodGroupOptions}
                  value={bloodGroup}
                  onChange={setBloodGroup}
                  isOpen={showBloodGroupDropdown}
                  onToggle={() => setShowBloodGroupDropdown(!showBloodGroupDropdown)}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical History</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medicalHistory}
                  onChangeText={setMedicalHistory}
                  placeholder="Enter patient's medical history"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Doctor's Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={doctorNotes}
                  onChangeText={setDoctorNotes}
                  placeholder="Add your notes here"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleAddPatient}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Add Patient</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  formContainer: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownListContainer: {
    backgroundColor: '#2a4858',
    borderRadius: 8,
    width: '80%',
    maxHeight: 300,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 4,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(26, 115, 232, 0.5)',
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  requiredStar: {
    color: '#ff6b6b',
  },
}); 