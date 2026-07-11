import React, { useState } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import type { StaffPage } from '../types';

const LOGO_URI = '/lapickle.png';

const NAV_ITEMS: { id: StaffPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',        icon: '⊞'  },
  { id: 'schedule',  label: 'Schedule',           icon: '📅' },
  { id: 'courts',    label: 'Court Status',      icon: '🏓' },
  { id: 'checkin',   label: 'Response',          icon: '✅' },
  { id: 'players',   label: 'Players',           icon: '👥' },
];

interface Props {
  page: StaffPage;
  onNavigate: (p: StaffPage) => void;
  children: React.ReactNode;
}

export default function StaffLayout({ page, onNavigate, children }: Props) {
  const { user, logout } = useStaffAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initials = (user?.name ?? 'ST')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentNav = NAV_ITEMS.find((n) => n.id === page);

  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={sh.root}>
      {/* ── Sidebar ── */}
      <aside style={{ ...sh.sidebar, width: collapsed ? 60 : 220 }}>
        <div style={sh.brand}>
          <img src={LOGO_URI} alt="PicklePro logo" style={sh.brandLogo} />
          {!collapsed && (
            <div>
              <div style={sh.brandName}>PicklePro</div>
              <div style={sh.brandRole}>Staff Portal</div>
            </div>
          )}
        </div>

        <div style={sh.divider} />

        <nav style={sh.nav} aria-label="Staff navigation">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  ...sh.navBtn,
                  ...(active ? sh.navBtnActive : {}),
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span style={sh.navIcon}>{item.icon}</span>
                {!collapsed && <span style={sh.navLabel}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={sh.sidebarFooter}>
          <div style={sh.divider} />
          {!collapsed && (
            <div style={sh.userRow}>
              <div style={sh.userAvatar}>{initials}</div>
              <div style={sh.userInfo}>
                <div style={sh.userName}>{user?.name}</div>
                <div style={sh.userRole}>Staff</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            style={{ ...sh.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }}
            title="Sign out"
            aria-label="Sign out"
          >
            <span>⏻</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed((v: boolean) => !v)}
          style={sh.collapseBtn}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={sh.main}>
        <header style={sh.topbar}>
          <div style={sh.topbarLeft}>
            <span style={sh.pageIcon}>{currentNav?.icon}</span>
            <h1 style={sh.pageTitle}>{currentNav?.label}</h1>
            <span style={sh.datePill}>
              {formattedDate}
            </span>
          </div>
          <div style={sh.topbarRight}>
            <span style={sh.timePill}>{formattedTime}</span>
            <div style={sh.shiftBadge}>🟢 On Shift</div>
          </div>
        </header>

        <main style={sh.content} role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

const SIDEBAR_BG = '#0f172a';
const SIDEBAR_FG = '#94a3b8';
const ACTIVE_BG  = '#1e293b';
const ACTIVE_FG  = '#ffffff';
const GREEN      = '#16a34a';

const sh: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14, color: '#0f172a', background: '#f8fafc',
  },
  sidebar: {
    background: SIDEBAR_BG, display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    overflowY: 'auto', overflowX: 'hidden', flexShrink: 0,
    transition: 'width 180ms ease', zIndex: 20,
  },
  brand:     { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 14px 16px' },
  brandLogo: { width: 36, height: 36, objectFit: 'contain' as const, flexShrink: 0 },
  brandName: { fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  brandRole: { fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  divider:   { height: 1, background: '#1e293b', margin: '0 12px' },
  nav:       { flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 10px', border: 'none', borderRadius: 8,
    background: 'transparent', color: SIDEBAR_FG,
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    textAlign: 'left', whiteSpace: 'nowrap',
    transition: 'background 140ms, color 140ms',
  },
  navBtnActive: { background: ACTIVE_BG, color: ACTIVE_FG, fontWeight: 700 },
  navIcon:      { fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center' },
  navLabel:     { overflow: 'hidden', textOverflow: 'ellipsis' },
  sidebarFooter:{ padding: '8px 8px 20px', display: 'flex', flexDirection: 'column', gap: 4 },
  userRow:   { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px 6px' },
  userAvatar:{ width: 32, height: 32, borderRadius: '50%', background: GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  userInfo:  { overflow: 'hidden' },
  userName:  { fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:  { fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', border: 'none', borderRadius: 8,
    background: 'transparent', color: '#475569',
    cursor: 'pointer', width: '100%', fontSize: 12, fontWeight: 600,
  },
  collapseBtn: {
    position: 'absolute', top: '50%', right: -12,
    transform: 'translateY(-50%)',
    width: 24, height: 24, borderRadius: '50%',
    background: '#1e293b', color: '#94a3b8', border: '1px solid #334155',
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
  },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
  topbar:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, gap: 12 },
  topbarLeft:{ display: 'flex', alignItems: 'center', gap: 10 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  pageIcon:  { fontSize: 18 },
  pageTitle: { fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 },
  datePill:  { fontSize: 12, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  timePill:  { fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  shiftBadge:{ fontSize: 12, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '4px 12px', borderRadius: 99 },
  content:   { flex: 1, overflowY: 'auto', padding: '24px 28px' },
};
