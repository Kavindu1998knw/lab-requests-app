import React from 'react';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import {
  FlaskConical,
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, setEditingSample } = useLab();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'samples',
      label: 'Manage Sample',
      icon: FileSpreadsheet,
    },
    {
      id: 'new_sample',
      label: 'Add Sample',
      icon: PlusCircle,
      action: () => setEditingSample(null),
    },
  ];

  return (
    <aside className="sidebar no-print">
      <div>
        <div className="sidebar-header">
          <div className="brand-logo-icon">
            <FlaskConical size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">gsmbLab</span>
            <span className="brand-badge">LIMS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.action) item.action();
                  setActiveTab(item.id);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user-card" style={{ marginBottom: '0.65rem' }}>
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.name || 'Lab Officer'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user?.email || 'officer@gsmb.gov.lk'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            width: '100%',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--accent-rose)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            backgroundColor: 'rgba(244, 63, 94, 0.06)',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-rose)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.06)';
            e.currentTarget.style.color = 'var(--accent-rose)';
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
