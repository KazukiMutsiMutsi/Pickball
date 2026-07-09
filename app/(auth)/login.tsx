import { Palette, Radius, Spacing } from '@/constants/theme';
import { shadow } from '@/src/utils/shadow';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Brand icons (pure RN, mirrors register.tsx) ─────────────────────────────

function GoogleIcon() {
  return (
    <View style={brandStyles.googleWrap}>
      <View style={[brandStyles.googleArc, brandStyles.googleArcTL]} />
      <View style={[brandStyles.googleArc, brandStyles.googleArcTR]} />
      <View style={[brandStyles.googleArc, brandStyles.googleArcBL]} />
      <View style={[brandStyles.googleArc, brandStyles.googleArcBR]} />
      <View style={brandStyles.googleCenter} />
      <View style={brandStyles.googleBar} />
      <Text style={brandStyles.googleLetter}>G</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={brandStyles.appleWrap}>
      <Text style={brandStyles.appleText}></Text>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View style={brandStyles.fbWrap}>
      <Text style={brandStyles.fbText}>f</Text>
    </View>
  );
}

const brandStyles = StyleSheet.create({
  googleWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  googleArc: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
  googleArcTL: { borderColor: '#4285F4', borderBottomColor: 'transparent', borderRightColor: 'transparent' },
  googleArcTR: { borderColor: '#EA4335', borderBottomColor: 'transparent', borderLeftColor: 'transparent' },
  googleArcBL: { borderColor: '#34A853', borderTopColor: 'transparent', borderRightColor: 'transparent' },
  googleArcBR: { borderColor: '#FBBC05', borderTopColor: 'transparent', borderLeftColor: 'transparent' },
  googleCenter: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
  googleBar: { position: 'absolute', right: 2, top: 9, width: 7, height: 3, backgroundColor: '#fff' },
  googleLetter: { fontSize: 11, fontWeight: '900', color: '#4285F4', zIndex: 1 },
  appleWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  appleText: { fontSize: 20, color: '#fff', marginTop: -3 },
  fbWrap: { width: 22, height: 22, borderRadius: 5, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  fbText: { fontSize: 16, fontWeight: '900', color: '#1877F2', lineHeight: 20 },
});

// ─── Login Screen ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.'); shake(); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.'); shake(); return;
    }
    if (!password.trim()) {
      setError('Please enter your password.'); shake(); return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      // Route based on role — admin@ prefix → admin dashboard
      if (email.toLowerCase().startsWith('admin')) {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e.message ?? 'Incorrect email or password. Please try again.');
      shake();
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
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          {/* Background decoration */}
          <View style={styles.heroBlobTop} />
          <View style={styles.heroBlobBottom} />

          <View style={styles.heroContent}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🏓</Text>
            </View>
            <Text style={styles.appName}>PicklePro</Text>
            <Text style={styles.heroTagline}>Your court awaits</Text>
          </View>
        </View>

        {/* ── Card ── */}
        <View style={[styles.card, shadow('lg')]}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {/* Error */}
          {!!error && (
            <Animated.View
              style={[styles.errorBanner, { transform: [{ translateX: shakeAnim }] }]}
            >
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrap, email.length > 0 && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Palette.grey400}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
              {email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <Text style={styles.validTick}>✓</Text>
              )}
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => { /* TODO: forgot password */ }}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrap, password.length > 0 && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Palette.grey400}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Log in button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled, shadow('lg')]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialCol}>
            <TouchableOpacity
              style={[styles.socialBtn, styles.socialBtnGoogle]}
              onPress={() => { /* TODO: Google sign-in */ }}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <GoogleIcon />
              <Text style={[styles.socialLabel, styles.socialLabelGoogle]}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="link"
            accessibilityLabel="Go to sign up"
          >
            <Text style={styles.footerLink}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.grey100 },
  container: { flexGrow: 1 },

  // ── Hero ──
  hero: {
    height: 240,
    backgroundColor: Palette.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlobTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroContent: { alignItems: 'center', zIndex: 1 },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  heroTagline: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.md,
    marginTop: -28,
    borderRadius: 20,
    padding: Spacing.lg,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Palette.grey900 },
  cardSubtitle: { fontSize: 14, color: Palette.grey600, marginTop: 2, marginBottom: Spacing.md },

  // ── Error ──
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDECEA',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Palette.danger,
  },
  errorIcon: { fontSize: 14 },
  errorText: { flex: 1, color: Palette.danger, fontSize: 13, lineHeight: 18 },

  // ── Fields ──
  fieldGroup: { marginBottom: Spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: Palette.grey700 },
  forgotLink: { fontSize: 13, color: Palette.primary, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Palette.grey300,
    borderRadius: Radius.md,
    backgroundColor: Palette.grey50,
    paddingHorizontal: Spacing.md,
  },
  inputWrapFocused: { borderColor: Palette.primary, backgroundColor: Palette.primaryLight },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: Palette.grey900, paddingVertical: 14 },
  validTick: { fontSize: 15, color: Palette.success, fontWeight: '700' },
  eyeBtn: { padding: 4, marginLeft: 4 },
  eyeIcon: { fontSize: 16 },

  // ── Login button ──
  loginBtn: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // ── Divider ──
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Palette.grey200 },
  dividerText: { fontSize: 12, color: Palette.grey500 },

  // ── Social buttons ──
  socialCol: { gap: Spacing.sm },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 14,
    gap: 10,
  },
  socialBtnGoogle: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#DADCE0' },
  socialLabelGoogle: { color: '#3C4043', fontWeight: '600', fontSize: 15 },
  socialBtnApple: { backgroundColor: '#000' },
  socialLabelApple: { color: '#fff', fontWeight: '600', fontSize: 15 },
  socialBtnFacebook: { backgroundColor: '#1877F2' },
  socialLabelFacebook: { color: '#fff', fontWeight: '600', fontSize: 15 },
  socialLabel: { fontSize: 15, fontWeight: '600' },

  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: { fontSize: 14, color: Palette.grey600 },
  footerLink: { fontSize: 14, color: Palette.primary, fontWeight: '700' },
});
