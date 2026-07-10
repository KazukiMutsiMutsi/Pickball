import { Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { shadowSm } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Avatar options ───────────────────────────────────────────────────────────
const AVATARS = [
  { id: 'paddle',    emoji: '🏓', label: 'Paddle'    },
  { id: 'trophy',    emoji: '🏆', label: 'Trophy'    },
  { id: 'fire',      emoji: '🔥', label: 'Fire'      },
  { id: 'star',      emoji: '⭐', label: 'Star'      },
  { id: 'lightning', emoji: '⚡', label: 'Lightning' },
  { id: 'crown',     emoji: '👑', label: 'Crown'     },
  { id: 'rocket',    emoji: '🚀', label: 'Rocket'    },
  { id: 'ninja',     emoji: '🥷', label: 'Ninja'     },
  { id: 'robot',     emoji: '🤖', label: 'Robot'     },
  { id: 'alien',     emoji: '👾', label: 'Alien'     },
  { id: 'dragon',    emoji: '🐉', label: 'Dragon'    },
  { id: 'phoenix',   emoji: '🦅', label: 'Phoenix'   },
  { id: 'cat',       emoji: '😸', label: 'Cat'       },
  { id: 'panda',     emoji: '🐼', label: 'Panda'     },
  { id: 'fox',       emoji: '🦊', label: 'Fox'       },
  { id: 'wolf',      emoji: '🐺', label: 'Wolf'      },
];

const AVATAR_BG_COLORS = [
  '#1A8FE3','#27AE60','#E91E63','#F39C12','#8E44AD',
  '#E74C3C','#00ACC1','#FF6B35','#2ECC71','#9B59B6',
];

export default function ProfileEditScreen() {
  const router    = useRouter();
  const { user }  = useAuth();

  const [name,         setName]         = useState(user?.name ?? '');
  const [email,        setEmail]        = useState(user?.email ?? '');
  const [currentPass,  setCurrentPass]  = useState('');
  const [newPass,      setNewPass]      = useState('');
  const [confirmPass,  setConfirmPass]  = useState('');
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [selectedEmoji,setSelectedEmoji]= useState('🏓');
  const [selectedBg,   setSelectedBg]   = useState('#1A8FE3');
  const [avatarModal,  setAvatarModal]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [tab,          setTab]          = useState<'profile' | 'password'>('profile');

  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setSaving(true);
    // TODO: call API to update name/email
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Saved', 'Profile updated successfully!');
  };

  const handleSavePassword = async () => {
    if (!currentPass.trim()) { Alert.alert('Error', 'Enter your current password.'); return; }
    if (newPass.length < 8)  { Alert.alert('Error', 'New password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { Alert.alert('Error', 'Passwords do not match.'); return; }
    setSaving(true);
    // TODO: call API to change password
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    Alert.alert('Done', 'Password changed successfully!');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Avatar section */}
        <View style={[s.avatarSection, shadowSm]}>
          <TouchableOpacity onPress={() => setAvatarModal(true)} style={[s.avatarCircle, { backgroundColor: selectedBg }]} accessibilityRole="button" accessibilityLabel="Change avatar">
            <Text style={s.avatarEmoji}>{selectedEmoji}</Text>
            <View style={s.editBadge}><Text style={s.editBadgeText}>✏️</Text></View>
          </TouchableOpacity>
          <Text style={s.avatarHint}>Tap to change avatar</Text>

          {/* BG color picker */}
          <View style={s.colorRow}>
            {AVATAR_BG_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[s.colorDot, { backgroundColor: color }, selectedBg === color && s.colorDotSelected]}
                onPress={() => setSelectedBg(color)}
                accessibilityRole="button"
                accessibilityLabel={`Color ${color}`}
              />
            ))}
          </View>
        </View>

        {/* Tab switcher */}
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tabBtn, tab === 'profile' && s.tabBtnActive]} onPress={() => setTab('profile')}>
            <Text style={[s.tabText, tab === 'profile' && s.tabTextActive]}>Profile Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tabBtn, tab === 'password' && s.tabBtnActive]} onPress={() => setTab('password')}>
            <Text style={[s.tabText, tab === 'password' && s.tabTextActive]}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <View style={[s.card, shadowSm]}>
            <Text style={s.fieldLabel}>Full Name</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>👤</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={Palette.grey400} autoCapitalize="words" accessibilityLabel="Full name" />
            </View>

            <Text style={s.fieldLabel}>Email Address</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={Palette.grey400} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Email" />
            </View>

            <Text style={s.fieldLabel}>Phone Number</Text>
            <View style={[s.inputWrap, { opacity: 0.6 }]}>
              <Text style={s.inputIcon}>📱</Text>
              <TextInput style={s.input} value="+63 917 *** ****" editable={false} placeholderTextColor={Palette.grey400} accessibilityLabel="Phone (read only)" />
              <Text style={s.readOnly}>Verified</Text>
            </View>

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={saving} accessibilityRole="button" accessibilityLabel="Save profile">
              <Text style={s.saveBtnText}>{saving ? 'Saving…' : '💾 Save Profile'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Password tab ── */}
        {tab === 'password' && (
          <View style={[s.card, shadowSm]}>
            <Text style={s.fieldLabel}>Current Password</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput style={s.input} value={currentPass} onChangeText={setCurrentPass} secureTextEntry={!showCurrent} placeholder="Enter current password" placeholderTextColor={Palette.grey400} accessibilityLabel="Current password" />
              <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} style={s.eyeBtn}><Text>{showCurrent ? '🙈' : '👁️'}</Text></TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>New Password</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>🔑</Text>
              <TextInput style={s.input} value={newPass} onChangeText={setNewPass} secureTextEntry={!showNew} placeholder="Min. 8 characters" placeholderTextColor={Palette.grey400} accessibilityLabel="New password" />
              <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={s.eyeBtn}><Text>{showNew ? '🙈' : '👁️'}</Text></TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>Confirm New Password</Text>
            <View style={[s.inputWrap, confirmPass.length > 0 && newPass !== confirmPass && s.inputWrapError]}>
              <Text style={s.inputIcon}>🔑</Text>
              <TextInput style={s.input} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={!showConfirm} placeholder="Repeat new password" placeholderTextColor={Palette.grey400} accessibilityLabel="Confirm password" />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={s.eyeBtn}><Text>{showConfirm ? '🙈' : '👁️'}</Text></TouchableOpacity>
            </View>
            {confirmPass.length > 0 && newPass !== confirmPass && <Text style={s.mismatch}>Passwords don't match</Text>}

            <View style={s.passwordRules}>
              {[
                { rule: 'At least 8 characters',          pass: newPass.length >= 8 },
                { rule: 'Contains uppercase letter',      pass: /[A-Z]/.test(newPass) },
                { rule: 'Contains number',                pass: /[0-9]/.test(newPass) },
                { rule: 'Contains special character',     pass: /[^A-Za-z0-9]/.test(newPass) },
              ].map((r) => (
                <View key={r.rule} style={s.ruleRow}>
                  <Text style={[s.ruleIcon, { color: r.pass ? Palette.success : Palette.grey400 }]}>{r.pass ? '✓' : '○'}</Text>
                  <Text style={[s.ruleText, { color: r.pass ? Palette.success : Palette.grey500 }]}>{r.rule}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSavePassword} disabled={saving} accessibilityRole="button" accessibilityLabel="Change password">
              <Text style={s.saveBtnText}>{saving ? 'Saving…' : '🔐 Change Password'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Avatar picker modal */}
      <Modal visible={avatarModal} transparent animationType="slide" onRequestClose={() => setAvatarModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} onPress={() => setAvatarModal(false)} activeOpacity={1} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Choose Your Avatar</Text>
            <View style={s.avatarGrid}>
              {AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  style={[s.avatarOption, { backgroundColor: selectedBg }, selectedEmoji === av.emoji && s.avatarOptionSelected]}
                  onPress={() => { setSelectedEmoji(av.emoji); setAvatarModal(false); }}
                  accessibilityRole="button"
                  accessibilityLabel={av.label}
                >
                  <Text style={s.avatarOptionEmoji}>{av.emoji}</Text>
                  <Text style={s.avatarOptionLabel}>{av.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn:{ width: 40 },
  backIcon:{ fontSize: 30, color: Palette.primary, lineHeight: 34 },
  title:  { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#0F172A' },
  body:   { padding: Spacing.md, gap: Spacing.md },

  // Avatar section
  avatarSection:  { backgroundColor: '#fff', borderRadius: 20, padding: Spacing.lg, alignItems: 'center' },
  avatarCircle:   { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: Spacing.sm },
  avatarEmoji:    { fontSize: 48 },
  editBadge:      { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  editBadgeText:  { fontSize: 12 },
  avatarHint:     { fontSize: 12, color: '#64748B', marginBottom: Spacing.md },
  colorRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  colorDot:       { width: 26, height: 26, borderRadius: 13 },
  colorDotSelected:{ borderWidth: 3, borderColor: '#0F172A' },

  // Tabs
  tabRow:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, gap: 4 },
  tabBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive:  { backgroundColor: Palette.primary },
  tabText:       { fontSize: 13, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  // Card
  card:          { backgroundColor: '#fff', borderRadius: 16, padding: Spacing.md, gap: Spacing.sm },
  fieldLabel:    { fontSize: 13, fontWeight: '700', color: '#64748B', marginTop: 4 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', paddingHorizontal: Spacing.md },
  inputWrapError:{ borderColor: Palette.danger },
  inputIcon:     { fontSize: 16, marginRight: 8 },
  input:         { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 13 },
  readOnly:      { fontSize: 11, color: Palette.success, fontWeight: '700' },
  eyeBtn:        { padding: 4 },
  mismatch:      { fontSize: 12, color: Palette.danger, marginTop: -4 },
  saveBtn:       { backgroundColor: Palette.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  saveBtnText:   { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Password rules
  passwordRules: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: Spacing.sm, gap: 4 },
  ruleRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ruleIcon:      { fontSize: 13, width: 18 },
  ruleText:      { fontSize: 12 },

  // Modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.md, paddingBottom: 32 },
  modalHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle:    { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: Spacing.md, textAlign: 'center' },
  avatarGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  avatarOption:  { width: 70, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 2, borderColor: 'transparent' },
  avatarOptionSelected: { borderColor: '#0F172A', transform: [{ scale: 1.08 }] },
  avatarOptionEmoji:    { fontSize: 30 },
  avatarOptionLabel:    { fontSize: 9, color: '#fff', fontWeight: '700' },
});
