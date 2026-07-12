import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminPage } from '../types';

const NAV: { id: AdminPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'bookings',  label: 'Bookings',  icon: '📅' },
  { id: 'courts',    label: 'Courts',    icon: '🏓' },
  { id: 'users',     label: 'Users',     icon: '👤' },
  { id: 'staff',     label: 'Staff',     icon: '👷' },
  { id: 'reports',   label: 'Reports',   icon: '📈' },
  { id: 'settings',  label: 'Settings',  icon: '⚙️'  },
];

interface Props {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ page, onNavigate, children }: Props) {
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentNav = NAV.find((n) => n.id === page);
  const initials = (user?.name ?? 'AD').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={sh.root}>
      {/* Sidebar */}
      <aside style={{ ...sh.sidebar, width: collapsed ? 60 : 230 }}>
        <div style={sh.brand}>
          <span style={sh.brandIcon}>🏓</span>
          {!collapsed && (
            <div>
              <div style={sh.brandName}>PicklePro</div>
              <div style={sh.brandRole}>Admin Portal</div>
            </div>
          )}
        </div>
        <div style={sh.divider} />
        <nav style={sh.nav}>
          {NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{ ...sh.navBtn, ...(active ? sh.navBtnActive : {}), justifyContent: collapsed ? 'center' : 'flex-start' }}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span style={sh.navIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={sh.sidebarFooter}>
          <div style={sh.divider} />
          {!collapsed && (
            <div style={sh.userRow}>
              <div style={sh.avatar}>{initials}</div>
              <div>
                <div style={sh.userName}>{user?.name}</div>
                <div style={sh.userRole}>Super Admin</div>
              </div>
            </div>
          )}
          <button onClick={logout} style={{ ...sh.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }} title="Sign out">
            <span>⏻</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
        <button onClick={() => setCollapsed(v => !v)} style={sh.collapseBtn} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <div style={sh.main}>
        <header style={sh.topbar}>
          <div style={sh.topbarLeft}>
            <span style={{ fontSize: 18 }}>{currentNav?.icon}</span>
            <h1 style={sh.pageTitle}>{currentNav?.label}</h1>
            <span style={sh.datePill}>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style={sh.topbarRight}>
            <span style={sh.timePill}>{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span style={sh.adminBadge}>🔐 Super Admin</span>
          </div>
        </header>
        <main style={sh.content}>{children}</main>
      </div>
    </div>
  );
}

const SIDEBAR = '#0f172a';
const ACTIVE  = '#1e293b';
const PURPLE  = '#7c3aed';

const sh: Record<string, React.CSSProperties> = {
  root:        { display: 'flex', minHeight: '100vh', fontFamily: "system-ui, sans-serif", fontSize: 14, color: '#0f172a', background: '#f8fafc' },
  sidebar:     { background: SIDEBAR, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden', flexShrink: 0, transition: 'width 180ms ease', zIndex: 20 },
  brand:       { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 14px 16px' },
  brandIcon:   { fontSize: 26, flexShrink: 0 },
  brandName:   { fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  brandRole:   { fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  divider:     { height: 1, background: '#1e293b', margin: '0 12px' },
  nav:         { flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn:      { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', border: 'none', borderRadius: 8, background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap', transition: 'background 140ms' },
  navBtnActive:{ background: ACTIVE, color: '#fff', fontWeight: 700 },
  navIcon:     { fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center' },
  sidebarFooter:{ padding: '8px 8px 20px', display: 'flex', flexDirection: 'column', gap: 4 },
  userRow:     { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px 6px' },
  avatar:      { width: 32, height: 32, borderRadius: '50%', background: PURPLE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  userName:    { fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:    { fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 },
  logoutBtn:   { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 8, background: 'transparent', color: '#475569', cursor: 'pointer', width: '100%', fontSize: 12, fontWeight: 600 },
  collapseBtn: { position: 'absolute', top: '50%', right: -12, transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
  topbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, gap: 12 },
  topbarLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  pageTitle:   { fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 },
  datePill:    { fontSize: 12, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  timePill:    { fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  adminBadge:  { fontSize: 12, fontWeight: 700, color: '#6d28d9', background: '#ede9fe', padding: '4px 12px', borderRadius: 99 },
  content:     { flex: 1, overflowY: 'auto', padding: '24px 28px' },
};
