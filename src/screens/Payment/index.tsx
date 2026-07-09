import Button from '@/src/components/Button';
import PaymentCard, { PaymentDetails } from '@/src/components/PaymentCard';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

const MOCK_PAYMENT: PaymentDetails = {
  amount: 40,
  courtName: 'Downtown Pickleball Center',
  date: '2026-07-10',
  duration: '2 hours',
};

export default function PaymentScreen() {
  const handlePay = () => {
    // TODO: integrate payment gateway
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Payment</Text>
      <PaymentCard payment={MOCK_PAYMENT} />
      <Button title="Pay Now" onPress={handlePay} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  heading: { fontSize: 24, fontWeight: '800', color: '#212121', padding: 16 },
  btn: { margin: 16 },
});
