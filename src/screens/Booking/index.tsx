import Button from '@/src/components/Button';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleConfirm = () => {
    // TODO: navigate to payment
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Book a Court</Text>
      <Text style={styles.label}>Date</Text>
      <Text style={styles.placeholder}>Date picker — coming soon</Text>
      <Text style={styles.label}>Time Slot</Text>
      <Text style={styles.placeholder}>Time selector — coming soon</Text>
      <Button title="Confirm Booking" onPress={handleConfirm} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#212121', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#757575', marginBottom: 8, marginTop: 16 },
  placeholder: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    color: '#BDBDBD',
    fontSize: 15,
  },
  btn: { marginTop: 32 },
});
