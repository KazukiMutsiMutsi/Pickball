import { shadowMd } from '@/src/utils/shadow';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface PaymentDetails {
  amount: number;
  courtName: string;
  date: string;
  duration: string;
  transactionId?: string;
}

interface PaymentCardProps {
  payment: PaymentDetails;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Payment Summary</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Court</Text>
        <Text style={styles.value}>{payment.courtName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{payment.date}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{payment.duration}</Text>
      </View>
      {payment.transactionId && (
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.value}>{payment.transactionId}</Text>
        </View>
      )}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${payment.amount.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    ...shadowMd,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 14, color: '#757575' },
  value: { fontSize: 14, color: '#212121' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E0E0E0', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#212121' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#2196F3' },
});
