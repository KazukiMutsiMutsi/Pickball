import React, { useState } from 'react';
import { STAFF_BOOKINGS, TODAY } from '../data/mock';

interface Player {
  id: string;
  name: string;
  phone: string;
  bookingsToday: number;
  totalBookings: number;
  totalSpent: number;
  lastSeen: string;
}

function buildPlayers(): Player[] {
  const map = new Map<string, Player>();
  STAFF_BOOKINGS.forEach((b) => {
    const existing = map.get(b.playerName);
    if (existing) {
      existing.totalBookings += 1;
      if (b.paid) existing.totalSpent += b.amount;
      if (b.date === TODAY) existing.bookingsToday += 1;
      if (b.date > existing.lastSeen) existing.lastSeen = b.date;
    } else {
      map.set(b.playerName, {
        id:            b.id + '-p',
        name:          b.playerName,
        phone:         b.playerPhone,
        bookingsToday: b.date === TODAY ? 1 : 0,
        totalBookings: 1,
        totalSpent:    b.paid ? b.amount : 0,
        lastSeen:      b.date,
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => b.totalBookings - a.totalBookings);
}

const ALL_PLAYERS = buildPlayers();

export default function StaffPlayers() {
  const [search, setSearch] = useState('');

  const filtered = ALL_PLAYERS.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div style={s.page}>
      <div style={s.infoBox}>
        <span>ℹ️</span>
        <span style={s.infoText}>
          Staff can view player info and today's activity. Player account management is handled by Admin.
        </span>
      </div>

      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          style={s.searchInput}
          aria-label="Search players"
        />
        {search && <button onClick={() => setSearch('')} style={s.clearBtn} aria-label="Clear">✕</button>}
      </div>

      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <h3 style={s.tableTitle}>Players — Today's Activity</h3>
          <span style={s.tableCount}>{filtered.length} player{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Player', 'Phone', "Today's Bookings", 'Total Bookings', 'Total Spent', 'Last Seen'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={s.emptyCell}>No players found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.playerCell}>
                      <div style={s.avatar}>{p.name[0]}</div>
                      <div style={s.playerName}>{p.name}</div>
                    </div>
                  </td>
                  <td style={s.td}>{p.phone}</td>
                  <td style={s.td}>
                    <span style={p.bookingsToday > 0 ? s.activeBadge : s.inactiveBadge}>
                      {p.bookingsToday > 0 ? `${p.bookingsToday} today` : 'None today'}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700 }}>{p.totalBookings}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: '#15803d' }}>₱{p.totalSpent.toLocaleString()}</td>
                  <td style={{ ...s.td, color: '#64748b' }}>{p.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:         { display: 'flex', flexDirection: 'column', gap: 20 },
  infoBox:      { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1e40af' },
  infoText:     { lineHeight: 1.5 },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 16px' },
  searchIcon:   { fontSize: 15, color: '#94a3b8' },
  searchInput:  { flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: 14, color: '#0f172a', background: 'transparent' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14, padding: 4 },
  tableCard:    { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  tableHead:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  tableTitle:   { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 },
  tableCount:   { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
  tableWrap:    { overflowX: 'auto' as const },
  table:        { width: '100%', borderCollapse: 'collapse' as const, minWidth: 640 },
  th:           { padding: '10px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'uppercase' as const, letterSpacing: 0.5, whiteSpace: 'nowrap' as const },
  tr:           { borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '13px 16px', fontSize: 13, color: '#0f172a', verticalAlign: 'middle' as const },
  emptyCell:    { padding: '32px 16px', textAlign: 'center' as const, color: '#94a3b8', fontSize: 13 },
  playerCell:   { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:       { width: 34, height: 34, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  playerName:   { fontWeight: 700 },
  activeBadge:  { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d' },
  inactiveBadge:{ display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b' },
};
