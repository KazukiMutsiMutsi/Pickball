import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏓</Text>
      <Text style={styles.title}>Pickleball</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3' },
  logo: { fontSize: 72 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 16 },
});
