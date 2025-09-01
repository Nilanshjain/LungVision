import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '../app/_layout';

const Header = () => {
  const [patientId, setPatientId] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { isAuthenticated, doctorProfile, signOut } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    setShowMenu(false);
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Link href="/">
          <Text style={styles.logo}>LungVision</Text>
        </Link>
      </View>
      
      {isAuthenticated && (
        <View style={styles.headerCenter}>
          <TextInput
            style={styles.patientInput}
            placeholder="Enter Patient ID"
            placeholderTextColor={Colors.text.secondary}
            value={patientId}
            onChangeText={setPatientId}
          />
        </View>
      )}

      <View style={styles.headerRight}>
        {isAuthenticated ? (
          <>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/patients')}
            >
              <Ionicons name="people-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push('/history')}
            >
              <Ionicons name="file-tray-full-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="person-circle-outline" size={24} color={Colors.text.primary} />
              {doctorProfile && (
                <Text style={styles.doctorName}>{doctorProfile.name.split(' ')[0]}</Text>
              )}
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showMenu && (
              <View style={styles.menuContainer}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    // Add profile navigation here if needed
                  }}
                >
                  <Ionicons name="person-outline" size={20} color={Colors.text.primary} />
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>
                
                <View style={styles.divider} />
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
                  <Text style={[styles.menuText, { color: Colors.status.error }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.nav}>
        <Link href="/dashboard" asChild>
          <View style={styles.navItem}>
            <MaterialCommunityIcons name="view-dashboard" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Dashboard</Text>
          </View>
        </Link>
        <Link href="/patients" asChild>
          <View style={styles.navItem}>
            <MaterialCommunityIcons name="account-group" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Patients</Text>
          </View>
        </Link>
        <Link href="/scan" asChild>
          <View style={styles.navItem}>
            <MaterialCommunityIcons name="scan-helper" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>Scan</Text>
          </View>
        </Link>
        <Link href="/history" asChild>
          <View style={styles.navItem}>
            <MaterialCommunityIcons name="history" size={24} color="#FFFFFF" />
            <Text style={styles.navText}>History</Text>
          </View>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 15,
    position: 'relative',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientInput: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: Colors.text.primary as string,  // Type assertionas string,  // Type assertion
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border.default as string,  // Type assertionas string,  // Type assertion
  },
  headerButton: {
    padding: 8,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  doctorName: {
    color: Colors.text.primary,
    marginLeft: 5,
    fontSize: 14,
  },
  menuContainer: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border.default,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    color: Colors.text.primary as string,  // Type assertionas string,  // Type assertion
    marginLeft: 10,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginVertical: 8,
  },
  loginButton: {
    backgroundColor: Colors.accent.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginText: {
    color: Colors.text.primary as string,  // Type assertionas string,  // Type assertion
    fontWeight: '600',
    fontSize: 14,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 8,
  },
  navText: {
    marginLeft: 8,
    color: '#FFFFFF',
  }
});

export default Header;