import React, { useState } from 'react';

interface Settings {
  openHour: number;
  closeHour: number;
  pricePerHour: number;
  advanceBookingDays: number;
  sameDayBufferHours: number;
  promoCode: string;
  promoDiscount: number;
  serviceFeePercent: number;
  cancellationHours: number;
  cancellationFeePercent: number;
}

const DEFAULT: Settings = {
  openHour: 9,
  closeHour: 24,
  pricePerHour: 210,
  advanceBookingDays: 30,
  sameDayBufferHours: 1,
  promoCode: 'PICKLE10',
  promoDiscount: 10,
  serviceFeePercent: 5,
  cancellationHours: 24,
  cancellationFeePercent: 50,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 3000); };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );

  const Field = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div style={s.field}>
      <div>
        <div style={s.fieldLabel}>{label}</div>
        {description && <div style={s.fieldDesc}>{description}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={s.page}>
      {saved && <div style={s.savedBanner}>✅ Settings saved successfully.</div>}

      <Section title="⏰ Operating Hours">
        <Field label="Opening Hour" description="Court opens at this hour (24h format)">
          <input style={s.input} type="number" min={0} max={23} value={settings.openHour} onChange={e=>update('openHour',Number(e.target.value))} />
        </Field>
        <Field label="Closing Hour" description="24 = midnight">
          <input style={s.input} type="number" min={1} max={24} value={settings.closeHour} onChange={e=>update('closeHour',Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="💰 Pricing">
        <Field label="Price per Hour (₱)" description="Applied to all courts">
          <input style={s.input} type="number" min={0} value={settings.pricePerHour} onChange={e=>update('pricePerHour',Number(e.target.value))} />
        </Field>
        <Field label="Service Fee (%)" description="Added to booking total at checkout">
          <input style={s.input} type="number" min={0} max={100} value={settings.serviceFeePercent} onChange={e=>update('serviceFeePercent',Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="📅 Booking Rules">
        <Field label="Advance Booking Limit (days)" description="How far ahead customers can book">
          <input style={s.input} type="number" min={1} value={settings.advanceBookingDays} onChange={e=>update('advanceBookingDays',Number(e.target.value))} />
        </Field>
        <Field label="Same-day Buffer (hours)" description="Minimum lead time for same-day bookings">
          <input style={s.input} type="number" min={0} value={settings.sameDayBufferHours} onChange={e=>update('sameDayBufferHours',Number(e.target.value))} />
        </Field>
      </Section>
      <Section title="🚫 Cancellation Policy">
        <Field label="Free Cancellation Window (hours)" description="Cancellation is free if done this many hours before start">
          <input style={s.input} type="number" min={0} value={settings.cancellationHours} onChange={e=>update('cancellationHours',Number(e.target.value))} />
        </Field>
        <Field label="Late Cancellation Fee (%)" description="Fee charged for cancellations outside the free window">
          <input style={s.input} type="number" min={0} max={100} value={settings.cancellationFeePercent} onChange={e=>update('cancellationFeePercent',Number(e.target.value))} />
        </Field>
      </Section>

      <button style={s.saveBtn} onClick={save}>💾 Save Settings</button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display:'flex', flexDirection:'column', gap:20, maxWidth:640 },
  savedBanner: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600 },
  section:     { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' },
  sectionTitle:{ fontSize:14, fontWeight:800, color:'#0f172a', padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' },
  sectionBody: { display:'flex', flexDirection:'column', gap:0 },
  field:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid #f8fafc', gap:20 },
  fieldLabel:  { fontSize:13, fontWeight:700, color:'#0f172a' },
  fieldDesc:   { fontSize:11, color:'#94a3b8', marginTop:2 },
  input:       { padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#0f172a', outline:'none', width:120, textAlign:'right' as const },
  saveBtn:     { padding:'12px 28px', background:'#7c3aed', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', alignSelf:'flex-start' },
};
