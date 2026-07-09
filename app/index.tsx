import { Palette } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Floating ball component
function FloatingBall({
  size,
  color,
  startX,
  startY,
  delay,
}: {
  size: number;
  color: string;
  startX: number;
  startY: number;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

const BALLS = [
  { size: 120, color: '#fff', startX: -40, startY: height * 0.05, delay: 0 },
  { size: 80, color: '#fff', startX: width * 0.7, startY: height * 0.1, delay: 400 },
  { size: 60, color: '#fff', startX: width * 0.4, startY: height * 0.78, delay: 800 },
  { size: 100, color: '#fff', startX: width * 0.75, startY: height * 0.65, delay: 200 },
  { size: 50, color: '#fff', startX: width * 0.15, startY: height * 0.55, delay: 600 },
];

export default function SplashScreen() {
  const router = useRouter();

  // Logo animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Shimmer for the paddle emoji
  const shimmer = useRef(new Animated.Value(0)).current;
  const shimmerRotate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });

  useEffect(() => {
    // 1. Logo pops in
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      // 2. Paddle wobble
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        { iterations: 2 }
      ).start();

      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
        Animated.timing(taglineTranslateY, { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      // 4. Progress bar
      Animated.sequence([
        Animated.timing(progressOpacity, { toValue: 1, duration: 300, delay: 400, useNativeDriver: false }),
        Animated.timing(progressWidth, { toValue: 1, duration: 1400, delay: 100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]).start();
    });

    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Decorative floating balls */}
      {BALLS.map((b, i) => (
        <FloatingBall key={i} {...b} />
      ))}

      {/* Top wave decoration */}
      <View style={styles.topArc} />
      <View style={styles.bottomArc} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Paddle icon with glow */}
        <Animated.View
          style={[
            styles.iconWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { rotate: shimmerRotate }],
            },
          ]}
        >
          <View style={styles.iconGlow} />
          <Text style={styles.iconEmoji}>🏓</Text>
        </Animated.View>

        {/* App name */}
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Text style={styles.appName}>PicklePro</Text>
          <View style={styles.nameDivider} />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            { opacity: taglineOpacity, transform: [{ translateY: taglineTranslateY }] },
          ]}
        >
          Book your court.{'\n'}Play your game.
        </Animated.Text>
      </View>

      {/* Bottom area — loading bar + version */}
      <Animated.View style={[styles.bottomBar, { opacity: progressOpacity }]}>
        <Text style={styles.loadingText}>Loading…</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Decorative arcs
  topArc: {
    position: 'absolute',
    top: -height * 0.18,
    right: -width * 0.25,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bottomArc: {
    position: 'absolute',
    bottom: -height * 0.12,
    left: -width * 0.2,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  // Icon
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconEmoji: {
    fontSize: 88,
    zIndex: 1,
  },

  // Text
  appName: {
    fontSize: 46,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '0 2px 6px rgba(0,0,0,0.15)' },
      default: { textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
    }),
  },
  nameDivider: {
    height: 3,
    width: 60,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.4,
  },

  // Progress bar
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    letterSpacing: 1,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  version: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 10,
  },
});
