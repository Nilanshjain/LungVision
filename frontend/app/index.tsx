import React, { useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import { AuthContext } from './_layout';

export default function LandingPage() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  const scrollToInfo = () => {
    scrollViewRef.current?.scrollTo({ y: Dimensions.get('window').height, animated: true });
  };

  const handleStartScan = () => {
    if (isAuthenticated) {
      router.push('/select-patient');
    } else {
      router.push('/login');
    }
  };

  // Removed "Check Patient Records" button per request

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <ImageBackground
          source={require('../assets/lung-illustration.png')}
          style={[styles.backgroundImage]}
          resizeMode="contain"
          imageStyle={{ 
            marginTop: -300,
            width: '100%',
            height: '100%',
            opacity: 0.7
          }}
        >
          <LinearGradient
            colors={['rgba(26, 42, 108, 0.95)', 'rgba(42, 72, 88, 0.95)', 'rgba(0, 0, 0, 0.98)']}
            style={[styles.background]}
          >
            <View style={styles.mainContent}>
              <Text style={styles.appName}>LungVision</Text>
              <Text style={styles.title}>Lung Cancer{'\n'}Detection</Text>
              <Text style={styles.subtitle}>
                AI-Powered Early Detection Tool for Improved Diagnosis and Treatment Planning
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.startButton} onPress={handleStartScan}>
                  <Text style={styles.buttonText}>Start Scan</Text>
                </TouchableOpacity>

                {/* Records button removed */}
                
                <TouchableOpacity style={styles.learnButton} onPress={scrollToInfo}>
                  <Text style={styles.learnButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.accuracyContainer}>
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={styles.accuracyText}>91.2% accuracy in early detection</Text>
              </View>
            </View>

            {/* Information Section */}
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: '#fff' }]}>About Lung Cancer</Text>
              <Text style={[styles.sectionDescription, { color: 'rgba(255,255,255,0.9)' }]}>
                Lung cancer is one of the most common cancers worldwide, with over 2 million new cases diagnosed each year. Early detection is crucial for successful treatment.
              </Text>

              <View style={styles.infoGrid}>
                {/* Warning Signs Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Warning Signs</Text>
                  <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Persistent cough that doesn't go away</Text>
                    <Text style={styles.listItem}>• Chest pain that worsens with deep breathing</Text>
                    <Text style={styles.listItem}>• Hoarseness or change in voice</Text>
                    <Text style={styles.listItem}>• Unexplained weight loss</Text>
                    <Text style={styles.listItem}>• Shortness of breath</Text>
                    <Text style={styles.listItem}>• Coughing up blood</Text>
                  </View>
                </View>

                {/* Risk Factors Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Risk Factors</Text>
                  <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Smoking (responsible for 80-90% of cases)</Text>
                    <Text style={styles.listItem}>• Exposure to secondhand smoke</Text>
                    <Text style={styles.listItem}>• Exposure to radon gas</Text>
                    <Text style={styles.listItem}>• Family history of lung cancer</Text>
                    <Text style={styles.listItem}>• Previous radiation therapy to the chest</Text>
                    <Text style={styles.listItem}>• Exposure to asbestos, arsenic, or other carcinogens</Text>
                  </View>
                </View>

                {/* Benefits Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Benefits of Early Detection</Text>
                  <View style={styles.listContainer}>
                    <Text style={styles.listItem}>• Significantly higher survival rates</Text>
                    <Text style={styles.listItem}>• Less invasive treatment options</Text>
                    <Text style={styles.listItem}>• Reduced treatment complications</Text>
                    <Text style={styles.listItem}>• Better quality of life during treatment</Text>
                    <Text style={styles.listItem}>• More treatment choices available</Text>
                    <Text style={styles.listItem}>• Lower overall healthcare costs</Text>
                  </View>
                </View>
              </View>

              {/* AI Detection Section */}
              <View style={styles.aiSection}>
                <Text style={styles.cardTitle}>How Our AI-Powered Detection Works</Text>
                <Text style={styles.aiDescription}>
                  Our advanced AI algorithm has been trained on over 1000 CT scan images to identify early signs of lung cancer with high accuracy. The system can detect nodules as small as 3mm and classify them based on malignancy risk.
                </Text>
              </View>

              {/* Add Footer at the bottom */}
              <Footer />
            </View>
          </LinearGradient>
        </ImageBackground>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    minHeight: Dimensions.get('window').height,
  },
  background: {
    flex: 1,
    padding: 20,
    minHeight: Dimensions.get('window').height,
  },
  mainContent: {
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
  },
  title: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 40,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 40,
    justifyContent: 'center',
    maxWidth: 600,
  },
  startButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    minWidth: 140,
  },
  recordsButton: {
    backgroundColor: '#2a4858',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    minWidth: 140,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  learnButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 140,
  },
  learnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  checkmarkContainer: {
    backgroundColor: '#1a73e8',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accuracyText: {
    color: '#fff',
    fontSize: 14,
  },
  infoSection: {
    padding: 20,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 800,
    marginBottom: 40,
    alignSelf: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  aiSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
  },
  aiDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
}); 