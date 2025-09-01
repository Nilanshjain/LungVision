import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copyright}>© 2025 LungVision. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.background as string,  // Type assertion
  },
  copyright: {
    color: Colors.text.primary as string,  // Type assertion
    fontSize: 14,
  }
});