import CourtCard, { Court } from '@/src/components/CourtCard';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const MOCK_COURTS: Court[] = [
  { id: '1', name: 'Downtown Pickleball Center', location: '123 Main St', pricePerHour: 20, rating: 4.8 },
  { id: '2', name: 'Riverside Courts', location: '456 River Rd', pricePerHour: 15, rating: 4.5 },
  { id: '3', name: 'Sunset Pavilion', location: '789 Park Ave', pricePerHour: 18, rating: 4.7 },
];

export default function CourtsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Courts</Text>
      <FlatList
        data={MOCK_COURTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourtCard court={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  heading: { fontSize: 24, fontWeight: '800', color: '#212121', padding: 16 },
  list: { paddingBottom: 24 },
});
