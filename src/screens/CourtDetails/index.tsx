import Button from '@/src/components/Button';
import { Court } from '@/src/components/CourtCard';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface CourtDetailsScreenProps {
  court?: Court;
}

export default function CourtDetailsScreen({ court }: CourtDetailsScreenProps) {
  if (!court) {
    return (
      <View style={styles.centered}>
        <Text>Court not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🏓</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{court.name}</Text>
        <Text style={styles.location}>{court.location}</Text>
        <Text style={styles.price}>${court.pricePerHour}/hr</Text>
        <Button title="Book Now" style={styles.bookBtn} onPress={() => { /* TODO */ }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    height: 200,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 80 },
  body: { padding: 20 },
  name: { fontSize: 22, fontWeight: '800', color: '#212121' },
  location: { fontSize: 14, color: '#757575', marginTop: 6 },
  price: { fontSize: 18, fontWeight: '700', color: '#2196F3', marginTop: 12 },
  bookBtn: { marginTop: 24 },
});
