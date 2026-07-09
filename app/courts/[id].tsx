import { Palette, Radius, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COURTS: Record<string, {
  id: string; name: string; location: string; pricePerHour: number;
  rating: number; type: string; slots: number; reviewCount: number;
  description: string; amenities: string[]; images: string[];
  openHours: string; phone: string;
}> = {
  '1': {
    id: '1', name: 'Downtown Pickleball Center', location: '123 Main St, Central District',
    pricePerHour: 20, rating: 4.8, type: 'Indoor', slots: 6, reviewCount: 124,
    description: 'State-of-the-art indoor facility with 6 regulation pickleball courts, full air conditioning, and professional LED lighting. Ideal for both competitive play and casual recreational games.',
    amenities: ['Air Conditioning', 'Locker Rooms', 'Showers', 'Pro Shop', 'Parking', 'Café', 'Equipment Rental'],
    images: ['https://picsum.photos/seed/court1a/800/400', 'https://picsum.photos/seed/court1b/800/400', 'https://picsum.photos/seed/court1c/800/400'],
    openHours: '6:00 AM – 10:00 PM daily', phone: '+63 2 8123 4567',
  },
  '2': {
    id: '2', name: 'Riverside Courts', location: '456 River Rd, Eastside',
    pricePerHour: 15, rating: 4.5, type: 'Outdoor', slots: 3, reviewCount: 87,
    description: 'Scenic outdoor courts set alongside the river with a relaxed, community-friendly atmosphere. Perfect for morning and evening sessions with beautiful natural lighting.',
    amenities: ['Outdoor', 'Parking', 'Restrooms', 'Water Station', 'Seating Area'],
    images: ['https://picsum.photos/seed/court2a/800/400', 'https://picsum.photos/seed/court2b/800/400', 'https://picsum.photos/seed/court2c/800/400'],
    openHours: '5:00 AM – 9:00 PM daily', phone: '+63 2 8234 5678',
  },
  '3': {
    id: '3', name: 'Sunset Pavilion', location: '789 Park Ave, West End',
    pricePerHour: 18, rating: 4.7, type: 'Covered', slots: 8, reviewCount: 203,
    description: 'Large covered pavilion protecting players from rain and direct sun. Natural ventilation keeps conditions comfortable all year round.',
    amenities: ['Covered Roof', 'LED Lighting', 'Parking', 'Restrooms', 'Spectator Seating'],
    images: ['https://picsum.photos/seed/court3a/800/400', 'https://picsum.photos/seed/court3b/800/400', 'https://picsum.photos/seed/court3c/800/400'],
    openHours: '6:00 AM – 11:00 PM daily', phone: '+63 2 8345 6789',
  },
  '4': {
    id: '4', name: 'Northpark Arena', location: '101 North Blvd, Northside',
    pricePerHour: 22, rating: 4.9, type: 'Indoor', slots: 2, reviewCount: 311,
    description: 'Premium tournament-grade indoor arena. High-end hardwood flooring, broadcast-quality lighting, and 200-seat spectator stands. Home to regional championships.',
    amenities: ['Air Conditioning', 'Locker Rooms', 'Showers', 'Spectator Stands', 'Pro Shop', 'Parking', 'Café', 'Scoreboard'],
    images: ['https://picsum.photos/seed/court4a/800/400', 'https://picsum.photos/seed/court4b/800/400', 'https://picsum.photos/seed/court4c/800/400'],
    openHours: '7:00 AM – 10:00 PM daily', phone: '+63 2 8456 7890',
  },
  '5': {
    id: '5', name: 'Bayview Open Courts', location: '202 Bay St, Bayfront',
    pricePerHour: 12, rating: 4.3, type: 'Outdoor', slots: 10, reviewCount: 56,
    description: 'Affordable open courts with a stunning bay view. Multiple side-by-side courts make it perfect for group sessions and community leagues.',
    amenities: ['Outdoor', 'Parking', 'Water Station', 'Bench Seating'],
    images: ['https://picsum.photos/seed/court5a/800/400', 'https://picsum.photos/seed/court5b/800/400', 'https://picsum.photos/seed/court5c/800/400'],
    openHours: '5:00 AM – 8:00 PM daily', phone: '+63 2 8567 8901',
  },
};

const REVIEWS = [
  { id: '1', name: 'Maria Santos', initials: 'MS', rating: 5, date: 'Jul 5, 2026',  comment: 'Excellent facilities! The courts are well-maintained and the staff is very friendly. Will definitely book again.' },
  { id: '2', name: 'Pedro Reyes',  initials: 'PR', rating: 4, date: 'Jun 28, 2026', comment: 'Great courts, good lighting. Parking can get a bit crowded during peak hours but overall a fantastic experience.' },
  { id: '3', name: 'Ana Gonzales', initials: 'AG', rating: 5, date: 'Jun 20, 2026', comment: 'Best pickleball venue in the area. Clean, professional, and well-organized. The booking process was seamless.' },
];

const TIME_SLOTS    = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '5:00 PM', '6:00 PM'];
const UNAVAILABLE   = new Set(['9:00 AM', '3:00 PM']);

const COURT_RULES = [
  { icon: '🕐', text: 'Max 2 hours per booking during peak hours (6–9 PM)' },
  { icon: '👟', text: 'Non-marking court shoes required' },
  { icon: '🎾', text: 'BYO paddle or rent at the venue (₱100/session)' },
  { icon: '🚫', text: 'No food or drinks on court' },
  { icon: '📱', text: 'Booking must be paid 1 hour before session' },
];

const AVATAR_COLORS = ['#1A8FE3', '#27AE60', '#E91E63'];
const TYPE_COLOR: Record<string, string> = { Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24' };
const AMENITY_ICON: Record<string, string> = {
  'Air Conditioning': '❄️', 'Locker Rooms': '🚿', 'Showers': '🚿', 'Pro Shop': '🛒',
  'Parking': '🅿️', 'Café': '☕', 'Equipment Rental': '🏓', 'Outdoor': '🌳',
  'Restrooms': '🚻', 'Water Station': '💧', 'Covered Roof': '🏠', 'LED Lighting': '💡',
  'Spectator Seating': '🪑', 'Seating Area': '🪑', 'Spectator Stands': '🏟️',
  'Scoreboard': '📊', 'Bench Seating': '🪑',
};

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Text key={i} style={{ fontSize: 13, color: i <= rating ? '#F59E0B' : Palette.grey300 }}>
          {i <= rating ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

export default function CourtDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const court = COURTS[id ?? '1'] ?? COURTS['1'];
  const [activePhoto, setActivePhoto] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const tc = TYPE_COLOR[court.type] ?? Palette.primary;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero photo ── */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: court.images[activePhoto] }} style={styles.heroImage} contentFit="cover" transition={400} />
          <View style={styles.heroOverlay} />
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          {/* Badges */}
          <View style={[styles.photoTypeBadge, { backgroundColor: tc }]}>
            <Text style={styles.photoTypeBadgeText}>{court.type}</Text>
          </View>
          <View style={[styles.photoSlotBadge, court.slots <= 2 ? styles.slotLow : styles.slotOk]}>
            <Text style={styles.photoSlotText}>{court.slots} slots available</Text>
          </View>
          {/* Dot indicators */}
          <View style={styles.dotRow}>
            {court.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activePhoto && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Thumbnail strip ── */}
        <View style={styles.thumbStrip}>
          {court.images.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setActivePhoto(i)}
              style={[styles.thumbWrap, i === activePhoto && styles.thumbWrapActive]}
              accessibilityRole="button" accessibilityLabel={`Photo ${i + 1}`}>
              <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" transition={200} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.body}>
          {/* Name + rating */}
          <View style={styles.nameRow}>
            <Text style={styles.courtName}>{court.name}</Text>
            <View style={styles.ratingWrap}>
              <Text style={styles.ratingText}>⭐ {court.rating}</Text>
              <Text style={styles.reviewCount}>({court.reviewCount})</Text>
            </View>
          </View>
          <Text style={styles.location}>📍 {court.location}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₱{court.pricePerHour}</Text>
              <Text style={styles.statLabel}>per hour</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: court.slots <= 2 ? Palette.danger : Palette.success }]}>{court.slots}</Text>
              <Text style={styles.statLabel}>slots today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>⭐ {court.rating}</Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
          </View>

          {/* Hours + phone */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View><Text style={styles.infoTitle}>Opening Hours</Text><Text style={styles.infoValue}>{court.openHours}</Text></View>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Palette.grey200 }]}>
              <Text style={styles.infoIcon}>📞</Text>
              <View><Text style={styles.infoTitle}>Contact</Text><Text style={styles.infoValue}>{court.phone}</Text></View>
            </View>
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{court.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {court.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityIcon}>{AMENITY_ICON[a] ?? '✓'}</Text>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Available Time Slots */}
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <Text style={styles.slotLabel}>Tap to select a start time for today</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotRow}>
            {TIME_SLOTS.map((slot) => {
              const unavail  = UNAVAILABLE.has(slot);
              const selected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={unavail}
                  onPress={() => setSelectedSlot(selected ? null : slot)}
                  style={[styles.slotChip, unavail && styles.slotChipUnavail, selected && styles.slotChipSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={`${slot}${unavail ? ', unavailable' : ''}`}
                >
                  <Text style={[styles.slotChipText, unavail && styles.slotChipTextUnavail, selected && styles.slotChipTextSelected]}>
                    {slot}
                  </Text>
                  {unavail && <Text style={styles.slotFullTag}>Full</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Reviews */}
          <Text style={styles.sectionTitle}>Reviews</Text>
          {REVIEWS.map((r, i) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={styles.reviewInitials}>{r.initials}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <View style={styles.reviewSubRow}>
                    <Stars rating={r.rating} />
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}

          {/* Court Rules */}
          <Text style={styles.sectionTitle}>Court Rules</Text>
          <View style={styles.rulesCard}>
            {COURT_RULES.map((rule, i) => (
              <View key={i} style={[styles.ruleRow, i < COURT_RULES.length - 1 && styles.ruleRowBorder]}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleText}>{rule.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₱{court.pricePerHour}<Text style={styles.footerPriceUnit}>/hr</Text></Text>
          <Text style={styles.footerSlots}>{court.slots} slots available</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push({ pathname: '/booking/date', params: { courtId: court.id, courtName: court.name, price: court.pricePerHour } })}
          accessibilityRole="button"
          accessibilityLabel={selectedSlot ? `Book ${selectedSlot}` : 'Book this court'}
        >
          <Text style={styles.bookBtnText}>📅 {selectedSlot ? `Book ${selectedSlot}` : 'Book Now'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#fff' },
  heroWrap:           { height: 280, position: 'relative' },
  heroImage:          { width: '100%', height: '100%' },
  heroOverlay:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.25)' },
  backBtn:            { position: 'absolute', top: 50, left: Spacing.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  backIcon:           { fontSize: 26, color: Palette.primary, lineHeight: 30 },
  photoTypeBadge:     { position: 'absolute', top: 54, left: Spacing.md + 48, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  photoTypeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  photoSlotBadge:     { position: 'absolute', top: 50, right: Spacing.md, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  slotOk:             { backgroundColor: 'rgba(39,174,96,0.92)' },
  slotLow:            { backgroundColor: 'rgba(231,76,60,0.92)' },
  photoSlotText:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  dotRow:             { position: 'absolute', bottom: Spacing.sm, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot:                { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:          { backgroundColor: '#fff', width: 18 },
  thumbStrip:         { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, backgroundColor: '#fff' },
  thumbWrap:          { borderRadius: Radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbWrapActive:    { borderColor: Palette.primary },
  thumb:              { width: 70, height: 52 },
  body:               { padding: Spacing.md },
  nameRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  courtName:          { fontSize: 20, fontWeight: '900', color: Palette.grey900, flex: 1, marginRight: 8 },
  ratingWrap:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText:         { fontSize: 14, fontWeight: '700', color: Palette.grey900 },
  reviewCount:        { fontSize: 12, color: Palette.grey500 },
  location:           { fontSize: 13, color: Palette.grey600, marginBottom: Spacing.md },
  statsRow:           { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard:           { flex: 1, backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statValue:          { fontSize: 18, fontWeight: '900', color: Palette.primary },
  statLabel:          { fontSize: 10, color: Palette.grey500, marginTop: 2 },
  infoBox:            { backgroundColor: Palette.grey50, borderRadius: Radius.md, marginBottom: Spacing.md, overflow: 'hidden' },
  infoRow:            { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  infoIcon:           { fontSize: 20, width: 28 },
  infoTitle:          { fontSize: 11, color: Palette.grey500, marginBottom: 2 },
  infoValue:          { fontSize: 14, color: Palette.grey900, fontWeight: '600' },
  sectionTitle:       { fontSize: 16, fontWeight: '800', color: Palette.grey900, marginBottom: Spacing.sm, marginTop: Spacing.md },
  description:        { fontSize: 14, color: Palette.grey700, lineHeight: 22, marginBottom: Spacing.sm },
  amenitiesGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  amenityChip:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, gap: 5 },
  amenityIcon:        { fontSize: 14 },
  amenityText:        { fontSize: 12, color: Palette.primary, fontWeight: '600' },
  slotLabel:          { fontSize: 12, color: Palette.grey500, marginBottom: Spacing.sm },
  slotRow:            { paddingBottom: Spacing.sm, gap: Spacing.sm },
  slotChip:           { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Palette.grey50, borderWidth: 1.5, borderColor: Palette.grey200, alignItems: 'center', minWidth: 80 },
  slotChipSelected:   { backgroundColor: Palette.primary, borderColor: Palette.primary },
  slotChipUnavail:    { opacity: 0.5 },
  slotChipText:       { fontSize: 13, fontWeight: '600', color: Palette.grey800 },
  slotChipTextSelected: { color: '#fff' },
  slotChipTextUnavail:{ color: Palette.grey400 },
  slotFullTag:        { fontSize: 9, color: Palette.grey400, fontWeight: '600', marginTop: 2 },
  reviewCard:         { backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  reviewInitials:     { color: '#fff', fontSize: 14, fontWeight: '800' },
  reviewMeta:         { flex: 1 },
  reviewName:         { fontSize: 14, fontWeight: '700', color: Palette.grey900, marginBottom: 2 },
  reviewSubRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewDate:         { fontSize: 11, color: Palette.grey500 },
  reviewComment:      { fontSize: 13, color: Palette.grey700, lineHeight: 20 },
  rulesCard:          { backgroundColor: Palette.grey50, borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm },
  ruleRow:            { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.sm },
  ruleRowBorder:      { borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  ruleIcon:           { fontSize: 16, width: 24 },
  ruleText:           { flex: 1, fontSize: 13, color: Palette.grey700, lineHeight: 20 },
  footer:             { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Palette.grey200 },
  footerPrice:        { fontSize: 26, fontWeight: '900', color: Palette.primary },
  footerPriceUnit:    { fontSize: 14, color: Palette.grey600, fontWeight: '400' },
  footerSlots:        { fontSize: 12, color: Palette.success, fontWeight: '600', marginTop: 2 },
  bookBtn:            { marginLeft: 'auto' as any, backgroundColor: Palette.primary, paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: Radius.md },
  bookBtnText:        { color: '#fff', fontSize: 16, fontWeight: '800' },
});
