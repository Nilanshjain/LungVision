import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '@/app/_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileTab() {
  const { doctorProfile, signOut, signIn } = useContext(AuthContext);
  const [name, setName] = useState<string>(doctorProfile?.name || '');
  const [email, setEmail] = useState<string>(doctorProfile?.email || '');
  const [age, setAge] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(doctorProfile?.name || '');
    setEmail(doctorProfile?.email || '');
    // Load editable extras
    AsyncStorage.getItem('doctorProfileExtras')
      .then(json => {
        if (json) {
          const extras = JSON.parse(json);
          if (extras?.age) setAge(String(extras.age));
          if (extras?.department) setDepartment(String(extras.department));
          if (extras?.name && !doctorProfile?.name) setName(String(extras.name));
        }
      })
      .catch(() => {});
  }, [doctorProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const extras = { name, age, department };
      await AsyncStorage.setItem('doctorProfileExtras', JSON.stringify(extras));

      // Also update cached profile so the name shows across the app immediately
      const token = await AsyncStorage.getItem('authToken');
      const currentProfile = doctorProfile || { id: '', email };
      const updatedProfile = { ...currentProfile, name };
      await AsyncStorage.setItem('doctorProfile', JSON.stringify(updatedProfile));
      if (token) {
        // Refresh context state
        signIn(token, updatedProfile);
      }

      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#1a2a6c", "#2a4858", "#000000"]} style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'Doctor') + '&background=1a73e8&color=fff' }} style={styles.avatar} />
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.half]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              placeholder="Age"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>
          <View style={[styles.fieldGroup, styles.half]}>
            <Text style={styles.label}>Department</Text>
            <TextInput
              style={styles.input}
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g., Oncology"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 16, alignSelf: 'center' },
  heading: { color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  fieldGroup: { marginBottom: 14 },
  label: { color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontSize: 14 },
  input: { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderRadius: 8, color: 'white', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  inputDisabled: { opacity: 0.6 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  saveButton: { backgroundColor: '#1a73e8', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveText: { color: 'white', fontWeight: '700' },
  logoutButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1a73e8', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#1a73e8', fontWeight: '700' },
});


