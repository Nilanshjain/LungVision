import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/api';
import { AuthContext } from './_layout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Use the AuthContext to sign in
      await signIn(data.token, data.doctor);
      
      // Navigate to home screen
      router.replace('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/lung-illustration.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
        imageStyle={{ 
          marginTop: -100,
          width: '100%',
          height: '100%',
          opacity: 0.4
        }}
      >
        <LinearGradient
          colors={['rgba(26, 42, 108, 0.95)', 'rgba(42, 72, 88, 0.95)', 'rgba(0, 0, 0, 0.98)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formContainer}
          >
            <Text style={styles.logoText}>LungVision</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to access the Lung Cancer Detection Tool</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1a73e8',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.status.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: 'rgba(255,255,255,0.8)',
    marginRight: 5,
  },
  signupLink: {
    color: Colors.accent.blue,
    fontWeight: '600',
  },
}); 