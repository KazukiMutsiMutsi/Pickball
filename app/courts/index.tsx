import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

// ─── Court data with picsum photos ───────────────────────────────────────────
const ALL_COURTS = [
  {
    id: '1',
    name: 'Downtown Pickleball Center',
    location: 'Central District',
    pricePerHour: 20,
    rating: 4.8,
    type: 'Indoor',
    slots: 6,
    image: 'https://picsum.photos/seed/court1/800/400',
  },
  {
    id: '2',
    name: 'Riverside Courts',
    location: 'Eastside',
    pricePerHour: 15,
    rating: 4.5,
    type: 'Outdoor',
    slots: 3,
    image: 'https://picsum.photos/seed/court2/800/400',
  },
  {
    id: '3',
    name: 'Sunset Pavilion',
    location: 'West End',
    pricePerHour: 18,
    rating: 4.7,
    type: 'Covered',
    slots: 8,
    image: 'https://picsum.photos/seed/court3/800/400',
  },
  {
    id: '4',
    name: 'Northpark Arena',
    location: 'Northside',
    pricePerHour: 22,
    rating: 4.9,
    type: 'Indoor',
    slots: 2,
    image: 'https://picsum.photos/seed/court4/800/400',
  },
  {
    id: '5',
    name: 'Bayview Open Courts',
    location: 'Bayfront',
    pricePerHour: 12,
    rating: 4.3,
    type: 'Outdoor',
    slots: 10,
    image: 'https://picsum.photos/seed/court5/800/400',
  },
];

const FILTERS = ['All', 'Indoor', 'Outdoor', 'Covered'];

const TYPE_COLOR: Record<string, string> = {
  Indoor:  '#60A5FA',
  Outdoor: '#34D399',
  Covered: '#FBBF24',
};

export default function CourtsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = ALL_COURTS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Browse Courts</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, shadowSm]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location…"
          placeholderTextColor={Palette.grey400}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search courts"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear search">
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityLabel={f}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count */}
      <Text style={styles.resultCount}>{filtered.length} court{filtered.length !== 1 ? 's' : ''} found</Text>

      {/* Court list */}
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏓</Text>
            <Text style={styles.emptyText}>No courts found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const tc = TYPE_COLOR[item.type] ?? Palette.primary;
          return (
            <TouchableOpacity
              style={[styles.card, shadowMd]}
              onPress={() => router.push(`/courts/${item.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
            >
              {/* Court photo */}
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  contentFit="cover"
                  transition={300}
                  placeholder={{ thumbhash: '' }}
                />
                {/* Type badge over photo */}
                <View style={[styles.typeBadge, { backgroundColor: tc }]}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                {/* Slot availability */}
                <View style={[styles.slotBadge, item.slots <= 2 ? styles.slotBadgeLow : styles.slotBadgeOk]}>
                  <Text style={styles.slotText}>{item.slots} slots</Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardLocation}>📍 {item.location}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardRating}>⭐ {item.rating}</Text>
                  <View style={styles.pricePill}>
                    <Text style={styles.cardPrice}>₱{item.pricePerHour}/hr</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Palette.grey100 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:      { width: 40, alignItems: 'flex-start' },
  backIcon:     { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:        { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },

  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: Spacing.md, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  searchIcon:   { fontSize: 16, marginRight: Spacing.sm },
  searchInput:  { flex: 1, fontSize: 14, color: Palette.grey900 },
  clearBtn:     { fontSize: 16, color: Palette.grey500, paddingLeft: 8 },

  filters:      { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.grey300 },
  chipActive:   { backgroundColor: Palette.primary, borderColor: Palette.primary },
  chipText:     { fontSize: 13, color: Palette.grey700, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  resultCount:  { fontSize: 12, color: Palette.grey500, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },

  list:         { paddingHorizontal: Spacing.md, paddingBottom: 32, gap: Spacing.sm },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:   { fontSize: 48 },
  emptyText:    { fontSize: 15, color: Palette.grey500, marginTop: Spacing.sm },

  card:         { backgroundColor: '#fff', borderRadius: Radius.lg, overflow: 'hidden' },

  // Photo
  imageWrap:    { position: 'relative', height: 180 },
  image:        { width: '100%', height: '100%' },
  typeBadge:    { position: 'absolute', top: Spacing.sm, left: Spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  typeText:     { color: '#fff', fontSize: 11, fontWeight: '800' },
  slotBadge:    { position: 'absolute', top: Spacing.sm, right: Spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  slotBadgeOk:  { backgroundColor: 'rgba(39,174,96,0.9)' },
  slotBadgeLow: { backgroundColor: 'rgba(231,76,60,0.9)' },
  slotText:     { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Body
  cardBody:     { padding: Spacing.md },
  cardName:     { fontSize: 15, fontWeight: '800', color: Palette.grey900, marginBottom: 4 },
  cardLocation: { fontSize: 12, color: Palette.grey600, marginBottom: Spacing.sm },
  cardMeta:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRating:   { fontSize: 13, color: Palette.grey700 },
  pricePill:    { backgroundColor: Palette.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  cardPrice:    { fontSize: 13, fontWeight: '800', color: Palette.primary },
});
