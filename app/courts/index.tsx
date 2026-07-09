import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_COURTS = [
  { id: '1', name: 'Downtown Pickleball Center', location: 'Central District', pricePerHour: 20, rating: 4.8, type: 'Indoor', slots: 6 },
  { id: '2', name: 'Riverside Courts', location: 'Eastside', pricePerHour: 15, rating: 4.5, type: 'Outdoor', slots: 3 },
  { id: '3', name: 'Sunset Pavilion', location: 'West End', pricePerHour: 18, rating: 4.7, type: 'Covered', slots: 8 },
  { id: '4', name: 'Northpark Arena', location: 'Northside', pricePerHour: 22, rating: 4.9, type: 'Indoor', slots: 2 },
  { id: '5', name: 'Bayview Open Courts', location: 'Bayfront', pricePerHour: 12, rating: 4.3, type: 'Outdoor', slots: 10 },
];

const FILTERS = ['All', 'Indoor', 'Outdoor', 'Covered'];

export default function CourtsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = ALL_COURTS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
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
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location"
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

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No courts found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/courts/${item.id}` as any)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            <View style={styles.cardImage}>
              <Text style={styles.cardEmoji}>🏓</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.typeBadge]}>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.cardLocation}>📍 {item.location}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardRating}>⭐ {item.rating}</Text>
                <Text style={styles.cardSlots}>{item.slots} slots free</Text>
              </View>
              <Text style={styles.cardPrice}>${item.pricePerHour}/hr</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.grey100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey200,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backIcon: { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Palette.grey900 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...shadowSm,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: 14, color: Palette.grey900 },
  clearBtn: { fontSize: 16, color: Palette.grey500, paddingLeft: 8 },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Palette.grey300,
  },
  chipActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  chipText: { fontSize: 13, color: Palette.grey700, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: Palette.grey500 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...shadowMd,
  },
  cardImage: {
    width: 90,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 36 },
  cardBody: { flex: 1, padding: Spacing.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', color: Palette.grey900, flex: 1, marginRight: 6 },
  typeBadge: { backgroundColor: Palette.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  typeText: { fontSize: 11, color: Palette.primary, fontWeight: '600' },
  cardLocation: { fontSize: 12, color: Palette.grey600, marginTop: 3 },
  cardMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 5 },
  cardRating: { fontSize: 12, color: Palette.grey700 },
  cardSlots: { fontSize: 12, color: Palette.success, fontWeight: '600' },
  cardPrice: { fontSize: 14, fontWeight: '800', color: Palette.primary, marginTop: 5 },
});
