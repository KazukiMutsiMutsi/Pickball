import { Radius, Spacing } from '@/constants/theme';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#7C3AED';
const DARK   = '#1E1B2E';
const CARD   = '#2A2640';

interface Court {
  id: string; name: string; location: string;
  type: string; pricePerHour: number; slots: number;
  active: boolean; bookingsToday: number;
}

const INITIAL: Court[] = [
  { id: '1', name: 'Court 1', location: 'Lapu-Lapu, Cebu', type: 'Indoor',  pricePerHour: 20, slots: 6, active: true,  bookingsToday: 8  },
  { id: '2', name: 'Court 2', location: 'Lapu-Lapu, Cebu', type: 'Outdoor', pricePerHour: 15, slots: 3, active: true,  bookingsToday: 3  },
  { id: '3', name: 'Court 3', location: 'Lapu-Lapu, Cebu', type: 'Covered', pricePerHour: 18, slots: 8, active: true,  bookingsToday: 5  },
];

const TYPE_COLOR: Record<string, string> = {
  Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24',
};

export default function AdminCourts() {
  const [courts, setCourts] = useState(INITIAL);

  const toggleActive = (id: string) =>
    setCourts((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Courts</Text>
        <TouchableOpacity style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add court">
          <Text style={styles.addBtnText}>+ Add Court</Text>
        </TouchableOpacity>
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total',    value: courts.length.toString()                           },
          { label: 'Active',   value: courts.filter(c => c.active).length.toString()     },
          { label: 'Inactive', value: courts.filter(c => !c.active).length.toString()    },
          { label: 'Bookings', value: courts.reduce((s, c) => s + c.bookingsToday, 0).toString() + ' today' },
        ].map((s) => (
          <View key={s.label} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={courts}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLOR[item.type] ?? '#fff') + '22' }]}>
                <Text style={[styles.typeText, { color: TYPE_COLOR[item.type] ?? '#fff' }]}>{item.type}</Text>
              </View>
              <Switch
                value={item.active}
                onValueChange={() => toggleActive(item.id)}
                trackColor={{ false: '#3D3A55', true: PURPLE }}
                thumbColor="#fff"
                accessibilityLabel={`Toggle ${item.name}`}
              />
            </View>
            <Text style={styles.courtName}>{item.name}</Text>
            <Text style={styles.courtLocation}>📍 {item.location}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>₱{item.pricePerHour}/hr</Text>
              <Text style={styles.meta}>{item.slots} slots</Text>
              <Text style={[styles.meta, { color: '#34D399' }]}>{item.bookingsToday} bookings today</Text>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.editBtn} accessibilityLabel={`Edit ${item.name}`}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.scheduleBtn} accessibilityLabel={`View schedule for ${item.name}`}>
                <Text style={styles.scheduleBtnText}>📅 Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: DARK },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title:          { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn:         { backgroundColor: PURPLE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  addBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  summaryRow:     { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard:    { flex: 1, backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  summaryValue:   { fontSize: 18, fontWeight: '900', color: '#fff' },
  summaryLabel:   { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  list:           { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  card:           { backgroundColor: CARD, borderRadius: Radius.md, padding: Spacing.md },
  cardInactive:   { opacity: 0.55 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeBadge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  typeText:       { fontSize: 11, fontWeight: '700' },
  courtName:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  courtLocation:  { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  metaRow:        { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  meta:           { fontSize: 12, color: '#9CA3AF' },
  cardFooter:     { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  editBtn:        { flex: 1, backgroundColor: PURPLE + '22', borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  editBtnText:    { color: PURPLE, fontSize: 13, fontWeight: '600' },
  scheduleBtn:    { flex: 1, backgroundColor: '#60A5FA' + '22', borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  scheduleBtnText:{ color: '#60A5FA', fontSize: 13, fontWeight: '600' },
});
