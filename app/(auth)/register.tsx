import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadow } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (password.length === 0) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: 'Weak',   color: Palette.danger  },
    { label: 'Weak',   color: Palette.danger  },
    { label: 'Fair',   color: Palette.warning },
    { label: 'Good',   color: '#2196F3'       },
    { label: 'Strong', color: Palette.success },
  ];
  const { label, color } = map[score];

  return (
    <View style={strengthStyles.wrap}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[strengthStyles.bar, { backgroundColor: i <= score ? color : Palette.grey200 }]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const strengthStyles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: Spacing.sm },
  bars:  { flexDirection: 'row', gap: 4, flex: 1 },
  bar:   { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '600', width: 48, textAlign: 'right' },
});

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>
        {label}{required && <Text style={fieldStyles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:     { marginBottom: Spacing.sm },
  label:    { fontSize: 13, fontWeight: '600', color: Palette.grey700, marginBottom: 6 },
  required: { color: Palette.danger },
});

// ─── Google icon (pure RN) ────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <View style={googleStyles.wrap}>
      <View style={[googleStyles.arc, googleStyles.arcTL]} />
      <View style={[googleStyles.arc, googleStyles.arcTR]} />
      <View style={[googleStyles.arc, googleStyles.arcBL]} />
      <View style={[googleStyles.arc, googleStyles.arcBR]} />
      <View style={googleStyles.center} />
      <View style={googleStyles.bar} />
      <Text style={googleStyles.letter}>G</Text>
    </View>
  );
}

const googleStyles = StyleSheet.create({
  wrap:   { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  arc:    { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  arcTL:  { borderColor: '#4285F4', borderBottomColor: 'transparent', borderRightColor:  'transparent' },
  arcTR:  { borderColor: '#EA4335', borderBottomColor: 'transparent', borderLeftColor:   'transparent' },
  arcBL:  { borderColor: '#34A853', borderTopColor:    'transparent', borderRightColor:  'transparent' },
  arcBR:  { borderColor: '#FBBC05', borderTopColor:    'transparent', borderLeftColor:   'transparent' },
  center: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
  bar:    { position: 'absolute', right: 2, top: 9, width: 7, height: 3, backgroundColor: '#fff' },
  letter: { fontSize: 11, fontWeight: '900', color: '#4285F4', zIndex: 1 },
});

// ─── PH phone helpers ─────────────────────────────────────────────────────────
// Accepts digits only, max 10. Formats as: 9XX XXX XXXX
function formatPHPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function isValidPHPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 && digits.startsWith('9');
}

// ─── Register Screen ──────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed,      setAgreed]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid  = isValidPHPhone(phone);

  const handleRegister = async () => {
    setError('');
    if (!fullName.trim())                                           { setError('Full name is required.');                      return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.');               return; }
    if (!phoneValid)                                                { setError('Enter a valid PH mobile number (e.g. 9171234567).'); return; }
    if (password.length < 8)                                        { setError('Password must be at least 8 characters.');    return; }
    if (password !== confirm)                                       { setError('Passwords do not match.');                    return; }
    if (!agreed)                                                    { setError('Please agree to the Terms & Privacy Policy.'); return; }

    setLoading(true);
    try {
      // TODO: authService.register({ fullName, email, phone: '+63' + phoneDigits, password })
      await new Promise((r) => setTimeout(r, 1000));
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.headerEmoji}>🏓</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PicklePro and start booking courts</Text>
        </View>

        {/* Error banner */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Full name ── */}
        <Field label="Full Name" required>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan dela Cruz"
              placeholderTextColor={Palette.grey400}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              accessibilityLabel="Full name"
            />
          </View>
        </Field>

        {/* ── Email ── */}
        <Field label="Email Address" required>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Palette.grey400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email address"
            />
          </View>
        </Field>

        {/* ── Philippine mobile number ── */}
        <Field label="Mobile Number" required>
          {/* Fixed PH prefix + input */}
          <View style={styles.phoneRow}>
            {/* Locked prefix badge */}
            <View style={styles.phPrefix}>
              <Text style={styles.phFlag}>🇵🇭</Text>
              <Text style={styles.phCode}>+63</Text>
            </View>

            <TextInput
              style={styles.phoneInput}
              placeholder="9XX XXX XXXX"
              placeholderTextColor={Palette.grey400}
              value={phone}
              onChangeText={(t) => setPhone(formatPHPhone(t))}
              keyboardType="number-pad"
              maxLength={12}          // "9XX XXX XXXX" = 12 chars
              accessibilityLabel="Philippine mobile number"
            />

            {/* Live validation indicator */}
            {phoneDigits.length > 0 && (
              <View style={[styles.phoneStatus, phoneValid ? styles.phoneStatusOk : styles.phoneStatusBad]}>
                <Text style={styles.phoneStatusIcon}>{phoneValid ? '✓' : '✕'}</Text>
              </View>
            )}
          </View>

          {/* Hint */}
          <Text style={styles.phoneHint}>
            {phoneDigits.length === 0
              ? 'Globe, Smart, Sun, DITO — starts with 9'
              : phoneValid
              ? `Full number: +63 ${phone}`
              : phoneDigits.length < 10
              ? `${10 - phoneDigits.length} more digit${10 - phoneDigits.length !== 1 ? 's' : ''} needed`
              : 'Number must start with 9'}
          </Text>
        </Field>

        {/* ── Password ── */}
        <Field label="Password" required>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor={Palette.grey400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPass((v) => !v)}
              style={styles.eyeBtn}
              accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
            >
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <PasswordStrength password={password} />
        </Field>

        {/* ── Confirm password ── */}
        <Field label="Confirm Password" required>
          <View style={[styles.inputWrap, confirm.length > 0 && password !== confirm && styles.inputWrapError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor={Palette.grey400}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              accessibilityLabel="Confirm password"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              style={styles.eyeBtn}
              accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
            >
              <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
            {confirm.length > 0 && password === confirm && (
              <Text style={styles.matchIcon}>✓</Text>
            )}
          </View>
          {confirm.length > 0 && password !== confirm && (
            <Text style={styles.mismatchText}>Passwords don't match</Text>
          )}
        </Field>

        {/* ── Terms ── */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="Agree to Terms and Privacy Policy"
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled, shadow('lg')]}
          onPress={handleRegister}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Create account"
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Google ── */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => { /* TODO: Google sign-in */ }}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <GoogleIcon />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="link"
            accessibilityLabel="Go to login"
          >
            <Text style={styles.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },

  // Header
  header:     { alignItems: 'center', marginBottom: Spacing.lg },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Palette.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerEmoji:{ fontSize: 36 },
  title:      { fontSize: 26, fontWeight: '900', color: Palette.grey900 },
  subtitle:   { fontSize: 14, color: Palette.grey600, marginTop: 4 },

  // Error
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FDECEA', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Palette.danger },
  errorIcon:   { fontSize: 14 },
  errorText:   { flex: 1, color: Palette.danger, fontSize: 13, lineHeight: 18 },

  // Generic input
  inputWrap:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Palette.grey300, borderRadius: Radius.md, backgroundColor: Palette.grey50, paddingHorizontal: Spacing.md },
  inputWrapError: { borderColor: Palette.danger },
  inputIcon:      { fontSize: 16, marginRight: 8 },
  input:          { flex: 1, fontSize: 15, color: Palette.grey900, paddingVertical: 13 },
  eyeBtn:         { padding: 4 },
  eyeIcon:        { fontSize: 16 },
  matchIcon:      { fontSize: 16, color: Palette.success, fontWeight: '700' },
  mismatchText:   { fontSize: 12, color: Palette.danger, marginTop: 4 },

  // Philippine phone
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Palette.grey300,
    borderRadius: Radius.md,
    backgroundColor: Palette.grey50,
    overflow: 'hidden',
    alignItems: 'center',
  },
  phPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: Palette.grey300,
    backgroundColor: Palette.primaryLight,
    gap: 5,
  },
  phFlag:   { fontSize: 18 },
  phCode:   { fontSize: 14, fontWeight: '800', color: Palette.primary },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: Palette.grey900,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    letterSpacing: 1,
  },
  phoneStatus:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  phoneStatusOk:  { backgroundColor: '#E8F8EF' },
  phoneStatusBad: { backgroundColor: '#FDECEA' },
  phoneStatusIcon:{ fontSize: 13, fontWeight: '800' },
  phoneHint:      { fontSize: 11, color: Palette.grey500, marginTop: 4 },

  // Terms
  termsRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.sm, marginBottom: Spacing.md },
  checkbox:       { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: Palette.grey400, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked:{ backgroundColor: Palette.primary, borderColor: Palette.primary },
  checkboxTick:   { color: '#fff', fontSize: 13, fontWeight: '800' },
  termsText:      { flex: 1, fontSize: 13, color: Palette.grey700, lineHeight: 20 },
  termsLink:      { color: Palette.primary, fontWeight: '700' },

  // Submit
  btn:         { backgroundColor: Palette.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Divider
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Palette.grey200 },
  dividerText: { fontSize: 13, color: Palette.grey500 },

  // Google
  googleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, paddingVertical: 14, gap: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#DADCE0', marginBottom: Spacing.lg },
  googleBtnText: { color: '#3C4043', fontWeight: '600', fontSize: 15 },

  // Footer
  footer:     { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14, color: Palette.grey600 },
  footerLink: { fontSize: 14, color: Palette.primary, fontWeight: '700' },
});
