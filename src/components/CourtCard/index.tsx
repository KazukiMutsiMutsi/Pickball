import { shadowMd } from '@/src/utils/shadow';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Court {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  rating: number;
  imageUrl?: string;
}

interface CourtCardProps {
  court: Court;
  onPress?: (court: Court) => void;
}

export default function CourtCard({ court, onPress }: CourtCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(court)}>
      <View style={styles.imagePlaceholder}>
        {court.imageUrl ? (
          <Image source={{ uri: court.imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imageFallback}>🏓</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{court.name}</Text>
        <Text style={styles.location}>{court.location}</Text>
        <Text style={styles.price}>${court.pricePerHour}/hr</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    ...shadowMd,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { fontSize: 32 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#212121' },
  location: { fontSize: 13, color: '#757575', marginTop: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#2196F3', marginTop: 6 },
});
