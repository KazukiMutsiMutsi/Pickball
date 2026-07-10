import { Palette, Radius, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Court data ───────────────────────────────────────────────────────────────
const COURTS: Record<string, {
  id: string; name: string; type: string;
  pricePerHour: number; rating: number; slots: number; reviewCount: number;
  description: string; amenities: string[]; images: string[];
  openHours: string; phone: string;
  address: string; city: string; lat: number; lng: number;
}> = {
  '1': {
    id: '1', name: 'Downtown Pickleball Center', type: 'Indoor',
    pricePerHour: 20, rating: 4.8, slots: 6, reviewCount: 124,
    description: 'State-of-the-art indoor facility with 6 regulation pickleball courts, full air conditioning, and professional LED lighting. Located in Lapu-Lapu City, Cebu.',
    amenities: ['Air Conditioning', 'Locker Rooms', 'Showers', 'Pro Shop', 'Parking', 'Café', 'Equipment Rental'],
    images: ['https://picsum.photos/seed/court1a/800/400','https://picsum.photos/seed/court1b/800/400','https://picsum.photos/seed/court1c/800/400'],
    openHours: '6:00 AM – 10:00 PM daily', phone: '+63 32 888 1234',
    address: '8X66+R3 Lapu-Lapu', city: 'Lapu-Lapu City, Cebu',
    lat: 10.31216602850818, lng: 123.9601975259465,
  },
  '2': {
    id: '2', name: 'Riverside Courts', type: 'Outdoor',
    pricePerHour: 15, rating: 4.5, slots: 3, reviewCount: 87,
    description: 'Scenic outdoor courts in Lapu-Lapu City with a relaxed atmosphere. Perfect for morning and evening sessions.',
    amenities: ['Outdoor', 'Parking', 'Restrooms', 'Water Station', 'Seating Area'],
    images: ['https://picsum.photos/seed/court2a/800/400','https://picsum.photos/seed/court2b/800/400','https://picsum.photos/seed/court2c/800/400'],
    openHours: '5:00 AM – 9:00 PM daily', phone: '+63 32 888 2345',
    address: '8X66+R3 Lapu-Lapu', city: 'Lapu-Lapu City, Cebu',
    lat: 10.31216602850818, lng: 123.9601975259465,
  },
  '3': {
    id: '3', name: 'Sunset Pavilion', type: 'Covered',
    pricePerHour: 18, rating: 4.7, slots: 8, reviewCount: 203,
    description: 'Large covered pavilion in Lapu-Lapu City protecting players from rain and direct sun. Natural ventilation keeps it comfortable year-round.',
    amenities: ['Covered Roof', 'LED Lighting', 'Parking', 'Restrooms', 'Spectator Seating'],
    images: ['https://picsum.photos/seed/court3a/800/400','https://picsum.photos/seed/court3b/800/400','https://picsum.photos/seed/court3c/800/400'],
    openHours: '6:00 AM – 11:00 PM daily', phone: '+63 32 888 3456',
    address: '8X66+R3 Lapu-Lapu', city: 'Lapu-Lapu City, Cebu',
    lat: 10.31216602850818, lng: 123.9601975259465,
  },
  '4': {
    id: '4', name: 'Northpark Arena', type: 'Indoor',
    pricePerHour: 22, rating: 4.9, slots: 2, reviewCount: 311,
    description: 'Premium tournament-grade indoor arena in Lapu-Lapu City with hardwood flooring, broadcast lighting, and 200-seat spectator stands.',
    amenities: ['Air Conditioning', 'Locker Rooms', 'Showers', 'Spectator Stands', 'Pro Shop', 'Parking', 'Café', 'Scoreboard'],
    images: ['https://picsum.photos/seed/court4a/800/400','https://picsum.photos/seed/court4b/800/400','https://picsum.photos/seed/court4c/800/400'],
    openHours: '7:00 AM – 10:00 PM daily', phone: '+63 32 888 4567',
    address: '8X66+R3 Lapu-Lapu', city: 'Lapu-Lapu City, Cebu',
    lat: 10.31216602850818, lng: 123.9601975259465,
  },
  '5': {
    id: '5', name: 'Bayview Open Courts', type: 'Outdoor',
    pricePerHour: 12, rating: 4.3, slots: 10, reviewCount: 56,
    description: 'Affordable open courts in Lapu-Lapu City with a stunning bay view. Perfect for group sessions and community leagues.',
    amenities: ['Outdoor', 'Parking', 'Water Station', 'Bench Seating'],
    images: ['https://picsum.photos/seed/court5a/800/400','https://picsum.photos/seed/court5b/800/400','https://picsum.photos/seed/court5c/800/400'],
    openHours: '5:00 AM – 8:00 PM daily', phone: '+63 32 888 5678',
    address: '8X66+R3 Lapu-Lapu', city: 'Lapu-Lapu City, Cebu',
    lat: 10.31216602850818, lng: 123.9601975259465,
  },
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
const REVIEWS = [
  { id: '1', name: 'Maria Santos', initials: 'MS', rating: 5, date: 'Jul 5, 2026',  comment: 'Excellent facilities! Courts are well-maintained and staff is friendly. Will book again.' },
  { id: '2', name: 'Pedro Reyes',  initials: 'PR', rating: 4, date: 'Jun 28, 2026', comment: 'Great courts, good lighting. Parking can be crowded at peak hours but overall fantastic.' },
  { id: '3', name: 'Ana Gonzales', initials: 'AG', rating: 5, date: 'Jun 20, 2026', comment: 'Best pickleball venue in the area. Clean, professional, seamless booking process.' },
];

// ─── Court rules ──────────────────────────────────────────────────────────────
const COURT_RULES = [
  { icon: '🕐', text: 'Max 2 hours per booking during peak hours (6–9 PM)' },
  { icon: '👟', text: 'Non-marking court shoes required' },
  { icon: '🎾', text: 'BYO paddle or rent at venue (₱100/session)' },
  { icon: '🚫', text: 'No food or drinks on court' },
  { icon: '📱', text: 'Booking must be paid 1 hour before session' },
];

const TYPE_COLOR: Record<string, string> = { Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24' };
const AVATAR_COLORS = ['#1A8FE3', '#27AE60', '#E91E63'];
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

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CourtDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const court = COURTS[id ?? '1'] ?? COURTS['1'];
  const [activePhoto, setActivePhoto] = useState(0);
  const tc = TYPE_COLOR[court.type] ?? Palette.primary;

  const openMaps = () =>
    WebBrowser.openBrowserAsync(`https://maps.google.com/?q=${court.lat},${court.lng}`);

  const openStreetView = () =>
    WebBrowser.openBrowserAsync(
      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${court.lat},${court.lng}`
    );

  const openDirections = () =>
    WebBrowser.openBrowserAsync(
      `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`
    );

  // Static map image URL (no API key needed for basic embed)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${court.lat},${court.lng}&zoom=16&size=600x200&markers=color:red%7C${court.lat},${court.lng}`;

  // Google Maps Embed URL (works without API key for basic use)
  const embedUrl = `https://www.google.com/maps/embed?pb=!4v1783619134437!6m8!1m7!1skIchZMjoKl3QsK9Vx4V0Ew!2m2!1d${court.lat}!2d${court.lng}!3f175.5!4f4.3!5f0.78`;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero photo ── */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: court.images[activePhoto] }} style={styles.heroImage} contentFit="cover" transition={400} />
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={[styles.photoTypeBadge, { backgroundColor: tc }]}>
            <Text style={styles.photoTypeBadgeText}>{court.type}</Text>
          </View>
          <View style={[styles.photoSlotBadge, court.slots <= 2 ? styles.slotLow : styles.slotOk]}>
            <Text style={styles.photoSlotText}>{court.slots} slots available</Text>
          </View>
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
          <Text style={styles.location}>📍 {court.city}</Text>

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

          {/* Location & Google Map */}
          <Text style={styles.sectionTitle}>Location & Directions</Text>
          <View style={styles.locationCard}>

            {/* Address row */}
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressMain}>{court.address}</Text>
                <Text style={styles.addressCity}>{court.city}</Text>
              </View>
            </View>

            {/* Embedded Google Maps iframe (web) / native map link (mobile) */}
            {Platform.OS === 'web' ? (
              // On web: render real Google Maps embed inside an iframe via dangerouslySetInnerHTML
              <View style={styles.mapEmbedWrap}>
                {/* @ts-ignore — iframe is valid in React Native Web */}
                <iframe
                  src={`https://maps.google.com/maps?q=${court.lat},${court.lng}&z=17&output=embed`}
                  width="100%"
                  height="280"
                  style={{ border: 0, borderRadius: 8 }}
                  allowFullScreen
                  loading="lazy"
                  title="Court Location"
                />
              </View>
            ) : (
              // On native: show a styled tap-to-open card
              <TouchableOpacity
                style={styles.mapNativeCard}
                onPress={openMaps}
                accessibilityRole="button"
                accessibilityLabel="Open in Google Maps"
              >
                <View style={styles.mapNativeBg}>
                  {/* Road lines */}
                  <View style={styles.mapRoadH} />
                  <View style={styles.mapRoadV} />
                  {/* Pin */}
                  <View style={styles.mapPinWrap}>
                    <View style={styles.mapPinBubble}>
                      <Text style={styles.mapPinIcon}>🏓</Text>
                    </View>
                    <View style={styles.mapPinStem} />
                  </View>
                  {/* Tap prompt */}
                  <View style={styles.mapTapHint}>
                    <Text style={styles.mapTapHintText}>Tap to open in Google Maps</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Location info + action buttons */}
            <View style={styles.mapInfo}>
              <Text style={styles.mapCoords}>🌐 {court.lat.toFixed(5)}, {court.lng.toFixed(5)}</Text>
            </View>

            <View style={styles.mapBtns}>
              <TouchableOpacity
                style={[styles.mapBtn, styles.mapBtnPrimary]}
                onPress={openDirections}
                accessibilityRole="button"
                accessibilityLabel="Get directions"
              >
                <Text style={styles.mapBtnIcon}>🧭</Text>
                <Text style={styles.mapBtnTextWhite}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapBtn, styles.mapBtnOutline]}
                onPress={openMaps}
                accessibilityRole="button"
                accessibilityLabel="Open in Google Maps"
              >
                <Text style={styles.mapBtnIcon}>🗺️</Text>
                <Text style={styles.mapBtnTextDark}>Open Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapBtn, styles.mapBtnOutline]}
                onPress={openStreetView}
                accessibilityRole="button"
                accessibilityLabel="View Street View"
              >
                <Text style={styles.mapBtnIcon}>📸</Text>
                <Text style={styles.mapBtnTextDark}>Street View</Text>
              </TouchableOpacity>
            </View>
          </View>

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

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₱{court.pricePerHour}<Text style={styles.footerPriceUnit}>/hr</Text></Text>
          <Text style={styles.footerSlots}>{court.slots} slots available</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push({ pathname: '/booking/date', params: { courtId: court.id, courtName: court.name, price: court.pricePerHour } })}
          accessibilityRole="button"
          accessibilityLabel="Book this court"
        >
          <Text style={styles.bookBtnText}>📅 Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#fff' },
  heroWrap:           { height: 300, position: 'relative' },
  heroImage:          { width: '100%', height: '100%' },
  heroOverlay:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.25)' },
  backBtn:            { position: 'absolute', top: 50, left: Spacing.md, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  backIcon:           { fontSize: 26, color: Palette.primary, lineHeight: 30 },
  photoTypeBadge:     { position: 'absolute', top: 54, left: Spacing.md + 48, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  photoTypeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  photoSlotBadge:     { position: 'absolute', top: 50, right: Spacing.md, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  slotOk:             { backgroundColor: 'rgba(39,174,96,0.92)' },
  slotLow:            { backgroundColor: 'rgba(231,76,60,0.92)' },
  photoSlotText:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  dotRow:             { position: 'absolute', bottom: Spacing.sm, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot:                { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive:          { backgroundColor: '#fff', width: 18 },
  thumbStrip:         { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, backgroundColor: '#fff' },
  thumbWrap:          { borderRadius: Radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbWrapActive:    { borderColor: Palette.primary },
  thumb:              { width: 80, height: 60 },
  body:               { padding: Spacing.md },
  nameRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  courtName:          { fontSize: 20, fontWeight: '900', color: '#0F172A', flex: 1, marginRight: 8 },
  ratingWrap:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText:         { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  reviewCount:        { fontSize: 12, color: '#64748B' },
  location:           { fontSize: 13, color: '#64748B', marginBottom: Spacing.md },
  statsRow:           { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard:           { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: Spacing.sm, alignItems: 'center' },
  statValue:          { fontSize: 18, fontWeight: '900', color: Palette.primary },
  statLabel:          { fontSize: 10, color: '#64748B', marginTop: 2 },
  infoBox:            { backgroundColor: '#F8FAFC', borderRadius: 14, marginBottom: Spacing.md, overflow: 'hidden' },
  infoRow:            { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  infoIcon:           { fontSize: 20, width: 28 },
  infoTitle:          { fontSize: 11, color: '#64748B', marginBottom: 2 },
  infoValue:          { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  sectionTitle:       { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.sm, marginTop: Spacing.md },
  description:        { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: Spacing.sm },
  amenitiesGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  amenityChip:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, gap: 5 },
  amenityIcon:        { fontSize: 14 },
  amenityText:        { fontSize: 12, color: Palette.primary, fontWeight: '600' },

  // Location & Map
  locationCard:       { backgroundColor: '#F8FAFC', borderRadius: 16, overflow: 'hidden', marginBottom: Spacing.sm },
  addressRow:         { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.sm },
  addressIcon:        { fontSize: 20, marginTop: 2 },
  addressMain:        { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  addressCity:        { fontSize: 13, color: '#64748B', marginTop: 2 },
  addressCoords:      { fontSize: 11, color: '#64748B', marginTop: 4 },
  mapThumb:           { height: 160, overflow: 'hidden', position: 'relative' },
  mapBg:              { flex: 1, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  mapGrid:            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
  mapGridLine:        { width: '12.5%', height: '25%', borderWidth: 0.5, borderColor: 'rgba(66,133,244,0.15)' },
  mapPin:             { zIndex: 2, marginBottom: 8 },
  mapPinEmoji:        { fontSize: 40 },
  mapLabel:           { position: 'absolute', bottom: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  mapLabelText:       { fontSize: 12, color: '#0F172A', fontWeight: '600' },
  mapBtns:            { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm },
  mapBtn:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 11, gap: 5 },
  mapBtnPrimary:      { backgroundColor: Palette.primary },
  mapBtnOutline:      { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0' },
  mapBtnIcon:         { fontSize: 14 },
  mapBtnTextWhite:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  mapBtnTextDark:     { color: '#0F172A', fontSize: 12, fontWeight: '600' },

  // Map embed (web) & native card (mobile)
  mapEmbedWrap:       { height: 280, marginHorizontal: 0, overflow: 'hidden', borderRadius: 0 },
  mapNativeCard:      { height: 200, overflow: 'hidden', position: 'relative' },
  mapNativeBg:        { flex: 1, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  mapRoadH:           { position: 'absolute', left: 0, right: 0, top: '50%', height: 12, backgroundColor: '#fff', opacity: 0.7 },
  mapRoadV:           { position: 'absolute', top: 0, bottom: 0, left: '40%', width: 12, backgroundColor: '#fff', opacity: 0.7 },
  mapPinWrap:         { alignItems: 'center', zIndex: 2 },
  mapPinBubble:       { width: 52, height: 52, borderRadius: 26, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  mapPinIcon:         { fontSize: 26 },
  mapPinStem:         { width: 3, height: 10, backgroundColor: Palette.primary },
  mapTapHint:         { position: 'absolute', bottom: 10, backgroundColor: 'rgba(255,255,255,0.93)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 },
  mapTapHintText:     { fontSize: 12, color: Palette.primary, fontWeight: '700' },
  mapInfo:            { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  mapCoords:          { fontSize: 11, color: '#64748B' },

  // Reviews
  reviewCard:         { backgroundColor: '#F8FAFC', borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  reviewHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  reviewInitials:     { color: '#fff', fontSize: 14, fontWeight: '800' },
  reviewMeta:         { flex: 1 },
  reviewName:         { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  reviewSubRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewDate:         { fontSize: 11, color: '#64748B' },
  reviewComment:      { fontSize: 13, color: '#64748B', lineHeight: 20 },

  // Court Rules
  rulesCard:          { backgroundColor: '#F8FAFC', borderRadius: 14, overflow: 'hidden', marginBottom: Spacing.sm },
  ruleRow:            { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.sm },
  ruleRowBorder:      { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  ruleIcon:           { fontSize: 16, width: 24 },
  ruleText:           { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20 },

  // Footer
  footer:             { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerPrice:        { fontSize: 26, fontWeight: '900', color: Palette.primary },
  footerPriceUnit:    { fontSize: 14, color: '#64748B', fontWeight: '400' },
  footerSlots:        { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  bookBtn:            { marginLeft: 'auto' as any, backgroundColor: Palette.primary, paddingHorizontal: Spacing.xl, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bookBtnText:        { color: '#fff', fontSize: 16, fontWeight: '800' },
});
