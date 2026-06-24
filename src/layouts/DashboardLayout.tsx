import React, { useState } from 'react';
import { Bell, Inbox, AlertCircle, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: 'inbox' | 'priority';
  onViewChange: (view: 'inbox' | 'priority') => void;
  priorityCount: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeView,
  onViewChange,
  priorityCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (view: 'inbox' | 'priority') => {
    onViewChange(view);
    closeMobileMenu();
  };

  return (
    <div className="dashboard-container">
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMobileMenu}
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={18} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Campus Board</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <button
            onClick={() => handleNavClick('inbox')}
            className="btn btn-ghost"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeView === 'inbox' ? 'var(--primary-light)' : 'transparent',
              color: activeView === 'inbox' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'inbox' ? 600 : 500,
            }}
          >
            <Inbox size={18} />
            <span>All Notifications</span>
          </button>

          <button
            onClick={() => handleNavClick('priority')}
            className="btn btn-ghost"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeView === 'priority' ? 'var(--primary-light)' : 'transparent',
              color: activeView === 'priority' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'priority' ? 600 : 500,
            }}
          >
            <AlertCircle size={18} />
            <span style={{ flexGrow: 1, textAlign: 'left' }}>Priority Inbox</span>
            {priorityCount > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--error)',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '1px 6px',
                minWidth: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {priorityCount}
              </span>
            )}
          </button>
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#CBD5E1',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            NC
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nathishwar C</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Roll: 810423243099</span>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="app-header">
          <button 
            className="btn btn-ghost" 
            onClick={toggleMobileMenu}
            style={{ padding: '6px', borderRadius: 'var(--radius-sm)', display: 'none' }}
          >
            <Menu size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0, letterSpacing: 'normal' }}>
              {activeView === 'priority' ? 'Priority Inbox' : 'All Notifications'}
            </h1>
            {activeView === 'priority' && (
              <span className="badge badge-priority-high" style={{ fontSize: '10px' }}>Urgent Only</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }}></span>
              Connected
            </span>
          </div>
        </header>

        <main className="content-container">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .app-header button {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
