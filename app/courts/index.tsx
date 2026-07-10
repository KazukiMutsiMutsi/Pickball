import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadowSm } from '@/src/utils/shadow';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: H } = Dimensions.get('window');

// On web, require() of a PNG returns the served URL string directly
const LOGO_URI: string = require('../../assets/images/logo.png') as string;

// ─── Single real court location ───────────────────────────────────────────────
const COURT = {
  id:           '1',
  name:         'PicklePro Pickleball Court',
  address:      '8X66+R3 Lapu-Lapu, Cebu',
  city:         'Lapu-Lapu City, Cebu',
  pricePerHour: 20,
  rating:       4.8,
  slots:        6,
  lat:          10.31216602850818,
  lng:          123.9601975259465,
  image:        'https://picsum.photos/seed/court1/400/200',
};

// ─── Leaflet HTML — single pin + locate-me button, real-time tiles ───────────
const buildMapHtml = (logoUri: string) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0}
#map{width:100vw;height:100vh}
#locBtn{
  position:absolute;bottom:80px;right:10px;z-index:9999;
  background:#fff;border:2px solid #ccc;border-radius:8px;
  width:36px;height:36px;display:flex;align-items:center;
  justify-content:center;cursor:pointer;font-size:20px;
  box-shadow:0 2px 6px rgba(0,0,0,.3);
}
#dirBtn{
  position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:9999;
  background:#1A8FE3;color:#fff;border:none;border-radius:24px;
  padding:10px 24px;font-size:14px;font-weight:bold;cursor:pointer;
  box-shadow:0 3px 10px rgba(0,0,0,.3);
}
</style>
</head><body>
<div id="map"></div>
<div id="locBtn" title="My Location">📍</div>
<button id="dirBtn" onclick="openDir()">🧭 Get Directions</button>
<script>
var courtLat=${COURT.lat}, courtLng=${COURT.lng};
var map=L.map('map',{zoomControl:true}).setView([courtLat,courtLng],17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap contributors',maxZoom:19
}).addTo(map);

// Court pin — logo image
var courtIcon=L.divIcon({
  html:'<div style="width:56px;height:56px;border-radius:50%;border:3px solid #FFD700;box-shadow:0 3px 14px rgba(0,0,0,.55);overflow:hidden;background:#0D1F35"><img src="${logoUri}" style="width:100%;height:100%;object-fit:cover;display:block"/></div>',
  iconSize:[56,56],iconAnchor:[28,28],popupAnchor:[0,-32],className:''
});
var courtMarker=L.marker([courtLat,courtLng],{icon:courtIcon})
  .addTo(map)
  .bindPopup('<div style="font-family:sans-serif;min-width:180px"><b style="font-size:14px">PicklePro Pickleball Court</b><br><span style="color:#555;font-size:12px">📍 8X66+R3 Lapu-Lapu, Cebu</span><br><span style="color:#1A8FE3;font-weight:bold">₱20/hr · ⭐ 4.8</span></div>',{maxWidth:240})
  .openPopup();

// User location marker
var userMarker=null;

// Locate me button
document.getElementById('locBtn').onclick=function(){
  if(!navigator.geolocation){alert('Geolocation not supported');return;}
  navigator.geolocation.getCurrentPosition(function(pos){
    var lat=pos.coords.latitude, lng=pos.coords.longitude;
    if(userMarker) map.removeLayer(userMarker);
    var userIcon=L.divIcon({
      html:'<div style="background:#27AE60;border-radius:50%;width:18px;height:18px;border:3px solid #fff;box-shadow:0 0 0 3px rgba(39,174,96,.3)"></div>',
      iconSize:[18,18],iconAnchor:[9,9],className:''
    });
    userMarker=L.marker([lat,lng],{icon:userIcon}).addTo(map).bindPopup('You are here').openPopup();
    // Draw route line
    L.polyline([[lat,lng],[courtLat,courtLng]],{color:'#1A8FE3',weight:3,dashArray:'8,6',opacity:0.8}).addTo(map);
    map.fitBounds([[lat,lng],[courtLat,courtLng]],{padding:[40,40]});
  },function(){alert('Unable to get your location.');});
};

// Directions button
function openDir(){
  window.open('https://www.google.com/maps/dir/?api=1&destination='+courtLat+','+courtLng,'_blank');
}
</script></body></html>`;

export default function CourtsScreen() {
  const router  = useRouter();
  const [mapView, setMapView] = useState(true);
  const MAP_HTML = buildMapHtml(LOGO_URI);

  const openUrl = async (url: string) => {
    if (Platform.OS === 'web') {
      // On web — open in new tab
      if (typeof window !== 'undefined') window.open(url, '_blank');
    } else {
      // On native — try to open in native Maps app, fallback to in-app browser
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    }
  };

  const openDirections = () =>
    openUrl(`https://www.google.com/maps/dir/?api=1&destination=${COURT.lat},${COURT.lng}`);

  const openStreetView = () =>
    openUrl(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${COURT.lat},${COURT.lng}`);

  const openMaps = () =>
    openUrl(
      Platform.OS === 'ios'
        ? `maps://?q=${COURT.lat},${COURT.lng}`                          // Apple Maps on iOS
        : `geo:${COURT.lat},${COURT.lng}?q=${COURT.lat},${COURT.lng}`   // Google Maps on Android
    );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Court Location</Text>
        <View style={s.toggle}>
          <TouchableOpacity style={[s.tBtn, mapView && s.tBtnActive]} onPress={() => setMapView(true)}>
            <Text style={[s.tText, mapView && s.tTextActive]}>🗺️ Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tBtn, !mapView && s.tBtnActive]} onPress={() => setMapView(false)}>
            <Text style={[s.tText, !mapView && s.tTextActive]}>ℹ️ Info</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MAP VIEW ── */}
      {mapView && (
        <View style={s.mapWrap}>
          {Platform.OS === 'web' ? (
            <View style={s.mapFrame}>
              {/* @ts-ignore — iframe works in React Native Web */}
              <iframe
                srcDoc={MAP_HTML}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Court Location"
              />
            </View>
          ) : (
            /* Native fallback — tap to open Google Maps */
            <TouchableOpacity style={s.mapNative} onPress={openMaps} accessibilityLabel="Open in Google Maps">
              <View style={s.mapNativeBg}>
                <View style={s.roadH} />
                <View style={s.roadV} />
                <View style={s.singlePin}>
                  <View style={s.pinBubble}>
                    <Image
                      source={require('../../assets/images/logo.png')}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={s.pinStem} />
                </View>
                <View style={s.mapHint}><Text style={s.mapHintText}>Tap to open in Google Maps</Text></View>
              </View>
            </TouchableOpacity>
          )}

          {/* Location info card below map */}
          <View style={[s.locCard, shadowSm]}>
            <View style={s.locRow}>
              <View style={s.locIconWrap}>
                <Text style={{ fontSize: 22 }}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.locName}>{COURT.name}</Text>
                <Text style={s.locAddr}>{COURT.address}</Text>
                <Text style={s.locCity}>{COURT.city}</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={s.locBtns}>
              <TouchableOpacity style={[s.locBtn, s.locBtnPrimary]} onPress={openDirections} accessibilityLabel="Get directions">
                <Text style={s.locBtnIcon}>🧭</Text>
                <Text style={s.locBtnTextWhite}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.locBtn, s.locBtnOutline]} onPress={openMaps} accessibilityLabel="Open in maps">
                <Text style={s.locBtnIcon}>🗺️</Text>
                <Text style={s.locBtnTextDark}>Open Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.locBtn, s.locBtnOutline]} onPress={openStreetView} accessibilityLabel="Street View">
                <Text style={s.locBtnIcon}>📸</Text>
                <Text style={s.locBtnTextDark}>Street View</Text>
              </TouchableOpacity>
            </View>

            {/* View court button */}
            <TouchableOpacity
              style={s.viewCourtBtn}
              onPress={() => router.push(`/courts/${COURT.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel="View court details"
            >
              <Text style={s.viewCourtBtnText}>📋 View Court Details & Book Now →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── INFO VIEW ── */}
      {!mapView && (
        <ScrollView contentContainerStyle={s.infoScroll}>
          {/* Court photo */}
          <Image source={{ uri: COURT.image }} style={s.courtPhoto} contentFit="cover" />

          <View style={s.infoCard}>
            <Text style={s.infoName}>{COURT.name}</Text>
            <Text style={s.infoAddr}>📍 {COURT.address}</Text>
            <Text style={s.infoCity}>{COURT.city}</Text>

            <View style={s.infoStats}>
              <View style={s.infoStat}>
                <Text style={s.infoStatValue}>₱{COURT.pricePerHour}</Text>
                <Text style={s.infoStatLabel}>per hour</Text>
              </View>
              <View style={s.infoStat}>
                <Text style={[s.infoStatValue, { color: Palette.success }]}>{COURT.slots}</Text>
                <Text style={s.infoStatLabel}>slots today</Text>
              </View>
              <View style={s.infoStat}>
                <Text style={s.infoStatValue}>⭐ {COURT.rating}</Text>
                <Text style={s.infoStatLabel}>rating</Text>
              </View>
            </View>

            <View style={s.coordBox}>
              <Text style={s.coordLabel}>GPS Coordinates</Text>
              <Text style={s.coordText}>{COURT.lat.toFixed(6)}, {COURT.lng.toFixed(6)}</Text>
            </View>

            <View style={s.infoBtns}>
              <TouchableOpacity style={[s.locBtn, s.locBtnPrimary, { flex: 1 }]} onPress={openDirections}>
                <Text style={s.locBtnIcon}>🧭</Text>
                <Text style={s.locBtnTextWhite}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.locBtn, s.locBtnOutline]} onPress={openStreetView}>
                <Text style={s.locBtnIcon}>📸</Text>
                <Text style={s.locBtnTextDark}>Street View</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.viewCourtBtn}
              onPress={() => router.push(`/courts/${COURT.id}` as any)}
              accessibilityRole="button"
            >
              <Text style={s.viewCourtBtnText}>📋 View Details & Book Now →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#fff' },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  backBtn:        { width: 36 },
  backIcon:       { fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:          { flex: 1, fontSize: 18, fontWeight: '700', color: Palette.grey900, textAlign: 'center' },
  toggle:         { flexDirection: 'row', backgroundColor: Palette.grey100, borderRadius: Radius.full, overflow: 'hidden', borderWidth: 1, borderColor: Palette.grey300 },
  tBtn:           { paddingHorizontal: 10, paddingVertical: 6 },
  tBtnActive:     { backgroundColor: Palette.primary },
  tText:          { fontSize: 12, color: Palette.grey600, fontWeight: '600' },
  tTextActive:    { color: '#fff' },

  // Map
  mapWrap:        { flex: 1 },
  mapFrame:       { flex: 1, minHeight: H * 0.52 },
  mapNative:      { height: H * 0.52, overflow: 'hidden' },
  mapNativeBg:    { flex: 1, backgroundColor: '#D4E8F8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  roadH:          { position: 'absolute', top: '48%', left: 0, right: 0, height: 12, backgroundColor: '#fff', opacity: 0.7 },
  roadV:          { position: 'absolute', left: '48%', top: 0, bottom: 0, width: 12, backgroundColor: '#fff', opacity: 0.7 },
  singlePin:      { alignItems: 'center', zIndex: 2 },
  pinBubble:      { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0D1F35', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFD700', overflow: 'hidden' },
  pinStem:        { width: 4, height: 12, backgroundColor: Palette.primary },
  mapHint:        { position: 'absolute', bottom: 14, backgroundColor: 'rgba(255,255,255,0.93)', paddingHorizontal: 18, paddingVertical: 7, borderRadius: Radius.full },
  mapHintText:    { fontSize: 13, color: Palette.primary, fontWeight: '700' },

  // Location card
  locCard:        { backgroundColor: '#fff', padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.grey200 },
  locRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  locIconWrap:    { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  locName:        { fontSize: 15, fontWeight: '800', color: Palette.grey900 },
  locAddr:        { fontSize: 13, color: Palette.grey600, marginTop: 2 },
  locCity:        { fontSize: 12, color: Palette.grey500, marginTop: 1 },
  locBtns:        { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  locBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingVertical: 11, gap: 5 },
  locBtnPrimary:  { backgroundColor: Palette.primary },
  locBtnOutline:  { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Palette.grey300 },
  locBtnIcon:     { fontSize: 14 },
  locBtnTextWhite:{ color: '#fff', fontSize: 12, fontWeight: '700' },
  locBtnTextDark: { color: Palette.grey800, fontSize: 12, fontWeight: '600' },
  viewCourtBtn:   { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  viewCourtBtnText:{ color: '#fff', fontSize: 14, fontWeight: '800' },

  // Info view
  infoScroll:     { padding: Spacing.md, paddingBottom: 40 },
  courtPhoto:     { height: 200, borderRadius: Radius.lg, marginBottom: Spacing.md },
  infoCard:       { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md },
  infoName:       { fontSize: 20, fontWeight: '900', color: Palette.grey900, marginBottom: 6 },
  infoAddr:       { fontSize: 14, color: Palette.grey700, marginBottom: 2 },
  infoCity:       { fontSize: 13, color: Palette.grey500, marginBottom: Spacing.md },
  infoStats:      { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  infoStat:       { flex: 1, backgroundColor: Palette.grey50, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  infoStatValue:  { fontSize: 18, fontWeight: '900', color: Palette.primary },
  infoStatLabel:  { fontSize: 10, color: Palette.grey500, marginTop: 2 },
  coordBox:       { backgroundColor: Palette.primaryLight, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  coordLabel:     { fontSize: 11, color: Palette.primary, fontWeight: '700', marginBottom: 4 },
  coordText:      { fontSize: 13, color: Palette.grey800 },
  infoBtns:       { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
});
