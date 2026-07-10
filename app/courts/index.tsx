import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowMd, shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');

const ALL_COURTS = [
  { id: '1', name: 'Downtown Pickleball Center', location: 'Lapu-Lapu City, Cebu', pricePerHour: 20, rating: 4.8, type: 'Indoor',  slots: 6,  lat: 10.31216, lng: 123.96019, image: 'https://picsum.photos/seed/court1/400/200' },
  { id: '2', name: 'Riverside Courts',           location: 'Lapu-Lapu City, Cebu', pricePerHour: 15, rating: 4.5, type: 'Outdoor', slots: 3,  lat: 10.31290, lng: 123.96150, image: 'https://picsum.photos/seed/court2/400/200' },
  { id: '3', name: 'Sunset Pavilion',            location: 'Lapu-Lapu City, Cebu', pricePerHour: 18, rating: 4.7, type: 'Covered', slots: 8,  lat: 10.31150, lng: 123.95900, image: 'https://picsum.photos/seed/court3/400/200' },
  { id: '4', name: 'Northpark Arena',            location: 'Lapu-Lapu City, Cebu', pricePerHour: 22, rating: 4.9, type: 'Indoor',  slots: 2,  lat: 10.31380, lng: 123.96080, image: 'https://picsum.photos/seed/court4/400/200' },
  { id: '5', name: 'Bayview Open Courts',        location: 'Lapu-Lapu City, Cebu', pricePerHour: 12, rating: 4.3, type: 'Outdoor', slots: 10, lat: 10.31050, lng: 123.96220, image: 'https://picsum.photos/seed/court5/400/200' },
];

const FILTERS    = ['All', 'Indoor', 'Outdoor', 'Covered'];
const TYPE_COLOR: Record<string, string> = { Indoor: '#60A5FA', Outdoor: '#34D399', Covered: '#FBBF24' };

/** Build Leaflet HTML with pins for each court */
function buildMapHtml(courts: typeof ALL_COURTS, selectedId: string | null): string {
  const markers = courts.map((c) => {
    const color = c.id === selectedId ? '#E74C3C' : '#1A8FE3';
    return `L.marker([${c.lat},${c.lng}],{icon:L.divIcon({html:'<div style="background:${color};color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">🏓</div>',iconSize:[34,34],iconAnchor:[17,17],className:''})}).bindPopup('<b>${c.name}</b><br>₱${c.pricePerHour}/hr · ⭐${c.rating}<br><small>${c.location}</small>').addTo(map)`;
  }).join(';\n  ');
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}#map{width:100vw;height:100vh}</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:true}).setView([10.31216,123.96019],15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
${markers};
</script></body></html>`;
}

export default function CourtsScreen() {
  const router = useRouter();
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapView,    setMapView]    = useState(true);

  const filtered = ALL_COURTS.filter((c) => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q))
        && (filter === 'All' || c.type === filter);
  });

  const openDirections = (c: typeof ALL_COURTS[0]) =>
    WebBrowser.openBrowserAsync(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Courts</Text>
        <View style={s.toggle}>
          <TouchableOpacity style={[s.tBtn, mapView && s.tBtnActive]} onPress={() => setMapView(true)}>
            <Text style={[s.tText, mapView && s.tTextActive]}>🗺️ Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tBtn, !mapView && s.tBtnActive]} onPress={() => setMapView(false)}>
            <Text style={[s.tText, !mapView && s.tTextActive]}>☰ List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + filters */}
      <View style={[s.searchWrap, shadowSm]}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search courts…" placeholderTextColor={Palette.grey400} value={search} onChangeText={setSearch} accessibilityLabel="Search courts" />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={s.clearBtn}>✕</Text></TouchableOpacity>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MAP VIEW */}
      {mapView && (
        <View style={s.mapContainer}>
          {Platform.OS === 'web' ? (
            <View style={s.mapFrame}>
              {/* @ts-ignore */}
              <iframe srcDoc={buildMapHtml(filtered, selectedId)} style={{ width:'100%', height:'100%', border:'none' }} title="Courts Map" />
            </View>
          ) : (
            <TouchableOpacity style={s.mapNative} onPress={() => WebBrowser.openBrowserAsync('https://maps.google.com/?q=10.31216,123.96019&z=15')} accessibilityLabel="Open map">
              <View style={s.mapNativeBg}>
                <View style={s.roadH} /><View style={s.roadV} />
                {filtered.map((c, i) => (
                  <TouchableOpacity key={c.id} style={[s.pin, { top: 60 + i * 32, left: 50 + i * 45 }, c.id === selectedId && s.pinSel]} onPress={() => setSelectedId(c.id === selectedId ? null : c.id)}>
                    <Text style={s.pinEmoji}>🏓</Text>
                    {c.id === selectedId && <View style={s.pinLabel}><Text style={s.pinLabelText}>{c.name}</Text></View>}
                  </TouchableOpacity>
                ))}
                <View style={s.mapHint}><Text style={s.mapHintText}>Tap to open full map</Text></View>
              </View>
            </TouchableOpacity>
          )}

          {/* Bottom sheet */}
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{filtered.length} court{filtered.length !== 1 ? 's' : ''} · Lapu-Lapu, Cebu</Text>
            <FlatList
              horizontal
              data={filtered}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.sheetList}
              ListEmptyComponent={<Text style={{ color: Palette.grey500, padding: Spacing.md }}>No courts found.</Text>}
              renderItem={({ item: c }) => {
                const tc = TYPE_COLOR[c.type] ?? Palette.primary;
                const sel = selectedId === c.id;
                return (
                  <TouchableOpacity style={[s.sheetCard, shadowSm, sel && s.sheetCardSel]} onPress={() => setSelectedId(c.id === selectedId ? null : c.id)}>
                    <View style={{ height: 90 }}>
                      <Image source={{ uri: c.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      <View style={[s.sheetBadge, { backgroundColor: tc }]}><Text style={s.sheetBadgeText}>{c.type}</Text></View>
                    </View>
                    <View style={s.sheetBody}>
                      <Text style={s.sheetName} numberOfLines={1}>{c.name}</Text>
                      <Text style={s.sheetMeta}>⭐ {c.rating} · {c.slots} free</Text>
                      <Text style={s.sheetPrice}>₱{c.pricePerHour}/hr</Text>
                    </View>
                    <View style={s.sheetBtns}>
                      <TouchableOpacity style={s.dirBtn} onPress={() => openDirections(c)} accessibilityLabel="Directions">
                        <Text>🧭</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.viewBtn} onPress={() => router.push(`/courts/${c.id}` as any)}>
                        <Text style={s.viewBtnText}>View →</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* LIST VIEW */}
      {!mapView && (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={s.empty}><Text style={{ fontSize: 48 }}>🏓</Text><Text style={s.emptyText}>No courts found.</Text></View>}
          renderItem={({ item: c }) => {
            const tc = TYPE_COLOR[c.type] ?? Palette.primary;
            return (
              <TouchableOpacity style={[s.listCard, shadowMd]} onPress={() => router.push(`/courts/${c.id}` as any)}>
                <View style={{ height: 160, position: 'relative' }}>
                  <Image source={{ uri: c.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  <View style={[s.listBadge, { backgroundColor: tc }]}><Text style={s.listBadgeText}>{c.type}</Text></View>
                  <View style={[s.slotBadge, c.slots <= 2 ? s.slotLow : s.slotOk]}><Text style={s.slotText}>{c.slots} slots</Text></View>
                </View>
                <View style={s.listBody}>
                  <Text style={s.listName} numberOfLines={1}>{c.name}</Text>
                  <Text style={s.listLoc}>📍 {c.location}</Text>
                  <View style={s.listRow}>
                    <Text style={s.listRating}>⭐ {c.rating}</Text>
                    <TouchableOpacity style={s.listDirBtn} onPress={() => openDirections(c)}><Text style={s.listDirText}>🧭 Directions</Text></TouchableOpacity>
                    <View style={s.pricePill}><Text style={s.priceText}>₱{c.pricePerHour}/hr</Text></View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Palette.grey100 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:       { width: 36 },
  backIcon:      { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:         { flex: 1, fontSize: 18, fontWeight: '700', color: Palette.grey900, textAlign: 'center' },
  toggle:        { flexDirection: 'row', backgroundColor: Palette.grey100, borderRadius: Radius.full, overflow: 'hidden', borderWidth: 1, borderColor: Palette.grey300 },
  tBtn:          { paddingHorizontal: 10, paddingVertical: 6 },
  tBtnActive:    { backgroundColor: Palette.primary },
  tText:         { fontSize: 12, color: Palette.grey600, fontWeight: '600' },
  tTextActive:   { color: '#fff' },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: Spacing.sm, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  searchIcon:    { fontSize: 15, marginRight: 8 },
  searchInput:   { flex: 1, fontSize: 14, color: Palette.grey900 },
  clearBtn:      { fontSize: 15, color: Palette.grey400, paddingLeft: 8 },
  filterRow:     { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.sm },
  chip:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: '#fff', borderWidth: 1, borderColor: Palette.grey300 },
  chipActive:    { backgroundColor: Palette.primary, borderColor: Palette.primary },
  chipText:      { fontSize: 13, color: Palette.grey700, fontWeight: '500' },
  chipTextActive:{ color: '#fff', fontWeight: '700' },
  mapContainer:  { flex: 1 },
  mapFrame:      { flex: 1, minHeight: H * 0.42 },
  mapNative:     { height: H * 0.42, overflow: 'hidden' },
  mapNativeBg:   { flex: 1, backgroundColor: '#D4E8F8', position: 'relative' },
  roadH:         { position: 'absolute', top: '48%', left: 0, right: 0, height: 10, backgroundColor: '#fff', opacity: 0.7 },
  roadV:         { position: 'absolute', left: '45%', top: 0, bottom: 0, width: 10, backgroundColor: '#fff', opacity: 0.7 },
  pin:           { position: 'absolute', alignItems: 'center' },
  pinSel:        { transform: [{ scale: 1.3 }], zIndex: 10 },
  pinEmoji:      { fontSize: 28 },
  pinLabel:      { backgroundColor: Palette.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, marginTop: 2 },
  pinLabelText:  { color: '#fff', fontSize: 9, fontWeight: '700' },
  mapHint:       { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.full },
  mapHintText:   { fontSize: 12, color: Palette.primary, fontWeight: '700' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: Spacing.sm, maxHeight: 230 },
  sheetHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: Palette.grey300, alignSelf: 'center', marginBottom: Spacing.sm },
  sheetTitle:    { fontSize: 13, fontWeight: '700', color: Palette.grey900, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sheetList:     { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  sheetCard:     { width: 175, backgroundColor: '#fff', borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1.5, borderColor: Palette.grey200 },
  sheetCardSel:  { borderColor: Palette.primary },
  sheetBadge:    { position: 'absolute', top: 5, left: 5, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  sheetBadgeText:{ color: '#fff', fontSize: 9, fontWeight: '800' },
  sheetBody:     { padding: Spacing.sm },
  sheetName:     { fontSize: 12, fontWeight: '700', color: Palette.grey900 },
  sheetMeta:     { fontSize: 11, color: Palette.grey600, marginTop: 2 },
  sheetPrice:    { fontSize: 13, fontWeight: '800', color: Palette.primary, marginTop: 3 },
  sheetBtns:     { flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
  dirBtn:        { width: 32, height: 30, borderRadius: Radius.sm, backgroundColor: Palette.grey100, alignItems: 'center', justifyContent: 'center' },
  viewBtn:       { flex: 1, height: 30, borderRadius: Radius.sm, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  viewBtnText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  list:          { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 32 },
  empty:         { alignItems: 'center', paddingTop: 60 },
  emptyText:     { fontSize: 15, color: Palette.grey500, marginTop: Spacing.sm },
  listCard:      { backgroundColor: '#fff', borderRadius: Radius.lg, overflow: 'hidden' },
  listBadge:     { position: 'absolute', top: Spacing.sm, left: Spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  listBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  slotBadge:     { position: 'absolute', top: Spacing.sm, right: Spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  slotOk:        { backgroundColor: 'rgba(39,174,96,0.9)' },
  slotLow:       { backgroundColor: 'rgba(231,76,60,0.9)' },
  slotText:      { color: '#fff', fontSize: 11, fontWeight: '700' },
  listBody:      { padding: Spacing.md },
  listName:      { fontSize: 15, fontWeight: '800', color: Palette.grey900, marginBottom: 4 },
  listLoc:       { fontSize: 12, color: Palette.grey600, marginBottom: Spacing.sm },
  listRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listRating:    { fontSize: 13, color: Palette.grey700 },
  listDirBtn:    { backgroundColor: Palette.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  listDirText:   { fontSize: 12, color: Palette.primary, fontWeight: '700' },
  pricePill:     { backgroundColor: Palette.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  priceText:     { fontSize: 13, fontWeight: '800', color: Palette.primary },
});
