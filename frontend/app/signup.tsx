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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/api';
import { AuthContext } from './_layout';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const { signIn } = useContext(AuthContext);

  // Validate email as user types
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailValid(text === '' || text.toLowerCase().endsWith('somaiya.edu'));
  };

  // Validate password as user types
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordValid(text === '' || /\d/.test(text));
  };

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Email domain validation
    if (!email.toLowerCase().endsWith('somaiya.edu')) {
      setError('Email must be a Somaiya institution email (ending with somaiya.edu)');
      return;
    }

    // Password complexity validation
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Use the AuthContext to sign in
      await signIn(data.token, data.doctor);
      
      // Navigate to home screen
      router.replace('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
      setError(errorMessage);
      console.error('Signup error:', error);
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
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={styles.logoText}>LungVision</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join as a doctor to use the Lung Cancer Detection Tool</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    !emailValid && styles.inputError
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={[
                  styles.helperText, 
                  !emailValid && styles.helperTextError
                ]}>
                  Must be a Somaiya institution email (ending with somaiya.edu)
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    !passwordValid && styles.inputError
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                />
                <Text style={[
                  styles.helperText,
                  !passwordValid && styles.helperTextError
                ]}>
                  Password must contain at least one number
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingVertical: 40,
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
  signupButton: {
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255,255,255,0.8)',
    marginRight: 5,
  },
  loginLink: {
    color: Colors.accent.blue,
    fontWeight: '600',
  },
  helperText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  helperTextError: {
    color: Colors.status.error,
  },
}); 