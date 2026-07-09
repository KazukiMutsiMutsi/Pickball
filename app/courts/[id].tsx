import { Palette, Radius, Spacing } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COURTS: Record<string, { id: string; name: string; location: string; pricePerHour: number; rating: number; type: string; slots: number; description: string; amenities: string[] }> = {
  '1': { id: '1', name: 'Downtown Pickleball Center', location: '123 Main St, Central District', pricePerHour: 20, rating: 4.8, type: 'Indoor', slots: 6, description: 'State-of-the-art indoor facility with 6 regulation courts, air conditioning, and professional lighting. Perfect for competitive play and casual games.', amenities: ['Air Conditioning', 'Locker Rooms', 'Pro Shop', 'Parking', 'Café'] },
  '2': { id: '2', name: 'Riverside Courts', location: '456 River Rd, Eastside', pricePerHour: 15, rating: 4.5, type: 'Outdoor', slots: 3, description: 'Scenic outdoor courts by the river with a relaxed atmosphere. Great for morning and evening sessions.', amenities: ['Outdoor', 'Parking', 'Restrooms', 'Water Station'] },
  '3': { id: '3', name: 'Sunset Pavilion', location: '789 Park Ave, West End', pricePerHour: 18, rating: 4.7, type: 'Covered', slots: 8, description: 'Covered courts that protect you from the elements. Large pavilion with natural ventilation.', amenities: ['Covered', 'Lighting', 'Parking', 'Restrooms', 'Seating'] },
  '4': { id: '4', name: 'Northpark Arena', location: '101 North Blvd, Northside', pricePerHour: 22, rating: 4.9, type: 'Indoor', slots: 2, description: 'Premium indoor arena used for tournaments. High-end flooring, broadcast lighting, and spectator stands.', amenities: ['Air Conditioning', 'Locker Rooms', 'Spectator Stands', 'Pro Shop', 'Parking', 'Café'] },
  '5': { id: '5', name: 'Bayview Open Courts', location: '202 Bay St, Bayfront', pricePerHour: 12, rating: 4.3, type: 'Outdoor', slots: 10, description: 'Affordable open courts with a stunning bay view. Community-friendly with multiple courts for simultaneous games.', amenities: ['Outdoor', 'Parking', 'Water Station'] },
};

export default function CourtDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const court = COURTS[id ?? '1'] ?? COURTS['1'];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>🏓</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{court.type}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <Text style={styles.courtName}>{court.name}</Text>
            <Text style={styles.rating}>⭐ {court.rating}</Text>
          </View>
          <Text style={styles.location}>📍 {court.location}</Text>

          {/* Price + slots */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>${court.pricePerHour}</Text>
              <Text style={styles.infoLabel}>per hour</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={[styles.infoValue, { color: Palette.success }]}>{court.slots}</Text>
              <Text style={styles.infoLabel}>slots today</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={[styles.infoValue, { color: Palette.warning }]}>⭐ {court.rating}</Text>
              <Text style={styles.infoLabel}>rating</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{court.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {court.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>✓ {a}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <View style={styles.footerPriceWrap}>
          <Text style={styles.footerPrice}>${court.pricePerHour}</Text>
          <Text style={styles.footerPriceLabel}>/hour</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push({ pathname: '/booking/date', params: { courtId: court.id, courtName: court.name, price: court.pricePerHour } })}
          accessibilityRole="button"
          accessibilityLabel="Book this court"
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  hero: {
    height: 220,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: Palette.primary, lineHeight: 30 },
  heroEmoji: { fontSize: 80 },
  typeBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  typeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { padding: Spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  courtName: { fontSize: 20, fontWeight: '800', color: Palette.grey900, flex: 1, marginRight: 8 },
  rating: { fontSize: 14, color: Palette.grey700, fontWeight: '600' },
  location: { fontSize: 13, color: Palette.grey600, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  infoCard: {
    flex: 1,
    backgroundColor: Palette.grey50,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  infoValue: { fontSize: 18, fontWeight: '800', color: Palette.primary },
  infoLabel: { fontSize: 11, color: Palette.grey600, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Palette.grey900, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  description: { fontSize: 14, color: Palette.grey700, lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amenityChip: {
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  amenityText: { fontSize: 12, color: Palette.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.grey200,
    backgroundColor: '#fff',
  },
  footerPriceWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  footerPrice: { fontSize: 24, fontWeight: '900', color: Palette.primary },
  footerPriceLabel: { fontSize: 13, color: Palette.grey600 },
  bookBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.md,
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
