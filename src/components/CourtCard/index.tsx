// Web stub — this component is not used in the web portal.
import React from 'react';

export interface Court {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  rating: number;
  imageUrl?: string;
}

interface CourtCardProps {
  court: Court;
  onPress?: (court: Court) => void;
}

export default function CourtCard({ court, onPress }: CourtCardProps) {
  return (
    <div
      onClick={() => onPress?.(court)}
      style={{ display: 'flex', gap: 12, padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer' }}
    >
      <div style={{ width: 80, height: 80, borderRadius: 8, background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
        {court.imageUrl ? <img src={court.imageUrl} alt={court.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏓'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{court.name}</div>
        <div style={{ fontSize: 13, color: '#757575', marginTop: 4 }}>{court.location}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#2196F3', marginTop: 6 }}>${court.pricePerHour}/hr</div>
      </div>
    </div>
  );
}
