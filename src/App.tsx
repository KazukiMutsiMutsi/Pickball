// src/App.tsx
// This file is the logical entry point for providers and global setup.
// The actual Expo Router entry is expo-router/entry (see package.json "main").
// Wrap your app/_layout.tsx with providers from here.

import { AuthProvider } from '@/src/context/AuthContext';
import React from 'react';

interface AppProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the app with all global context providers.
 * Import and use this in app/_layout.tsx.
 *
 * Example:
 *   import { AppProviders } from '@/src/App';
 *   export default function RootLayout() {
 *     return <AppProviders><Stack /></AppProviders>;
 *   }
 */
export function AppProviders({ children }: AppProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
