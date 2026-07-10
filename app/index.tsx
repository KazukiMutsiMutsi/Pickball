import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// ─── Loading dots ─────────────────────────────────────────────────────────────
function Dots({ on }: { on: boolean }) {
  const [n, setN] = useState(1);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setN(x => (x % 3) + 1), 450);
    return () => clearInterval(t);
  }, [on]);
  if (!on) return null;
  return (
    <View style={dot.wrap}>
      <Text style={dot.text}>Preparing the Court{'.'.repeat(n)}</Text>
    </View>
  );
}
const dot = StyleSheet.create({
  wrap: { position: 'absolute', bottom: H * 0.1, alignSelf: 'center' },
  text: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});

// ─── Splash screen ────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const router = useRouter();

  const bgOp   = useRef(new Animated.Value(0)).current;
  const logoOp = useRef(new Animated.Value(0)).current;
  const logoSc = useRef(new Animated.Value(0.75)).current;
  const logoPu = useRef(new Animated.Value(1)).current;
  const txtOp  = useRef(new Animated.Value(0)).current;
  const txtY   = useRef(new Animated.Value(22)).current;

  const [show, setShow] = useState(false);

  // Glow pulse on the ring around the logo
  const glowOp = useRef(new Animated.Value(0.4)).current;

  const combinedScale = Animated.multiply(logoSc, logoPu);

  useEffect(() => {
    // 1 – fade in background + spring the logo in
    Animated.parallel([
      Animated.timing(bgOp, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoOp, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(logoSc, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2 – slide up the text
      Animated.parallel([
        Animated.timing(txtOp, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(txtY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      setShow(true);

      // 3 – pulse the golden ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOp, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(glowOp, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // 4 – after a short wait, pulse-scale the logo then navigate
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(logoPu, {
            toValue: 1.06,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(logoPu, {
            toValue: 1.0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => router.replace('/(auth)/login'), 300);
        });
      }, 1800);
    });
  }, []);

  return (
    <Animated.View style={[s.container, { opacity: bgOp }]}>
      {/* Background layers */}
      <View style={s.bgBase} />
      <View style={s.bgTop} />
      <View style={s.bgBottom} />

      {/* Decorative rings */}
      <View style={[s.decRing, { width: 420, height: 420, top: -110, right: -110 }]} />
      <View style={[s.decRing, { width: 260, height: 260, bottom: -70, left: -70 }]} />

      {/* Logo image */}
      <View style={s.centerWrap}>
        {/* Animated golden glow ring behind the image */}
        <Animated.View style={[s.glowRing, { opacity: glowOp }]} />

        <Animated.View
          style={{
            opacity: logoOp,
            transform: [{ scale: combinedScale }],
          }}
        >
          <View style={s.logoCircle}>
            <Image
              source={require('../assets/images/logo.png')}
              style={s.logoImage}
              contentFit="cover"
            />
          </View>
        </Animated.View>
      </View>

      {/* App name + tagline */}
      <Animated.View
        style={[s.txtWrap, { opacity: txtOp, transform: [{ translateY: txtY }] }]}
      >
        <Text style={s.appName}>PicklePro</Text>
        <View style={s.divider} />
        <Text style={s.tagline}>Book · Play · Win 🇵🇭</Text>
      </Animated.View>

      <Dots on={show} />
    </Animated.View>
  );
}

const LOGO_SIZE = Math.min(W * 0.82, 340);

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1F35',
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1F35',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.55,
    backgroundColor: '#132B48',
    borderBottomLeftRadius: W * 0.6,
    borderBottomRightRadius: W * 0.6,
    opacity: 0.7,
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.25,
    backgroundColor: '#071422',
    opacity: 0.5,
  },
  decRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: LOGO_SIZE + 24,
    height: LOGO_SIZE + 24,
    borderRadius: (LOGO_SIZE + 24) / 2,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  // Clips the image into a perfect circle
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#0D1F35',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  txtWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  divider: {
    height: 3,
    width: 52,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    marginVertical: 8,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
